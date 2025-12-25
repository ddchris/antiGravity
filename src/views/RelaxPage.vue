<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useI18n()
const gameStore = useGameStore()
const { currentLevel, gameState, timer, deathCount } = storeToRefs(gameStore)

const playerName = ref('')
const currentView = ref('game') // 'game' | 'leaderboard'

const startMessageVisible = ref(false)

watch(gameState, (newVal, oldVal) => {
    if (newVal === 'playing' && oldVal === 'idle') {
        startMessageVisible.value = true
        setTimeout(() => {
            startMessageVisible.value = false
        }, 1500)
    }
})

const submitScore = () => {
    if (!playerName.value.trim()) return
    gameStore.saveScore(playerName.value)
    currentView.value = 'leaderboard'
}

const switchTab = (tab) => {
    currentView.value = tab
}

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
        start: { x: 20, y: 320, w: 60, h: 60 },
        end: { x: 20, y: 20, w: 60, h: 60 },
        obstacles: [
            // Row 1 (y=50): Vertical Chopper (Perpendicular)
            { type: 'rect', x: 400, y: 50, w: 15, h: 40, animation: ['moveY'], speed: 3, range: 40 },
            // Row 2 (y=150): Orbiting Star (Sweeping across)
            { type: 'star', x: 300, y: 150, w: 25, h: 25, animation: ['orbit', 'rotate'], orbitRadius: 50, orbitSpeed: 0.05, rotateSpeed: 5 },
            // Row 3 (y=250): Vertical Bouncer (Perpendicular)
            { type: 'circle', x: 600, y: 250, r: 15, animation: ['moveY'], speed: 4, range: 50 },
            // Row 3.5 (y=300): Horizontal Patroller
            { type: 'rect', x: 200, y: 300, w: 20, h: 20, animation: ['moveX'], speed: 2, range: 60 },
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
            { type: 'circle', x: 200, y: 150, r: 10, animation: ['orbit'], orbitRadius: 40, orbitSpeed: -0.05 }, // Added
            
            // Right Loop (Center approx 500, 350)
            { type: 'circle', x: 500, y: 350, r: 10, animation: ['orbit'], orbitRadius: 50, orbitSpeed: -0.05 },
            { type: 'star', x: 500, y: 350, w: 25, h: 25, animation: ['orbit', 'rotate'], orbitRadius: 70, orbitSpeed: 0.04, rotateSpeed: -5 }, // Added
            
            // Center Intersection (350, 250)
            { type: 'rect', x: 350, y: 250, w: 10, h: 80, animation: ['rotate'], rotateSpeed: 1.5 },
            
            // End Straight (650-750)
            { type: 'triangle', x: 700, y: 250, w: 25, h: 25, animation: ['moveX', 'rotate'], speed: 2, range: 40, rotateSpeed: 5 },
            { type: 'rect', x: 600, y: 250, w: 15, h: 60, animation: ['moveY'], speed: 1, range: 30 } // Added
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
            { type: 'circle', x: 250, y: 400, r: 10, animation: ['orbit'], orbitRadius: 40, orbitSpeed: -0.06 }, // Added
            
            { type: 'star', x: 350, y: 250, w: 20, h: 20, animation: ['orbit', 'rotate'], orbitRadius: 80, orbitSpeed: -0.05, rotateSpeed: 8 },
            { type: 'circle', x: 350, y: 100, r: 10, animation: ['orbit'], orbitRadius: 40, orbitSpeed: 0.06 }, // Added

            // Horizontal Chaos in middle
            { type: 'rect', x: 450, y: 250, w: 15, h: 15, animation: ['moveY', 'moveX', 'rotate'], speed: 5, range: 150, rotateSpeed: 5 },
            { type: 'rect', x: 250, y: 250, w: 15, h: 15, animation: ['moveY'], speed: 3, range: 80 }, // Added
            
            // End section
            { type: 'triangle', x: 650, y: 250, w: 25, h: 25, animation: ['orbit'], orbitRadius: 70, orbitSpeed: 0.06 },
            { type: 'circle', x: 550, y: 250, r: 15, animation: ['moveY'], speed: 6, range: 150 },
            { type: 'triangle', x: 750, y: 100, w: 20, h: 20, animation: ['rotate', 'moveY'], speed: 2, range: 50, rotateSpeed: 10 } // Added
        ]
    },
    // Level 5: The Galaxy Core (Boss Level)
    {
        // "The Infinity Loop" - A compact, high-density challenge
        // Path: Start Top-Left, Loop Center, Loop Right, End Top-Right
        path: "M 50 150 C 50 50, 300 50, 400 250 C 500 450, 750 450, 750 250 C 750 50, 500 50, 400 250 C 300 450, 50 450, 50 350",
        strokeWidth: 45,
        start: { x: 20, y: 120, w: 60, h: 60 },
        end: { x: 20, y: 320, w: 60, h: 60 },
        obstacles: [
            // 1. The Gatekeeper (Spinning Bar at entry)
            // Reduced speed: 2 -> 1.5
            { type: 'rect', x: 200, y: 150, w: 15, h: 120, animation: ['rotate', 'moveY'], rotateSpeed: 1.5, speed: 1.5, range: 60 },
            
            // 2. The Left Loop System (x=200, y=250)
            // Reduced orbitSpeed: 0.05/0.06 -> 0.03/0.04
            { type: 'circle', x: 200, y: 250, r: 8, animation: ['orbit'], orbitRadius: 80, orbitSpeed: -0.04 },
            { type: 'circle', x: 200, y: 250, r: 8, animation: ['orbit'], orbitRadius: 100, orbitSpeed: 0.03 },

            // 3. The Black Hole (Center x=400, y=250)
            // Reduced speeds: rotate -5 -> -3, orbit 0.08 -> 0.05
            { type: 'star', x: 400, y: 250, w: 40, h: 40, animation: ['rotate'], rotateSpeed: -3 },
            { type: 'circle', x: 400, y: 250, r: 10, animation: ['orbit'], orbitRadius: 60, orbitSpeed: 0.05 },
            { type: 'circle', x: 400, y: 250, r: 10, animation: ['orbit'], orbitRadius: 60, orbitSpeed: 0.05, angle: 3.14 }, 
            
            // 4. Comet Shower (Right Loop x=600, y=250)
            // Reduced speeds significantly
            { type: 'triangle', x: 600, y: 250, w: 25, h: 25, animation: ['orbit', 'rotate'], orbitRadius: 140, orbitSpeed: -0.02, rotateSpeed: 4 },
            { type: 'triangle', x: 600, y: 250, w: 25, h: 25, animation: ['orbit', 'rotate'], orbitRadius: 160, orbitSpeed: 0.025, rotateSpeed: 4 },
            // Removed one triangle as requested

            // 5. Far Right Sentinel (Far Right Turn x=750, y=250)
            // Reduced speed 1.5 -> 1.2
            { type: 'rect', x: 750, y: 250, w: 15, h: 50, animation: ['moveY', 'rotate'], speed: 1.2, range: 40, rotateSpeed: 2 },

            // 6. The Crusher (Final Stretch x=200, y=350)
            // Reduced speed 1.5 -> 1.2
            { type: 'rect', x: 200, y: 350, w: 15, h: 100, animation: ['moveY', 'rotate'], speed: 1.2, range: 80, rotateSpeed: 1 }
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

const getStarPoints = (cx, cy, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes
    let str = ""

    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius
        y = cy + Math.sin(rot) * outerRadius
        str += `${x},${y} `
        rot += step

        x = cx + Math.cos(rot) * innerRadius
        y = cy + Math.sin(rot) * innerRadius
        str += `${x},${y} `
        rot += step
    }
    return str
}

// Animation Abstracter
const getNextPosition = (obs) => {
    // Rotation
    if (obs.animation && obs.animation.includes('rotate')) {
        obs.rotation = (obs.rotation + (obs.rotateSpeed || obs.speed || 1)) % 360
    } 
    
    // 1. Update Base Position
    if (obs.animation && obs.animation.includes('moveX')) {
        obs.baseX += obs.speed * obs.direction
        if (Math.abs(obs.baseX - obs.x) > obs.range) obs.direction *= -1
    } 
    
    if (obs.animation && obs.animation.includes('moveY')) {
        obs.baseY += obs.speed * obs.direction
        if (Math.abs(obs.baseY - obs.y) > obs.range) obs.direction *= -1
    }

    // 2. Base -> Current
    let nextX = obs.baseX
    let nextY = obs.baseY

    // Modifier: Orbit
    if (obs.animation && obs.animation.includes('orbit')) {
        obs.angle = (obs.angle || 0) + (obs.orbitSpeed || 0.05)
        nextX = obs.baseX + obs.orbitRadius * Math.cos(obs.angle)
        nextY = obs.baseY + obs.orbitRadius * Math.sin(obs.angle)
    }

    // Modifier: Wave
    if (obs.animation && obs.animation.includes('wave')) {
        obs.waveAngle = (obs.waveAngle || 0) + (obs.waveSpeed || 0.1)
        const offset = Math.sin(obs.waveAngle) * (obs.waveAmplitude || 20)
        
        if (obs.waveAxis === 'x') {
            nextX += offset
        } else {
            nextY += offset
        }
    }
    
    obs.currentX = nextX
    obs.currentY = nextY
}

const updateObstacles = () => {
    obstacleState.value.forEach(obs => {
        getNextPosition(obs)
    })
    
    // Optimization: Check dynamic obstacles every frame (Math-based)
    if (gameState.value === 'playing') {
       checkObstacleCollision(cursorX.value, cursorY.value)
    }
    
    animationFrame = requestAnimationFrame(updateObstacles)
}

watch(currentLevel, () => {
    initObstacles()
})

onMounted(() => {
    gameStore.resetGame() 
    initObstacles()
    animationFrame = requestAnimationFrame(updateObstacles)
})

onUnmounted(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
    gameStore.stopTimer()
})

// Math-based Collision for Moving Objects (Faster than ElementFromPoint)
// SVG Ref
const svgRef = ref(null)

// Math-based Collision for Moving Objects (Faster than ElementFromPoint)
const checkObstacleCollision = (mx, my) => {
    if (!svgRef.value) return
    
    const rect = svgRef.value.getBoundingClientRect()
    
    // Convert Screen Coords (mx, my) to SVG Local Coords (lx, ly)
    // Scale factor is (800 / rect.width) in case of CSS resizing
    const scaleX = 800 / rect.width
    const scaleY = 500 / rect.height
    
    const lx = (mx - rect.left) * scaleX
    const ly = (my - rect.top) * scaleY
    
    // Check if cursor is roughly inside the game board first (optional but good sanity check)
    if (lx < 0 || lx > 800 || ly < 0 || ly > 500) return

    const cursorRadius = 6 // approx radius of cursor ball
    
    for (const obs of obstacleState.value) {
        // Simple bounding box/circle check
        // For rect:
        if (obs.type === 'rect') {
             // Precise Oriented Bounding Box (OBB) Check
             // 1. Translate point to local rect space (origin at rect center)
             const cx = obs.currentX + obs.w / 2
             const cy = obs.currentY + obs.h / 2
             const dx = lx - cx
             const dy = ly - cy
             
             // 2. Rotate point opposite to rect rotation to align axes
             const rad = -obs.rotation * (Math.PI / 180)
             const localX = dx * Math.cos(rad) - dy * Math.sin(rad)
             const localY = dx * Math.sin(rad) + dy * Math.cos(rad)
             
             // 3. AABB Check with Cursor Radius Buffer
             // Using simpler box check is often enough (localX within w/2, localY within h/2)
             // Adding cursorRadius to bounds creates a "rounded box" hit area which feels fair
             if (Math.abs(localX) < (obs.w / 2 + cursorRadius * 0.6) && 
                 Math.abs(localY) < (obs.h / 2 + cursorRadius * 0.6)) {
                 gameStore.failGame()
                 return
             }
        } else {
            // Circle / Star / Triangle -> Use Circle Approx
            let r = obs.r || (obs.w / 2)
            const dist = Math.hypot(lx - obs.currentX, ly - obs.currentY)
            if (dist < (r + cursorRadius * 0.8)) {
                gameStore.failGame()
                return
            }
        }
    }
}

// Interaction Logic
const cursorX = ref(0)
const cursorY = ref(0)
const cursorVisible = ref(false)

const handleScreenMouseMove = (e) => {
    cursorX.value = e.clientX
    cursorY.value = e.clientY
    
    if (gameState.value === 'idle') {
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (el && el.classList.contains('start-zone')) {
             gameStore.startGame()
        }
        return
    }
    
    if (gameState.value === 'playing') {
        // Static Environment Check (Walls/Path) - Only on Move
        const el = document.elementFromPoint(e.clientX, e.clientY)
        if (!el) return // Off screen?
        
        if (el.classList.contains('end-zone')) {
            gameStore.completeLevel()
            return
        }
        
        // Safety Check: Must be on Safe Zone or Start Zone
        // If we hit background (SVG element?) or anything NOT safe/start/end
        // Note: elementFromPoint returns the top-most. 
        // If custom cursor is pointer-events-none, we hit the SVG contents.
        // Safe Zone path is on top of electric bg?
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

    <!-- Header & Tabs Container -->
    <div class="flex flex-col md:flex-row justify-between items-center w-full max-w-[800px] mt-2 mb-4 gap-4">
        <!-- Title & Instructions -->
        <div class="text-left pl-5">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ t('relax.title') }}</h1>
            <p class="text-gray-600 dark:text-gray-400 text-sm hidden md:block">{{ t('relax.instructions') }}</p>
        </div>

        <!-- Tab Switcher -->
        <div class="flex gap-2 bg-white/50 dark:bg-gray-800/50 p-1 rounded-full backdrop-blur-sm shadow-sm">
            <button 
                @click="switchTab('game')"
                class="px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 transform"
                :class="currentView === 'game' 
                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'"
            >
                {{ t('relax.tab_game') }}
            </button>
            <button 
                @click="switchTab('leaderboard')"
                class="px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-300 transform"
                :class="currentView === 'leaderboard' 
                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'"
            >
                {{ t('relax.tab_leaderboard') }}
            </button>
        </div>
    </div>

    <!-- View: Game -->
    <div v-show="currentView === 'game'" class="flex flex-col items-center w-full">
        <!-- Info Bar -->
        <div v-if="gameState !== 'name_input'" class="flex justify-between w-full max-w-[800px] mb-4 items-center animate-fade-in-down">
            <div class="flex items-center gap-2">
                <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {{ t('relax.level') }} {{ currentLevel }}
                </span>
            </div>
            <div class="flex items-center gap-4 text-xl font-mono text-gray-800 dark:text-gray-200">
                <span class="text-red-500 font-bold flex items-center gap-1" :title="t('relax.total_deaths')">
                    ☠️ {{ deathCount }}
                </span>
                <span>
                    {{ timer.toFixed(1) }}s
                </span>
            </div>
        </div>

        <!-- Game Board -->
        <div 
            v-if="gameState !== 'name_input'"
            class="relative bg-gray-900 border-4 border-gray-700 shadow-2xl rounded-lg overflow-hidden animate-fade-in-down"
            :style="{ 
                cursor: gameState !== 'idle' ? 'none' : 'default',
                userSelect: 'none',
                WebkitUserSelect: 'none'
            }"
        >
            <svg 
                ref="svgRef"
                :width="width" 
                :height="height" 
                @mousemove="handleScreenMouseMove"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
                class="block touch-none"
                :style="{ cursor: gameState !== 'idle' ? 'none' : 'default' }"
            >
                <!-- Background -->
                
                <!-- Electric Wall Border (Behind Safe Path) -->
                <path 
                    :d="currentLevelData.path" 
                    fill="none" 
                    stroke="#86efac" 
                    :stroke-width="currentLevelData.strokeWidth + 15"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="electric-glow opacity-80"
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
                    class="start-zone fill-yellow-300/50 stroke-yellow-500"
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
                    <polygon
                        v-if="obs.type === 'star'"
                        :points="getStarPoints(obs.currentX, obs.currentY, 5, obs.w/2, obs.w*0.2)"
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
            
            <!-- Start Notification -->
            <div v-if="startMessageVisible" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <h1 class="text-3xl md:text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce-slow">
                    {{ t('relax.game_start') }}
                </h1>
            </div>

            <!-- Overlays -->
            <div v-if="gameState === 'failed' || gameState === 'victory' || gameState === 'leaderboard'" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 pointer-events-auto cursor-default">
            <h2 
                v-if="gameState !== 'leaderboard'"
                class="text-5xl font-bold mb-4"
                :class="gameState === 'victory' ? 'text-green-400' : 'text-red-500'"
            >
                {{ gameState === 'victory' ? t('relax.victory') : t('relax.failed') }}
            </h2>
            <h2 v-else class="text-4xl font-bold mb-8 text-indigo-400">
                {{ t('relax.tab_leaderboard') }}
            </h2>
            
            <!-- Normal Retry/Next (Hidden if game complete logic takes over via gameState change) -->
            <button 
                 v-if="gameState === 'failed'"
                 @click="gameStore.retry()"
                 class="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
                {{ t('relax.retry') }}
            </button>
            
            <!-- Restart from Game Tab if finished -->
            <button 
                 v-if="gameState === 'leaderboard'"
                 @click="gameStore.resetGame()"
                 class="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
            >
                {{ t('relax.play_again') }}
            </button>
        </div>
        </div>

        <!-- Name Input Screen -->
        <div v-if="gameState === 'name_input'" class="w-full max-w-[500px] bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl animate-fade-up">
            <h2 class="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
                 🏆 {{ t('relax.victory') }}
            </h2>
            <div class="mb-6 text-center">
                <p class="text-gray-600 dark:text-gray-400 mb-2">{{ t('relax.total_time') }}</p>
                <p class="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {{ gameStore.levelTimes.reduce((a,b)=>a+b, 0).toFixed(1) }}s
                </p>
            </div>
            
            <input 
                v-model="playerName"
                type="text" 
                :placeholder="t('relax.enter_name')"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-lg mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                @keyup.enter="submitScore"
            />
            
            <button 
                @click="submitScore"
                class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-lg"
            >
                {{ t('relax.submit_score') }}
            </button>
        </div>
    </div>

    <!-- View: Leaderboard -->
    <div v-show="currentView === 'leaderboard'" class="w-full max-w-[800px] bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl animate-fade-up">
        <!-- Leaderboard List -->
        <div class="w-full">
            <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center justify-between">
                <span>🏅 {{ t('relax.leaderboard') }}</span>
            </h2>
            
            <div class="overflow-y-auto max-h-[400px]">
                <table class="w-full text-left">
                    <thead class="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 sticky top-0">
                        <tr>
                            <th class="p-3 rounded-tl-lg">#</th>
                            <th class="p-3">{{ t('relax.name') }}</th>
                            <th class="p-3">{{ t('relax.total_time') }}</th>
                            <!-- Expanded details can be shown on hover or expand, keeping it simple for now -->
                        </tr>
                    </thead>
                    <tbody class="text-gray-700 dark:text-gray-200">
                        <tr 
                            v-for="(entry, idx) in gameStore.leaderboard" 
                            :key="idx" 
                            class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            :class="{'bg-yellow-50 dark:bg-yellow-900/20': idx === 0, 'bg-gray-50 dark:bg-gray-800': idx % 2 === 1}"
                        >
                            <td class="p-3 font-mono font-bold" :class="{'text-yellow-500': idx === 0, 'text-gray-400': idx > 2}">
                                {{ idx + 1 }}
                            </td>
                            <td class="p-3 font-bold">{{ entry.name }}</td>
                            <td class="p-3 font-mono">
                                {{ entry.totalTime.toFixed(1) }}s
                                <div class="text-xs text-gray-400 flex gap-2 mt-1">
                                    <span v-for="(t, i) in entry.levelTimes" :key="i">
                                        L{{i+1}}:{{t}}s
                                    </span>
                                    <span v-if="entry.deathCount !== undefined" class="text-red-400 font-bold ml-2">
                                        ☠️ {{ entry.deathCount }}
                                    </span>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="gameStore.leaderboard.length === 0">
                            <td colspan="3" class="p-8 text-center text-gray-400">
                                No records yet. Be the first!
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
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
    /* Static soft glow, single layer to reduce rendering load and flicker */
    filter: drop-shadow(0 0 5px #86efac);
    /* Very slow, subtle breathing effect */
    animation: pulse-electric 4s ease-in-out infinite alternate;
}

@keyframes pulse-electric {
    0% {
        stroke: #86efac;
        opacity: 0.8;
    }
    100% {
        stroke: #bbf7d0;
        opacity: 0.9; /* Minimal opacity shift */
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
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
}

.animate-fade-up {
    animation: fade-up 0.5s ease-out forwards;
}

@keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-down {
    animation: fadeInDown 0.5s ease-out;
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
