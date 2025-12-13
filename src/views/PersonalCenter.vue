<script setup>
import { navItems } from '../router/personalCenterRoutes'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { onMounted, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// If not logged in, redirect home
onMounted(() => {
  if (!authStore.isAuthenticated && authStore.isInitialized) {
    router.push('/')
  }
})

watch(() => authStore.isAuthenticated, (val) => {
  if (!val && authStore.isInitialized) router.push('/')
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 mt-20 min-h-[calc(100vh-80px)]">
    <div class="flex flex-col md:flex-row gap-6">
      
      <!-- Sidebar -->
      <aside class="w-full md:w-64 flex-shrink-0">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-24">
          <!-- User Brief -->
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <img 
              :src="authStore.userAvatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
              class="w-20 h-20 rounded-full border-4 border-gray-50 dark:border-gray-700 mb-3"
            />
            <h3 class="font-bold text-gray-900 dark:text-white truncate max-w-full">{{ authStore.userName }}</h3>
            <span v-if="authStore.isAdmin" class="text-xs text-red-500 font-bold mt-1 uppercase">Admin</span>
          </div>

          <!-- Navigation -->
          <nav class="p-2">
            <RouterLink 
              to="/account/orders"
              class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              active-class="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {{ t('account.my_orders') }}
            </RouterLink>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 min-h-[500px]">
        <RouterView />
      </main>

    </div>
  </div>
</template>
