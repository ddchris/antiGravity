<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useThemeStore } from '../stores/themeStore'
import { useI18n } from 'vue-i18n'

// 導入購物車 store 以讀取總數量
const cartStore = useCartStore()
const themeStore = useThemeStore()
const { locale } = useI18n()

// 切換語系
const changeLocale = (newLocale) => {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}
</script>

<template>
  <header class="fixed top-0 left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md z-50 transition-colors">
    <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
      <!-- Logo / Brand Name -->
      <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
        <RouterLink to="/">{{ $t('header.brand') }}</RouterLink>
      </div>

      <!-- Navigation Links & Controls -->
      <div class="flex items-center space-x-6">
        <!-- 導航連結 -->
        <RouterLink
          to="/"
          class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          active-class="text-indigo-600 dark:text-indigo-400 font-bold"
        >
          {{ $t('header.products') }}
        </RouterLink>
        <RouterLink
          to="/contact"
          class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          active-class="text-indigo-600 dark:text-indigo-400 font-bold"
        >
          {{ $t('header.contact') }}
        </RouterLink>
        
        <!-- 購物車連結 - 帶有數量角標 -->
        <RouterLink
          to="/cart"
          class="relative inline-block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
          active-class="text-indigo-600 dark:text-indigo-400 font-bold"
        >
          {{ $t('header.cart') }}
          <!-- 數量角標 - 只在有商品時顯示 -->
          <span 
            v-if="cartStore.totalQuantity > 0"
            class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center font-bold"
          >
            {{ cartStore.totalQuantity }}
          </span>
        </RouterLink>

        <!-- 語系切換 -->
        <select 
          v-model="locale" 
          @change="changeLocale(locale)"
          class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm"
        >
          <option value="zh-TW">🇹🇼 中文</option>
          <option value="en">🇺🇸 English</option>
          <option value="ja">🇯🇵 日本語</option>
          <option value="ko">🇰🇷 한국어</option>
        </select>

        <!-- 深色模式切換 -->
        <button
          @click="themeStore.toggleTheme"
          class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          :title="themeStore.isDark ? '切換到淺色模式' : '切換到深色模式'"
        >
          <span v-if="themeStore.isDark" class="text-2xl">☀️</span>
          <span v-else class="text-2xl">🌙</span>
        </button>
      </div>
    </nav>
  </header>
  <!-- Spacer to prevent content from being hidden behind fixed header -->
  <div class="h-16"></div>
</template>

<style scoped>
/* Scoped styles if needed, but Tailwind handles most */
</style>
