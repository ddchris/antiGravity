<script setup>
import { RouterView } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
</script>

<template>
  <!-- 全域半透明遮罩 - 提升背景圖與內容的融合度 -->
  <div class="fixed inset-0 bg-white/70 dark:bg-black/70 z-[-1] pointer-events-none transition-colors"></div>
    
  <div class="relative z-10 min-h-screen">
    <TheHeader />
    <main class="container mx-auto px-4 py-8">
      <!-- 內容容器 - 半透明背景提升閱讀性 -->
      <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-colors">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style>
/* Global styles can go here or in style.css */
</style>
