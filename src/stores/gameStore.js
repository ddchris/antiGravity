import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  // State
  const currentLevel = ref(1)
  const gameState = ref('idle') // idle, playing, failed, victory, name_input, leaderboard
  const timer = ref(0)
  const maxLevels = 5
  
  const levelTimes = ref([]) // Stores time for each level (index 0 = level 1)
  const leaderboard = ref(JSON.parse(localStorage.getItem('wireLoopLeaderboard') || '[]').filter(entry => entry.deathCount !== undefined))
  const deathCount = ref(0)

  let timerInterval = null

  // Actions
  const startGame = () => {
    gameState.value = 'playing'
    timer.value = 0
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
        timer.value += 0.1
    }, 100)
  }

  const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = null
  }

  const failGame = () => {
    if (gameState.value !== 'playing') return
    gameState.value = 'failed'
    deathCount.value++
    stopTimer()
  }

  const completeLevel = () => {
    if (gameState.value !== 'playing') return
    stopTimer()
    
    // Record Time for current level
    // currentLevel is 1-based, array is 0-based
    levelTimes.value[currentLevel.value - 1] = parseFloat(timer.value.toFixed(1))

    if (currentLevel.value < maxLevels) {
        currentLevel.value++
        gameState.value = 'idle' 
    } else {
        // All levels done!
        gameState.value = 'victory' // Show 'You Win' briefly, then Name Input? 
        // Or go straight to Name Input? The user said "After completing all, enter name"
        // Let's go to 'name_input' directly or show a victory screen that transitions to it.
        // User request: "Enter name... then leaderboard"
        gameState.value = 'name_input'
    }
  }

  const saveScore = (playerName) => {
      const totalTime = levelTimes.value.reduce((a, b) => a + (b || 0), 0)
      const record = {
          name: playerName || 'Anonymous',
          totalTime: parseFloat(totalTime.toFixed(1)),
          levelTimes: [...levelTimes.value],
          deathCount: deathCount.value,
          date: new Date().toISOString()
      }
      
      leaderboard.value.push(record)
      // Sort by totalTime ascending (lower is better)
      leaderboard.value.sort((a, b) => a.totalTime - b.totalTime)
      
      localStorage.setItem('wireLoopLeaderboard', JSON.stringify(leaderboard.value))
      gameState.value = 'leaderboard'
  }

  const retry = () => {
    // If failed, retry current level. Timer resets.
    gameState.value = 'idle'
    stopTimer()
    timer.value = 0
  }
  
  const resetGame = () => {
      currentLevel.value = 1
      levelTimes.value = []
      deathCount.value = 0
      retry()
  }

  return {
    currentLevel,
    gameState,
    timer,
    levelTimes,
    leaderboard,
    deathCount,
    startGame,
    failGame,
    completeLevel,
    retry,
    resetGame,
    stopTimer,
    saveScore
  }
})
