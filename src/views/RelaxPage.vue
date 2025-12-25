<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const gameStore = useGameStore()
const { currentLevel, gameState, timer } = storeToRefs(gameStore)

// SVG Config
const width = 800
const height = 500

// Levels Config
// Path: SVG Path d attribute
// Start: {x, y, w, h}
// End: {x, y, w, h}
// Obstacles: Array of { type: 'circle'|'rect', x, y, r|w|h, animation: 'rotate'|'moveX'|'moveY', speed, range }
const levels = [
    // Level 1: The Winding River
    {
        path: "M 50 400 C 150 400, 150 100, 250 100 S 350 400, 450 400 S 550 100, 650 100 L 750 100",
        strokeWidth: 45,
        start: { x: 20, y: 370, w: 60, h: 60 },
        end: { x: 720, y: 70, w: 60, h: 60 },
        obstacles: [
            // Peak 1 - Wave Motion! (Moves Y, Waves X)
            { type: 'circle', x: 250, y: 100, r: 15, animation: ['moveY', 'wave'], speed: 1, range: 60, waveAxis: 'x', waveAmplitude: 30, waveSpeed: 0.1 },
            // Trough 1 - Orbit
            { type: 'rect', x: 450, y: 400, w: 20, h: 20, animation: ['orbit', 'rotate'], orbitRadius: 60, orbitSpeed: 0.04, rotateSpeed: 5 },
            // Peak 2 - Quadratic-like (Fast Wave)
            { type: 'triangle', x: 550, y: 250, w: 20, h: 20, animation: ['moveY', 'rotate', 'wave'], speed: 1.5, range: 80, rotateSpeed: 3, waveAxis: 'x', waveAmplitude: 50, waveSpeed: 0.05 }
        ]
    },
    // Level 2: The Switchback Laboratory
    {
        path: "M 50 50 L 750 50 L 750 150 L 100 150 L 100 250 L 750 250 L 750 350 L 50 350",
        strokeWidth: 40,
        start: { x: 20, y: 20, w: 60, h: 60 },
        end: { x: 20, y: 320, w: 60, h: 60 },
        obstacles: [
            // Row 1 (y=50): Vertical Chopper (Perpendicular)
            { type: 'rect', x: 400, y: 50, w: 15, h: 40, animation: ['moveY'], speed: 3, range: 40 },
            // Row 2 (y=150): Orbiting Star (Sweeping across)
            { type: 'star', x: 300, y: 150, w: 25, h: 25, animation: ['orbit', 'rotate'], orbitRadius: 50, orbitSpeed: 0.05, rotateSpeed: 5 },
            // Row 3 (y=250): Vertical Bouncer (Perpendicular)
            { type: 'circle', x: 600, y: 250, r: 15, animation: ['moveY'], speed: 4, range: 50 },
            // Row 4 (y=350): Wide Orbit (Sweeping)
            { type: 'triangle', x: 400, y: 350, w: 25, h: 25, animation: ['orbit', 'rotate'], orbitRadius: 60, orbitSpeed: -0.06, rotateSpeed: 8 }
        ]
    },
    // Level 3: Orbital Systems
    {
        path: "M 50 250 C 50 50, 350 50, 350 250 C 350 450, 650 450, 650 250 L 750 250",
        strokeWidth: 45,
        start: { x: 20, y: 220, w: 60, h: 60 },
        end: { x: 720, y: 220, w: 60, h: 60 },
        obstacles: [
            // Left Loop (Center approx 200, 150)
            { type: 'star', x: 200, y: 150, w: 30, h: 30, animation: ['orbit', 'rotate'], orbitRadius: 60, orbitSpeed: 0.03, rotateSpeed: 4 },
            // Right Loop (Center approx 500, 350)
            { type: 'circle', x: 500, y: 350, r: 10, animation: ['orbit'], orbitRadius: 50, orbitSpeed: -0.05 },
            // Center Intersection (350, 250)
            { type: 'rect', x: 350, y: 250, w: 10, h: 80, animation: ['rotate'], rotateSpeed: 1.5 },
            // End Straight (650-750)
            { type: 'triangle', x: 700, y: 250, w: 25, h: 25, animation: ['moveX', 'rotate'], speed: 2, range: 40, rotateSpeed: 5 }
        ]
    },
    // Level 4: Ninja Star Alley
    {
        path: "M 50 450 L 150 100 L 250 400 L 350 100 L 450 400 L 550 100 L 650 400 L 750 100",
        strokeWidth: 40,
        start: { x: 20, y: 420, w: 60, h: 60 },
        end: { x: 720, y: 70, w: 60, h: 60 },
        obstacles: [
            // Zigzag points: (150,100), (250,400), (350,100)...
            // Orbiting around peaks/troughs to block paths
            { type: 'star', x: 150, y: 250, w: 20, h: 20, animation: ['orbit', 'rotate'], orbitRadius: 80, orbitSpeed: 0.05, rotateSpeed: 8 },
            { type: 'star', x: 350, y: 250, w: 20, h: 20, animation: ['orbit', 'rotate'], orbitRadius: 80, orbitSpeed: -0.05, rotateSpeed: 8 },
            // Horizontal Chaos in middle
            { type: 'rect', x: 450, y: 250, w: 15, h: 15, animation: ['moveY', 'moveX', 'rotate'], speed: 5, range: 150, rotateSpeed: 5 },
            // End section
            { type: 'triangle', x: 650, y: 250, w: 25, h: 25, animation: ['orbit'], orbitRadius: 70, orbitSpeed: 0.06 },
            { type: 'circle', x: 550, y: 250, r: 15, animation: ['moveY'], speed: 6, range: 150 }
        ]
    },
    // Level 5: The Melting Pot (Boss Level)
    {
        // Curved Snake Path (Quadratic curves dipping down)
        path: "M 50 50 Q 400 120, 750 50 L 750 150 Q 400 220, 50 150 L 50 250 Q 400 320, 750 250 L 750 350 Q 400 420, 50 350 L 50 450 Q 400 520, 750 450",
        strokeWidth: 40,
        start: { x: 20, y: 20, w: 60, h: 60 },
        end: { x: 700, y: 420, w: 60, h: 60 },
        obstacles: [
            // Wave 1 (y~85): Cycloid Star
            { type: 'star', x: 400, y: 85, w: 30, h: 30, animation: ['moveX', 'orbit', 'rotate'], speed: 2, range: 250, orbitRadius: 40, orbitSpeed: 0.1, rotateSpeed: 5 },
            // Wave 2 (y~185): Sine Wave Circle
            { type: 'circle', x: 400, y: 185, r: 15, animation: ['moveX', 'wave'], speed: 3, range: 250, waveAxis: 'y', waveAmplitude: 30, waveSpeed: 0.2 },
            // Wave 3 (y~285): The Shredder (Rotating Bar)
            { type: 'rect', x: 400, y: 285, w: 20, h: 100, animation: ['rotate', 'moveX'], speed: 1.5, range: 150, rotateSpeed: 4 },
            // Wave 4 (y~385): Fast Triangle Patrol
            { type: 'triangle', x: 400, y: 385, w: 25, h: 25, animation: ['moveX', 'wave'], speed: 4, range: 300, waveAxis: 'y', waveAmplitude: 20, waveSpeed: 0.1 },
            // Wave 5 (y~485): Final Guard
            { type: 'rect', x: 600, y: 460, w: 15, h: 40, animation: ['orbit', 'rotate'], orbitRadius: 50, orbitSpeed: -0.08, rotateSpeed: 6 }
        ]
    }
]

const currentLevelData = computed(() => levels[currentLevel.value - 1] || levels[0])

// Animation Frame for Obstacles
const obstacleState = ref([])
let animationFrame = null

const initObstacles = () => {
    obstacleState.value = (currentLevelData.value.obstacles || []).map(obs => ({
        ...obs,
        currentX: obs.x,
        currentY: obs.y,
        baseX: obs.x, // Track base for patrol
        baseY: obs.y,
        rotation: 0,
        direction: 1,
        angle: 0, // For orbit
        waveAngle: 0, // For wave
    }))
}

const updateObstacles = () => {
    const now = Date.now()
    obstacleState.value.forEach(obs => {
        // Multi-animation support (can move AND rotate)
        if (obs.animation && obs.animation.includes('rotate')) {
            obs.rotation = (obs.rotation + (obs.rotateSpeed || obs.speed)) % 360
        } 
        
        // 1. Update Base Position (Patrol/Linear Movement)
        if (obs.animation && obs.animation.includes('moveX')) {
            obs.baseX += obs.speed * obs.direction
            if (Math.abs(obs.baseX - obs.x) > obs.range) obs.direction *= -1
        } 
        
        if (obs.animation && obs.animation.includes('moveY')) {
            obs.baseY += obs.speed * obs.direction
            if (Math.abs(obs.baseY - obs.y) > obs.range) obs.direction *= -1
        }

        // 2. Calculate Render Position (Apply modifiers to Base)
        obs.currentX = obs.baseX
        obs.currentY = obs.baseY

        // Modifier: Orbit (overrides position relative to base)
        if (obs.animation && obs.animation.includes('orbit')) {
            obs.angle = (obs.angle || 0) + (obs.orbitSpeed || 0.05)
            obs.currentX = obs.baseX + obs.orbitRadius * Math.cos(obs.angle)
            obs.currentY = obs.baseY + obs.orbitRadius * Math.sin(obs.angle)
        }

        // Modifier: Wave (adds sine offset)
        if (obs.animation && obs.animation.includes('wave')) {
            obs.waveAngle = (obs.waveAngle || 0) + (obs.waveSpeed || 0.1)
            const offset = Math.sin(obs.waveAngle) * (obs.waveAmplitude || 20)
            
            if (obs.waveAxis === 'x') {
                obs.currentX += offset
            } else {
                obs.currentY += offset // default wave on Y
            }
        }
    })
    
    // Collision check must happen continuously for moving obstacles even if mouse doesn't move
    // But checking every frame on mouse pos might be expensive. 
    // Optimization: Only check if game is playing.
    if (gameState.value === 'playing') {
       checkCollision(lastMouseX, lastMouseY)
    }
    
    animationFrame = requestAnimationFrame(updateObstacles)
}

watch(currentLevel, () => {
    initObstacles()
})

onMounted(() => {
    gameStore.resetGame() // Reset to Level 1
    initObstacles()
    animationFrame = requestAnimationFrame(updateObstacles)
})

onUnmounted(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    gameStore.stopTimer()
})

// Interaction Logic
let lastMouseX = 0
let lastMouseY = 0

const handleMouseMove = (e) => {
    if (gameState.value !== 'playing' && gameState.value !== 'idle') return
    
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    lastMouseX = x
    lastMouseY = y
    
    checkCollision(x, y)
}

const checkCollision = (x, y) => {
    // 1. Check if over Start Zone (to start game)
    if (gameState.value === 'idle') {
        const start = currentLevelData.value.start
        if (x >= start.x && x <= start.x + start.w && y >= start.y && y <= start.y + start.h) {
            gameStore.startGame()
        }
        return
    }

    if (gameState.value !== 'playing') return

    // 2. Check overlap with Elements
    // Since we are in an SVG, simple point detection can be tricky with vanilla JS logic vs visual logic.
    // The easiest robust way is checking "what element is under point" using document.elementFromPoint
    // But that requires converting relative SVG coords back to screen coords.
    
    // Instead we rely on the event target or use logic. 
    // Logic is better because elementFromPoint might pick the SVG container if path is thin? 
    // Actually path with stroke-width is clickable/hoverable.
    
    // HOWEVER, "stay inside path" usually means "fail if background".
    // SVG Path has complex shapes. "isPointInStroke" is canvas API. SVG has `isPointInFill` but mostly for geometry.
    // Let's use `document.elementFromPoint`! It works great for this.
    
    // Get absolute screen coords
    // (Note: handleMouseMove gives relative, but for elementFromPoint we need clientX/Y)
    // We need to store clientX/Y from the event or approximate.
    // Let's assume the collision check inside animation loop uses last valid clientX/Y.
    // We'll update that in move handler.
}

const cursorX = ref(0)
const cursorY = ref(0)
const cursorVisible = ref(false)
let lastClientX = 0
let lastClientY = 0

const handleScreenMouseMove = (e) => {
    // Update custom cursor pos
    cursorX.value = e.clientX
    cursorY.value = e.clientY
    
    // Check bounds to show/hide cursor inside game area? 
    // Actually we want it everywhere if it replaces system cursor, or just in game.
    // Let's keep it simple: Show custom cursor when hovering the SVG container.
    
    lastClientX = e.clientX
    lastClientY = e.clientY
    
    if (gameState.value === 'idle') {
        const el = document.elementFromPoint(lastClientX, lastClientY)
        if (el && el.classList.contains('start-zone')) {
             gameStore.startGame()
        }
        return
    }
    
    if (gameState.value === 'playing') {
        const el = document.elementFromPoint(lastClientX, lastClientY)
        if (!el) return
        
        if (el.classList.contains('end-zone')) {
            gameStore.completeLevel()
            return
        }
        
        if (el.classList.contains('obstacle')) {
             gameStore.failGame()
             return
        }
        
        if (!el.classList.contains('safe-zone') && !el.classList.contains('start-zone')) {
             gameStore.failGame()
        }
    }
}

const handleMouseEnter = () => {
    cursorVisible.value = true
}

const handleMouseLeave = () => {
    cursorVisible.value = false
    if (gameState.value === 'playing') {
        gameStore.failGame()
    }
}

</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 px-4 flex flex-col items-center">
    
    <!-- Back Button (Exit Fullscreen) -->
    <button 
        @click="router.push('/')" 
        class="fixed top-4 left-4 z-50 p-3 rounded-full bg-white/80 dark:bg-black/50 shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors backdrop-blur-sm group"
        :title="$t('common.back' || 'Back')" 
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600 dark:text-gray-300 group-hover:text-primary-500 transition-colors">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
    </button>
    
    <!-- Custom Cursor -->
    <div 
        v-if="cursorVisible && gameState !== 'idle'"
        class="fixed pointer-events-none z-50 flex items-center justify-center"
        :style="{ left: cursorX + 'px', top: cursorY + 'px', transform: 'translate(-50%, -50%)' }"
    >
        <div class="relative w-3 h-3 flex items-center justify-center">
            <!-- Vermilion Ball Cursor -->
            <div 
                class="w-full h-full rounded-full bg-[#E34234] shadow-sm border border-white/50"
                :class="{ 'scorched-effect': gameState === 'failed' }"
            ></div>
            
            <!-- Smoke Effect on Fail -->
            <div v-if="gameState === 'failed'" class="absolute -top-6 -right-6 text-4xl animate-fade-up opacity-80">
                💨
            </div>
            <div v-if="gameState === 'failed'" class="absolute -top-4 -left-4 text-3xl animate-fade-up opacity-60" style="animation-delay: 0.2s">
                ☁️
            </div>
        </div>
    </div>

    <!-- Header -->
    <div class="text-center mt-3 mb-2">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ t('relax.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ t('relax.instructions') }}</p>
    </div>

    <!-- Info Bar -->
    <div class="flex justify-between w-full max-w-[800px] mb-4 items-center">
        <div class="flex items-center gap-2">
            <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {{ t('relax.level') }}
            </span>
            <select 
                v-model.number="currentLevel" 
                @change="gameStore.retry()"
                class="bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 rounded px-2 py-1 text-indigo-600 dark:text-indigo-400 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
        </div>
        <div class="text-xl font-mono text-gray-800 dark:text-gray-200">
            {{ timer.toFixed(1) }}s
        </div>
    </div>

    <!-- Game Board -->
    <div class="relative bg-gray-900 border-4 border-gray-700 shadow-2xl rounded-lg overflow-hidden">
        <svg 
            :width="width" 
            :height="height" 
            @mousemove="handleScreenMouseMove"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            class="block touch-none"
            :class="{ 'cursor-none': gameState !== 'idle' }"
        >
            <!-- Background -->
            
            <!-- Electric Wall Border (Behind Safe Path) -->
            <path 
                :d="currentLevelData.path" 
                fill="none" 
                stroke="#fde047" 
                :stroke-width="currentLevelData.strokeWidth + 15"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="electric-glow opacity-90"
            />
            
            <!-- Safe Path -->
            <path 
                :d="currentLevelData.path" 
                fill="none" 
                stroke="#374151" 
                :stroke-width="currentLevelData.strokeWidth"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="safe-zone"
            />
            
            <!-- Start Zone -->
            <rect 
                :x="currentLevelData.start.x" 
                :y="currentLevelData.start.y" 
                :width="currentLevelData.start.w" 
                :height="currentLevelData.start.h" 
                class="start-zone fill-green-500/50 stroke-green-500"
                stroke-width="2"
            />
            
            <!-- End Zone -->
            <rect 
                :x="currentLevelData.end.x" 
                :y="currentLevelData.end.y" 
                :width="currentLevelData.end.w" 
                :height="currentLevelData.end.h" 
                class="end-zone fill-red-500/50 stroke-red-500 animate-pulse"
                stroke-width="2"
            />
            
            <!-- Obstacles -->
            <g v-for="(obs, index) in obstacleState" :key="'obs-'+index">
                <!-- Electric Glow Filter could be added here or just CSS shadow on rect? SVG filters are better for internal glow -->
                <rect 
                    v-if="obs.type === 'rect'"
                    :x="obs.currentX" 
                    :y="obs.currentY" 
                    :width="obs.w" 
                    :height="obs.h"
                    :transform="`rotate(${obs.rotation}, ${obs.currentX + obs.w/2}, ${obs.currentY + obs.h/2})`"
                    class="obstacle fill-orange-500 stroke-orange-300"
                />
                <circle 
                    v-if="obs.type === 'circle'"
                    :cx="obs.currentX" 
                    :cy="obs.currentY" 
                    :r="obs.r"
                    class="obstacle fill-orange-500 stroke-orange-300"
                />
                <!-- New Triangle Obstacle -->
                <polygon 
                    v-if="obs.type === 'triangle'"
                    :points="`${obs.currentX},${obs.currentY - obs.h/2} ${obs.currentX - obs.w/2},${obs.currentY + obs.h/2} ${obs.currentX + obs.w/2},${obs.currentY + obs.h/2}`"
                    :transform="`rotate(${obs.rotation}, ${obs.currentX}, ${obs.currentY})`"
                    class="obstacle fill-orange-500 stroke-orange-300"
                />
                <!-- New Star Obstacle -->
                <!-- Simple 5-point star points approximation relative to center -->
                <polygon
                    v-if="obs.type === 'star'"
                    :points="`
                        ${obs.currentX},${obs.currentY - obs.h/2} 
                        ${obs.currentX + obs.w * 0.2},${obs.currentY - obs.h * 0.1} 
                        ${obs.currentX + obs.w/2},${obs.currentY - obs.h * 0.1} 
                        ${obs.currentX + obs.w * 0.25},${obs.currentY + obs.h * 0.15} 
                        ${obs.currentX + obs.w * 0.35},${obs.currentY + obs.h/2} 
                        ${obs.currentX},${obs.currentY + obs.h * 0.25} 
                        ${obs.currentX - obs.w * 0.35},${obs.currentY + obs.h/2} 
                        ${obs.currentX - obs.w * 0.25},${obs.currentY + obs.h * 0.15} 
                        ${obs.currentX - obs.w/2},${obs.currentY - obs.h * 0.1} 
                        ${obs.currentX - obs.w * 0.2},${obs.currentY - obs.h * 0.1}
                    `"
                    :transform="`rotate(${obs.rotation}, ${obs.currentX}, ${obs.currentY})`"
                    class="obstacle fill-orange-500 stroke-orange-300"
                />
            </g>
            
            <!-- Hint Text -->
            <!-- Hint Text & Arrow -->
            <g v-if="gameState === 'idle'" class="animate-bounce-slow origin-center" :style="{ transformBox: 'fill-box' }">
                <!-- Text -->
                <text 
                    :x="currentLevelData.start.x + currentLevelData.start.w/2" 
                    :y="currentLevelData.start.y - 40" 
                    text-anchor="middle"
                    class="fill-white text-sm font-bold pointer-events-none filter drop-shadow-md"
                >
                    {{ t('relax.start_here') }}
                </text>
                <!-- Arrow -->
                <path
                    d="M0,0 L10,0 L5,8 Z"
                    fill="#ec4899"
                    :transform="`translate(${currentLevelData.start.x + currentLevelData.start.w/2 - 5}, ${currentLevelData.start.y - 35})`"
                    class="drop-shadow-md"
                />
            </g>
            
        </svg>
        
        <!-- Overlays -->
        <div v-if="gameState === 'failed' || gameState === 'victory'" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 pointer-events-auto cursor-default">
            <h2 
                class="text-5xl font-bold mb-4"
                :class="gameState === 'victory' ? 'text-green-400' : 'text-red-500'"
            >
                {{ gameState === 'victory' ? t('relax.victory') : t('relax.failed') }}
            </h2>
            
            <button 
                 @click="gameState === 'victory' ? gameStore.resetGame() : gameStore.retry()"
                 class="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
                {{ gameState === 'victory' ? t('relax.play_again') : t('relax.retry') }}
            </button>
        </div>
    </div>

  </div>
</template>

<style scoped>
.safe-zone {
    stroke: #374151;
    /* remove cursor: crosshair since we have custom cursor */
}

.safe-zone, .start-zone, .end-zone, .obstacle {
    pointer-events: auto; 
}

/* Electric Effect */
.electric-glow {
    /* Stronger base glow */
    filter: drop-shadow(0 0 10px #fde047) drop-shadow(0 0 20px #eab308);
    /* Slower, smoother animation for less flicker */
    animation: pulse-electric 1.5s ease-in-out infinite alternate;
}

@keyframes pulse-electric {
    0% {
        stroke: #fde047; /* Yellow */
        /* Strong glow */
        filter: drop-shadow(0 0 4px #fde047) drop-shadow(0 0 10px #eab308);
        opacity: 0.85;
    }
    100% {
        stroke: #fef08a; /* Lighter Yellow */
        /* Intense glow */
        filter: drop-shadow(0 0 8px #fde047) drop-shadow(0 0 15px #eab308);
        opacity: 1;
    }
}

/* Cursor Animations */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px) rotate(-10deg); }
  75% { transform: translateX(5px) rotate(10deg); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes fade-up {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
}

.animate-fade-up {
    animation: fade-up 1s ease-out infinite;
}

.animate-bounce-slow {
    animation: bounce 1.5s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-10%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.scorched-effect {
    /* More intense burnt look: darker, higher contrast, red/orange glow */
    filter: grayscale(100%) brightness(30%) sepia(100%) hue-rotate(-40deg) saturate(800%) contrast(1.5) drop-shadow(0 0 10px rgba(255, 69, 0, 0.8));
    /* Violent shake */
    animation: shake 0.2s ease-in-out infinite;
}
</style>
