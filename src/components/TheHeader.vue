<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
      <!-- Logo / Brand Name -->
      <div class="text-2xl font-bold text-indigo-600">
        <RouterLink to="/">Antigravity Store</RouterLink>
      </div>

      <!-- Navigation Links -->
      <div class="space-x-6">
        <RouterLink
          to="/"
          class="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          active-class="text-indigo-600 font-bold"
        >
          商品導覽
        </RouterLink>
        <RouterLink
          to="/contact"
          class="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          active-class="text-indigo-600 font-bold"
        >
          聯絡我們
        </RouterLink>
        <RouterLink
          to="/cart"
          class="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          active-class="text-indigo-600 font-bold"
        >
          購物車
        </RouterLink>
      </div>
    </nav>
  </header>
  <!-- Spacer to prevent content from being hidden behind fixed header -->
  <div class="h-16"></div>
</template>

<style scoped>
/* Scoped styles if needed, but Tailwind handles most */
</style>
