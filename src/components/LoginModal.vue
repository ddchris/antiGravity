<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'

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

const handleGoogleLogin = async () => {
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

<style scoped>
:deep(.el-dialog__header.show-close),
:deep(.el-dialog__header) {
  padding-top: 20px !important;
  padding-right: 0 !important;
  padding-bottom: 16px !important;
  padding-left: 0 !important;
  margin-right: 0 !important;
  display: flex;
  justify-content: center;
  position: relative;
}

:deep(.el-dialog__title) {
  width: 100%;
  text-align: center;
}

:deep(.el-dialog__headerbtn) {
  right: 20px;
  top: 20px;
}
</style>
