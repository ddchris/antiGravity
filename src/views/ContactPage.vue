<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessageBox } from 'element-plus'
import BaseImage from '../components/BaseImage.vue'

const { t } = useI18n()

const formData = reactive({
  name: '',
  email: '',
  message: ''
})

const errors = reactive({
  name: false,
  email: false,
  message: false
})

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  errors.name = false
  errors.email = false
  errors.message = false

  if (!formData.name.trim()) {
    errors.name = true
    isValid = false
  }

  if (!formData.email.trim()) {
    errors.email = true
    isValid = false
  }

  if (!formData.message.trim()) {
    errors.message = true
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (validateForm()) {
    ElMessageBox.alert(t('contact.successMessage'), t('contact.successTitle'), {
      confirmButtonText: t('error.confirm'),
      type: 'success'
    })
    // Clear form
    formData.name = ''
    formData.email = ''
    formData.message = ''
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-2xl">
    <div class="bg-white dark:bg-gray-700 rounded-2xl shadow-xl p-6 md:p-12 transition-colors">
      <h1 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">{{ $t('contact.title') }}</h1>

      <!-- 聯絡資訊 -->
      <div class="space-y-4 mb-10 text-center">
        <p class="text-gray-600 dark:text-gray-300">
          <span class="font-semibold text-gray-800 dark:text-gray-100">地址：</span>
          台北市松山區反重力路 1 號
        </p>
        <p class="text-gray-600 dark:text-gray-300">
          <span class="font-semibold text-gray-800 dark:text-gray-100">電話：</span>
          +886-2-1234-5678
        </p>
        <p class="text-gray-600 dark:text-gray-300">
          <span class="font-semibold text-gray-800 dark:text-gray-100">Email：</span>
          support@antigravity.store
        </p>
      </div>

      <!-- QR Code -->
      <div class="flex flex-col items-center mb-10">
        <p class="text-gray-600 dark:text-gray-300 mb-2 font-medium">掃描加入官方 Line</p>
        <BaseImage
          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://antigravity.store"
          alt="QR Code"
          class-name="w-32 h-32 border-4 border-white dark:border-gray-600 shadow-lg rounded-lg"
        />
      </div>

      <!-- 模擬表單 -->
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('contact.name') }}</label>
          <input
            v-model="formData.name"
            type="text"
            id="name"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            :class="errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'"
            :placeholder="$t('contact.name')"
          >
          <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ $t('contact.required') }}</p>
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('contact.email') }}</label>
          <input
            v-model="formData.email"
            type="email"
            id="email"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            :class="errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'"
            :placeholder="$t('contact.email')"
          >
           <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ $t('contact.required') }}</p>
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{{ $t('contact.message') }}</label>
          <textarea
            v-model="formData.message"
            id="message"
            rows="4"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            :class="errors.message ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'"
            :placeholder="$t('contact.message')"
          ></textarea>
           <p v-if="errors.message" class="text-red-500 text-xs mt-1">{{ $t('contact.required') }}</p>
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          {{ $t('contact.send') }}
        </button>
      </form>
    </div>
  </div>
</template>
