<script setup>
import { computed } from 'vue'
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
  set: (val) => emit('update:visible', val)
})

const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera
  return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1) || (ua.indexOf("Instagram") > -1) || (ua.indexOf("Line") > -1)
}

const handleGoogleLogin = async () => {
  if (isInAppBrowser()) {
    ElMessageBox.alert(
      'Google 不支援在 Line/Facebook 等內建瀏覽器登入，請點擊右上角選單並選擇「在瀏覽器中開啟」(Open in default browser) 以繼續。',
      '瀏覽器不支援',
      { confirmButtonText: '了解' }
    )
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
    <div class="flex flex-col gap-4 py-4">
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


