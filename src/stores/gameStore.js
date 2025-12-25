import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  // State
  const currentLevel = ref(1)
  const gameState = ref('idle') // idle, playing, failed, victory
  const timer = ref(0)
  const maxLevels = 5
  
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
    stopTimer()
    // Optional: Trigger vibration or sound here if we had utils for it
  }

  const completeLevel = () => {
    if (gameState.value !== 'playing') return
    stopTimer()
    
    if (currentLevel.value < maxLevels) {
        // Next Level auto-load or show modal? 
        // Let's just go straight to next level for now or let UI handle the transition
        currentLevel.value++
        gameState.value = 'idle' // Waiting for user to enter start zone of new level
    } else {
        gameState.value = 'victory'
    }
  }

  const retry = () => {
    gameState.value = 'idle'
    stopTimer()
    timer.value = 0
  }
  
  const resetGame = () => {
      currentLevel.value = 1
      retry()
  }

  return {
    currentLevel,
    gameState,
    timer,
    startGame,
    failGame,
    completeLevel,
    retry,
    resetGame,
    stopTimer
  }
})
