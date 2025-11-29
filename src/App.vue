<script setup>
import { RouterView } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 bg-cover bg-fixed bg-center relative" style="background-image: url('https://images.unsplash.com/photo-1497032628150-a97cdac9b361?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');">
    <!-- Overlay for better readability -->
    <div class="absolute inset-0 bg-white/80 z-0 pointer-events-none fixed"></div>
    
    <div class="relative z-10">
      <TheHeader />
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
/* Global styles can go here or in style.css */
</style>
