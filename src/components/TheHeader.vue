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
      const { value } = await ElMessageBox.prompt(t('auth.passwordProtectedMsg'), t('auth.identityCheck'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        inputType: 'password',
        inputErrorMessage: t('auth.passwordError')
      })
      
      if (value === 'chris') {
        isMobileMenuOpen.value = false
        router.push(path)
      } else {
        ElMessage.error(t('auth.passwordError'))
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
    const { value } = await ElMessageBox.prompt(t('auth.passwordProtectedMsg'), t('auth.identityCheck'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      inputType: 'password',
      inputErrorMessage: t('auth.passwordError')
    })
    
    if (value === 'chris') {
      isMobileMenuOpen.value = false
      router.push('/presentation')
    } else {
      ElMessage.error(t('auth.passwordError'))
    }
  } catch {
    // cancelled
  }
} // Removed extra brace if any. Ensure indentation is correct.

const showLoginModal = ref(false)
const isMobileMenuOpen = ref(false)

const handleLoginSuccess = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

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
const imageLoadError = ref(false)

const defaultAvatarUrl = computed(() => {
  const avatar = authStore.userAvatar
  
  // If we have an avatar and no error, use it
  if (avatar && avatar.trim() !== '' && !imageLoadError.value) {
    return avatar
  }
  
  // Use UI Avatars API to generate colorful avatar with user initials
  const name = authStore.userName || 'User'
  const encodedName = encodeURIComponent(name)
  const generatedUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=6366f1&color=fff&size=128&bold=true`
  return generatedUrl
})

// Reset error state when avatar changes
watch(() => authStore.userAvatar, () => {
  imageLoadError.value = false
})

// Scroll Logic Removed - Replaced with Element Plus Scrollbar
onMounted(async () => {
  // Init Logic
  updateTime()
  timer = setInterval(updateTime, 1000)

  // Auto-open login modal if redirected from LINE
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('openExternalBrowser') === '1') {
    showLoginModal.value = true
    // Clean URL
    const newUrl = window.location.pathname + window.location.search.replace(/[\?&]openExternalBrowser=1/, '').replace(/^&/, '?').replace(/\?$/, '')
    window.history.replaceState({}, '', newUrl)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

</script>

<template>
  <header class="sticky top-0 left-0 w-full max-w-[100vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-md z-50 transition-colors overflow-x-hidden">
    <nav class="container mx-auto px-4 py-2">
      <div class="flex justify-between items-center">
        <!-- Logo / Brand Name -->
        <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          <RouterLink to="/">{{ $t('header.brand') }}</RouterLink>
        </div>

        <div class="flex items-center space-x-2 md:space-x-6 flex-1 min-w-0 justify-end">
          <!-- Desktop Navigation -->
          <!-- Desktop Navigation -->
          <div class="hidden md:block flex-1 ml-6 mt-2 min-w-0">
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
                         @error="imageLoadError = true"
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
                 <base-button 
                   v-else 
                   :name="t('auth.login')"
                   @click="showLoginModal = true"
                   class="px-4 py-1.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium rounded-full hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors shadow-sm flex-shrink-0 min-w-max"
                 />
               </template>
             </div>

             <!-- Clock & Language Vertical Stack -->
             <div class="hidden md:flex flex-col items-center justify-center gap-1 mx-2">
                <!-- Clock -->
                <div class="px-2 py-0.1 bg-gray-900 dark:bg-black rounded border border-gray-700 dark:border-gray-800 shadow-inner">
                  <span class="font-mono text-xs font-bold text-green-400 tracking-widest">{{ currentTime }}</span>
                </div>
                <select 
                  v-model="locale" 
                  @change="changeLocale(locale)"
                  aria-label="Select Language"
                  class="text-center px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs w-24"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
             </div>
          </div>

          <!-- Always Visible Controls (Language & Theme) -->
          <div class="flex items-center space-x-2">

            <!-- 深色模式切換 -->
            <button
              @click="themeStore.toggleTheme"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              :title="themeStore.isDark ? '切換到淺色模式' : '切換到深色模式'"
              :aria-label="themeStore.isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <span v-if="themeStore.isDark" class="text-lg md:text-2xl">☀️</span>
              <span v-else class="text-lg md:text-2xl">🌙</span>
            </button>
          </div>

          <!-- Mobile Language Switcher -->
          <div class="md:hidden flex items-center mr-2">
             <select 
               v-model="locale" 
               @change="changeLocale(locale)"
               class="bg-transparent text-gray-800 dark:text-gray-200 text-base focus:outline-none cursor-pointer border-none p-0 w-12"
               aria-label="Select Language"
             >
               <option value="zh-TW">繁</option>
               <option value="en">En</option>
               <option value="ja">JP</option>
               <option value="ko">KR</option>
             </select>
          </div>

          <!-- Mobile Login Button -->
          <base-button
            v-if="!authStore.isAuthenticated"
            type="success"
            size="small"
            :name="t('auth.login')"
            @click="showLoginModal = true"
            class="md:hidden mr-2 !font-bold !rounded-lg"
          />

          <!-- Mobile User Avatar Dropdown -->
          <el-dropdown 
            v-if="authStore.isAuthenticated" 
            trigger="click" 
            class="md:hidden mr-1"
          >
             <button class="p-1 outline-none">
               <img 
                 :src="defaultAvatarUrl"
                 @error="imageLoadError = true" 
                 class="w-8 h-8 rounded-full border border-gray-300 object-cover"
                 alt="User"
               />
             </button>
             <template #dropdown>
               <el-dropdown-menu>
                 <el-dropdown-item v-if="authStore.isAdmin" @click="isMobileMenuOpen = false; router.push('/admin/products')">
                   <span class="text-red-500 font-bold">{{ t('admin.title') }}</span>
                 </el-dropdown-item>
                 <el-dropdown-item @click="isMobileMenuOpen = false; router.push('/account')">
                   {{ t('account.title') }}
                 </el-dropdown-item>
                 <el-dropdown-item divided @click="handleLogout(); isMobileMenuOpen = false">
                   {{ t('auth.logout') }}
                 </el-dropdown-item>
               </el-dropdown-menu>
             </template>
          </el-dropdown>

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
  <LoginModal v-model:visible="showLoginModal" @success="handleLoginSuccess" />
</header>
</template>

<style scoped>
/* Right align tabs safely */
:deep(.el-tabs__nav-scroll) {
  /* Reset to default to allow scrolling logic */
  display: block; 
  width: 100%;
}

:deep(.el-tabs__nav) {
  /* Use flex-end to align tabs to the right when no overflow */
  display: flex;
  justify-content: flex-end;
  float: none; /* Ensure no float interference */
}

/* Reduce tab item padding to make underline tighter to text */
:deep(.el-tabs__item) {
  padding: 0 15px !important; /* Increased to adds approx 5px more spacing */
}

/* Remove default margin to ensure clean alignment */
:deep(.el-tabs__header) {
  margin: 0;
}

/* Hide the gray bottom track line to prevent it extending into empty space */
:deep(.el-tabs__nav-wrap::after) {
  display: none !important;
}
</style>
