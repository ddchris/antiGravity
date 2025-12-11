import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 從 localStorage 讀取，若無設定則預設為深色 (light 以外皆視為 dark)
  const isDark = ref(localStorage.getItem('theme') !== 'light')

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    updateThemeClass()
  }

  const updateThemeClass = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // 初始化時設定 class
  updateThemeClass()

  return {
    isDark,
    toggleTheme
  }
})
