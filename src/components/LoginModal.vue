<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'success'])
const authStore = useAuthStore()
const { t } = useI18n()

// Wrapper for v-model
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => {
    emit('update:visible', val)
    if (!val) showInAppPrompt.value = false // Reset state on close
  }
})

const showInAppPrompt = ref(false)

const handleGoogleLogin = async () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera
  const isLine = (ua.indexOf("Line") > -1)
  const isInApp = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1) || isLine

  if (isInApp) {
    showInAppPrompt.value = true
    return
  }
  
  try {
    await authStore.loginWithGoogle()
    emit('success')
    dialogVisible.value = false
  } catch (err) {
    // Error handling is done in store
  }
}

const openExternalBrowser = () => {
  const currentUrl = window.location.href
  const ua = navigator.userAgent || navigator.vendor || window.opera
  
  if (ua.indexOf("Line") > -1) {
    // LINE: Use openExternalBrowser param
    if (currentUrl.indexOf('?') > -1) {
        window.location.href = currentUrl + '&openExternalBrowser=1'
    } else {
        window.location.href = currentUrl + '?openExternalBrowser=1'
    }
  } else {
    // Other In-App Browsers (FB/IG): Try generic force methods
    if (/android/i.test(ua)) {
      // Android Intent to force Chrome
      const urlObj = new URL(currentUrl)
      // Scheme: intent://<host><path>#Intent;scheme=https;package=com.android.chrome;end
      const intentUrl = `intent://${urlObj.host}${urlObj.pathname}${urlObj.search}#Intent;scheme=https;package=com.android.chrome;end`
      window.location.href = intentUrl
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      // iOS: Try googlechrome://
      // Note: This only works if Chrome is installed. Safari cannot be forced easily from FB webview.
      const chromeUrl = currentUrl.replace(/^https?:/, 'googlechrome:')
      window.location.href = chromeUrl
    } else {
      // Fallback
      window.open(currentUrl, '_blank')
    }
  }
}

const handleFacebookLogin = async () => {
  try {
    await authStore.loginWithFacebook()
    emit('success')
    dialogVisible.value = false
  } catch (err) {
    // Error handling
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('auth.login')"
    width="300px"
    center
    align-center
    append-to-body
    class="login-modal rounded-xl"
  >
    <div v-if="!showInAppPrompt" class="flex flex-col gap-4 py-4">
      <button 
        @click="handleGoogleLogin"
        class="flex items-center justify-start gap-4 w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 pl-14 pr-4 rounded-lg transition-all shadow-sm hover:shadow relative"
      >
        <div class="w-6 h-6 flex items-center justify-center absolute left-6">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="w-full h-full" />
        </div>
        <span class="text-left">{{ t('auth.google') }}</span>
      </button>

      <button 
        @click="handleFacebookLogin"
        class="flex items-center justify-start gap-4 w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 pl-14 pr-4 rounded-lg transition-all shadow-sm hover:shadow relative"
      >
        <div class="w-6 h-6 flex items-center justify-center absolute left-6">
          <!-- Blue Circle Facebook Logo -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="w-full h-full">
             <path fill="#1877F2" d="M24 4C12.954 4 4 12.954 4 24c0 11.046 8.954 20 20 20s20-8.954 20-20C44 12.954 35.046 4 24 4z"/>
             <path fill="#fff" d="M26.707 29.301h5.176l0.813-5.258h-5.989v-2.874c0-1.445 0.733-3.417 3.3-3.417h2.974v-5.29c0 0-1.378-0.235-4.254-0.235-5.338 0-8.75 3.1-8.75 8.885v2.93h-4.156v5.258h4.156v14.167h6.731V29.301z"/>
          </svg>
        </div>
        <span class="text-left">{{ t('auth.facebook') }}</span>
      </button>
    </div>

    <div v-else class="flex flex-col gap-4 py-4 text-center">
      <div class="text-amber-500 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p class="text-gray-700 dark:text-gray-300 font-medium">
        Google 登入不支援此應用程式內建瀏覽器
      </p>
      <p class="text-gray-500 text-sm">
        請點擊下方按鈕以 Chrome 或 Safari 開啟
      </p>
      <base-button 
        @click="openExternalBrowser"
        class="btn-reset w-full bg-blue-600 text-white hover:bg-blue-700 font-medium py-2.5 rounded-lg transition-all shadow-sm hover:shadow mt-2"
        name="開啟外部瀏覽器"
      />
      <base-button 
        @click="showInAppPrompt = false"
        class="btn-reset text-gray-500 hover:text-gray-700 text-sm mt-2 underline"
        name="返回"
      />
    </div>
  </el-dialog>
</template>



<style>
/* Global override for appended dialog */
/* Global override for appended dialog */
.el-dialog.login-modal .el-dialog__header.show-close,
.el-dialog.login-modal .el-dialog__header {
  padding: 10px 0 10px 0 !important;
  margin: 0 !important;
  display: flex;
  justify-content: center;
  position: relative;
}

.el-dialog.login-modal .el-dialog__title {
  width: 100%;
  text-align: center;
  flex: 1;
}

.el-dialog.login-modal .el-dialog__headerbtn {
  position: absolute;
  right: 20px !important;
  top: 12px !important; /* Adjusted slightly to center vertically with 10px padding */
  width: auto;
  height: auto;
}
</style>


