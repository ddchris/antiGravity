<script setup>
import { RouterView, useRoute } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
import { useViewport } from './composables/useViewport'

const route = useRoute()

// 初始化 Viewport Height Fix (解決 Mobile 100vh 問題)
useViewport()
</script>

<template>
  <!-- 全域半透明遮罩 - 提升背景圖與內容的融合度 -->
  <div class="fixed inset-0 bg-white/70 dark:bg-black/70 z-[-1] pointer-events-none transition-colors"></div>
    
  <div class="relative z-10 min-h-screen-safe">
    <TheHeader v-if="route.path !== '/relax'" />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Global styles can go here or in style.css */
</style>
