<script setup>
import { RouterView } from 'vue-router'
import TheHeader from './components/TheHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader />
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Global styles can go here or in style.css */
</style>
