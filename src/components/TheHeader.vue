<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useThemeStore } from '../stores/themeStore'
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/authStore'
import LoginModal from './LoginModal.vue'

// 導入購物車 store 以讀取總數量
const cartStore = useCartStore()
const themeStore = useThemeStore()
const authStore = useAuthStore() // Added authStore
const { t, locale } = useI18n()

// 切換語系
const changeLocale = (newLocale) => {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

const router = useRouter()

const activeTab = ref(router.currentRoute.value.path)

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    activeTab.value = newPath
  }
)

const handleTabClick = async (tab) => {
  const path = tab.props.name
  if (path === '/presentation') {
    if (activeTab.value === '/presentation') return // Already there
    
    // Slight delay to prevent immediate visual switch before prompt if possible, 
    // but el-tabs v-model updates fast. 
    // We rely on the watch to set it back if we don't push.
    // However, if we want to prevent the switch visual, we should use :before-leave.
    // user wants simple "use tab", simple prompt is fine.
    
    try {
      const { value } = await ElMessageBox.prompt('此頁面受保護，請輸入密碼', '身份驗證', {
        confirmButtonText: '確認',
        cancelButtonText: '取消',
        inputType: 'password',
        inputErrorMessage: '密碼錯誤'
      })
      
      if (value === 'chris') {
        isMobileMenuOpen.value = false
        router.push(path)
      } else {
        ElMessage.error('密碼錯誤')
        activeTab.value = router.currentRoute.value.path // Revert visual
      }
    } catch {
      activeTab.value = router.currentRoute.value.path // Revert visual
    }
  } else {
    router.push(path)
  }
}

const handleMobilePresentationClick = async () => {
  if (router.currentRoute.value.path === '/presentation') {
     isMobileMenuOpen.value = false
     return
  }

  try {
    const { value } = await ElMessageBox.prompt('此頁面受保護，請輸入密碼', '身份驗證', {
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      inputType: 'password',
      inputErrorMessage: '密碼錯誤'
    })
    
    if (value === 'chris') {
      isMobileMenuOpen.value = false
      router.push('/presentation')
    } else {
      ElMessage.error('密碼錯誤')
    }
  } catch {
    // cancelled
  }
} // Removed extra brace if any. Ensure indentation is correct.

const showLoginModal = ref(false)
const isMobileMenuOpen = ref(false)

const handleLogout = async () => {
  try {
    await authStore.logout()
    ElMessage.success(t('auth.logout'))
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Clock Logic
const currentTime = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}


// ... existing imports ...

// Scroll Logic for Desktop Nav

// Generate default avatar URL with user initials
const defaultAvatarUrl = computed(() => {
  const avatar = authStore.userAvatar
  console.log('Computing defaultAvatarUrl, userAvatar:', avatar, 'userName:', authStore.userName)
  
  // Check if avatar exists and is not empty string
  if (avatar && avatar.trim() !== '') {
    console.log('Using user avatar:', avatar)
    return avatar
  }
  
  // Use UI Avatars API to generate colorful avatar with user initials
  const name = authStore.userName || 'User'
  const encodedName = encodeURIComponent(name)
  const generatedUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=128&bold=true`
  console.log('Generated avatar URL:', generatedUrl)
  return generatedUrl
})

// Scroll Logic Removed - Replaced with Element Plus Scrollbar
onMounted(() => {
  authStore.initAuth()
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

</script>

<template>
  <header class="sticky top-0 left-0 w-full max-w-[100vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md z-50 transition-colors overflow-x-hidden">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo / Brand Name -->
        <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          <RouterLink to="/">{{ $t('header.brand') }}</RouterLink>
        </div>

        <div class="flex items-center space-x-2 md:space-x-6 flex-1 min-w-0 justify-end">
          <!-- Desktop Navigation -->
          <!-- Desktop Navigation -->
          <div class="hidden md:block flex-1 mx-4 min-w-0">
            <el-tabs 
              v-model="activeTab" 
              @tab-click="handleTabClick"
              class="header-tabs demo-tabs"
            >
              <el-tab-pane name="/cart">
                <template #label>
                  <div class="flex items-center">
                    <div class="relative mr-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      <span 
                        v-if="cartStore.totalQuantity > 0"
                        class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                      >
                        {{ cartStore.totalQuantity }}
                      </span>
                    </div>
                    <span>{{ $t('header.cart') }}</span>
                  </div>
                </template>
              </el-tab-pane>

              <el-tab-pane :label="$t('header.products')" name="/" />
              <el-tab-pane :label="$t('management.title')" name="/admin/products" />
              <el-tab-pane v-if="authStore.isAuthenticated" :label="$t('header.contact')" name="/contact" />
              <el-tab-pane :label="$t('header.chat')" name="/chat" />
              <el-tab-pane :label="$t('header.stats')" name="/stats" />
              <el-tab-pane :label="$t('header.about')" name="/about" />
              <el-tab-pane :label="$t('header.presentation')" name="/presentation" />
            </el-tabs>
          </div>

          <!-- Desktop Right Actions (Auth & Clock) -->
          <div class="hidden md:flex items-center gap-4 flex-shrink-0 mr-4">
             <!-- Auth UI -->
             <div class="flex items-center gap-3 flex-shrink-0">
               <template v-if="!authStore.isInitialized">
                 <img 
                   v-if="authStore.userAvatar"
                   :src="authStore.userAvatar"
                   class="w-9 h-9 rounded-full border border-gray-300 object-cover flex-shrink-0"
                   alt="User"
                 />
                 <div v-else class="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse border border-gray-300 flex-shrink-0"></div>
               </template>
               <template v-else>
                 <template v-if="authStore.isAuthenticated">
                   <span v-if="authStore.isAdmin" class="hidden lg:block text-xs font-bold text-red-500 border border-red-500 px-2 py-0.5 rounded uppercase flex-shrink-0">Admin</span>
                   <el-dropdown trigger="click">
                     <div class="flex items-center gap-2 cursor-pointer outline-none flex-shrink-0">
                       <img 
                         :src="defaultAvatarUrl" 
                         class="w-9 h-9 rounded-full border border-gray-300 object-cover flex-shrink-0"
                         alt="User"
                       />
                     </div>
                     <template #dropdown>
                       <el-dropdown-menu>
                         <el-dropdown-item v-if="authStore.isAdmin">
                           <span class="text-red-500 font-bold">{{ t('admin.title') }}</span>
                         </el-dropdown-item>
                         <el-dropdown-item @click="router.push('/account')">
                           {{ t('account.title') }}
                         </el-dropdown-item>
                         <el-dropdown-item divided @click="handleLogout">
                           {{ t('auth.logout') }}
                         </el-dropdown-item>
                       </el-dropdown-menu>
                     </template>
                   </el-dropdown>
                 </template>
                 <button 
                   v-else 
                   @click="showLoginModal = true"
                   class="px-4 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-sm flex-shrink-0 min-w-max"
                 >
                   {{ t('auth.login') }}
                 </button>
               </template>
             </div>

             <!-- Clock -->
             <div class="px-3 py-1 bg-gray-900 dark:bg-black rounded border border-gray-700 dark:border-gray-800 shadow-inner flex-shrink-0">
               <span class="font-mono text-sm font-bold text-green-400 tracking-widest">{{ currentTime }}</span>
             </div>
          </div>

          <!-- Always Visible Controls (Language & Theme) -->
          <div class="flex items-center space-x-2">
            <!-- 語系切換 -->
            <select 
              v-model="locale" 
              @change="changeLocale(locale)"
              aria-label="Select Language"
              class="text-white px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm w-28"
            >
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>

            <!-- 深色模式切換 -->
            <button
              @click="themeStore.toggleTheme"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              :title="themeStore.isDark ? '切換到淺色模式' : '切換到深色模式'"
              :aria-label="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <span v-if="themeStore.isDark" class="text-xl md:text-2xl">☀️</span>
              <span v-else class="text-xl md:text-2xl">🌙</span>
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
            :aria-label="isMobileMenuOpen ? 'Close Menu' : 'Open Menu'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div 
        v-show="isMobileMenuOpen" 
        class="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in-down"
      >
        <div class="flex flex-col space-y-4 pt-4">
          <RouterLink
            to="/"
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1"
            active-class="text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded"
            @click="isMobileMenuOpen = false"
          >
            {{ $t('header.products') }}
          </RouterLink>
          <RouterLink
            to="/admin/products"
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1"
            active-class="text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded"
            @click="isMobileMenuOpen = false"
          >
            {{ $t('management.title') }}
          </RouterLink>
          <RouterLink
            v-if="authStore.isAuthenticated"
            to="/contact"
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1"
            active-class="text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded"
            @click="isMobileMenuOpen = false"
          >
            {{ $t('header.contact') }}
          </RouterLink>
          <RouterLink
            to="/cart"
            class="flex items-center justify-between text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1"
            active-class="text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded"
            @click="isMobileMenuOpen = false"
          >
            <span>{{ $t('header.cart') }}</span>
            <span 
              v-if="cartStore.cartItems.length > 0"
              class="bg-red-600 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center font-bold"
            >
              {{ cartStore.cartItems.length }}
            </span>
          </RouterLink>

          <RouterLink
            to="/chat"
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1"
            active-class="text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded"
            @click="isMobileMenuOpen = false"
          >
            {{ $t('header.chat') }}
          </RouterLink>

          <RouterLink
            to="/stats"
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1"
            active-class="text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded"
            @click="isMobileMenuOpen = false"
          >
            {{ $t('header.stats') }}
          </RouterLink>

          <RouterLink
            to="/about"
            class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1"
            active-class="text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded"
            @click="isMobileMenuOpen = false"
          >
            {{ $t('header.about') }}
          </RouterLink>

          <button
            @click="handleMobilePresentationClick"
            class="text-left w-full text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors px-2 py-1 focus:outline-none"
            :class="{ 'text-indigo-600 dark:text-indigo-400 font-bold bg-gray-100 dark:bg-gray-800 rounded': $route.path === '/presentation' }"
          >
            {{ $t('header.presentation') }}
          </button>
        </div>
      </div>
    </nav>
  
  <!-- Login Component -->
  <LoginModal v-model:visible="showLoginModal" />
</header>
</template>

<style scoped>
/* Scoped styles if needed, but Tailwind handles most */
</style>

