<script setup>
import { useCartStore } from '../stores/cartStore'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseImage from '../components/BaseImage.vue'
import * as htmlToImage from 'html-to-image'
import { ElMessageBox } from 'element-plus'

const cartStore = useCartStore()
const { t } = useI18n()

// 格式化價格為 USD
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

// 截圖功能 - 保留深色模式背景
const captureCart = async () => {
  const target = document.getElementById('cart-capture-area')
  if (!target) {
    ElMessageBox.alert(t('cart.captureAreaNotFound') || '找不到截圖區域', t('error.title') || '錯誤', {
      type: 'error',
      confirmButtonText: t('error.confirm') || '確定'
    })
    return
  }

  const isDark = document.documentElement.classList.contains('dark')
  const bg = isDark ? '#1f2937' : '#ffffff'

  try {
    const dataUrl = await htmlToImage.toPng(target, {
      backgroundColor: bg,
      cacheBust: true,
      pixelRatio: window.devicePixelRatio * 1.5, // 更乾淨的輸出  
      style: {
        transform: 'scale(1)',      // 修 html-to-image 偶爾 scale 錯誤
        'transform-origin': 'top left'
      },
      // 完整保留 Shadow DOM / filter / SVG 支援
      includeShadowRoots: true,
    })

    const link = document.createElement('a')
    link.download = `shopping-cart-${Date.now()}.png`
    link.href = dataUrl
    link.click()

  } catch (err) {
    console.error(err)
    ElMessageBox.alert(`截圖失敗：${err.message}`, t('error.title') || '錯誤', {
      type: 'error',
      confirmButtonText: t('error.confirm') || '確定'
    })
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div id="cart-container" class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-4xl mx-auto transition-colors">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center border-b dark:border-gray-600 pb-4">{{ $t('cart.title') }}</h1>

      <!-- 購物車列表 -->
      <div v-if="cartStore.cartItems.length > 0">
        <!-- 截圖區域 - 保留深色模式 -->
        <div id="cart-capture-area" class="mb-6">
          <!-- Desktop Table View -->
          <table class="w-full hidden md:table">
            <thead>
              <tr class="border-b-2 border-gray-300 dark:border-gray-600">
                <th class="py-3 px-4 text-left text-gray-700 dark:text-gray-300 font-semibold">{{ $t('cart.productInfo') }}</th>
                <th class="py-3 px-4 text-center text-gray-700 dark:text-gray-300 font-semibold">{{ $t('cart.quantity') }}</th>
                <th class="py-3 px-4 text-right text-gray-700 dark:text-gray-300 font-semibold">{{ $t('cart.price') }}</th>
                <th class="py-3 px-4 text-right text-gray-700 dark:text-gray-300 font-semibold">{{ $t('cart.subtotal') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartStore.cartItems" :key="item.id" class="border-b border-gray-200 dark:border-gray-700">
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-3">
                    <BaseImage :src="item.imageUrl" :alt="item.name" class-name="w-16 h-16 object-cover rounded-lg" />
                    <span class="text-gray-800 dark:text-gray-200 font-medium">{{ item.name }}</span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <div class="flex items-center justify-center space-x-2">
                    <!-- 減號按鈕 -->
                    <button
                      @click="cartStore.decrementQuantity(item.id)"
                      :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-all',
                        item.quantity === 1 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-red-500 hover:bg-red-600'
                      ]"
                      :title="item.quantity === 1 ? t('cart.remove') : t('cart.decrease')"
                    >
                      {{ item.quantity === 1 ? '🗑️' : '−' }}
                    </button>
                    
                    <!-- 數量顯示 -->
                    <span class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-1 px-4 rounded-full font-medium min-w-[3rem] text-center">
                      {{ item.quantity }}
                    </span>
                    
                    <!-- 加號按鈕 -->
                    <button
                      @click="cartStore.incrementQuantity(item.id)"
                      class="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center font-bold text-white transition-all"
                      :title="t('cart.increase')"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td class="py-4 px-4 text-right text-gray-600 dark:text-gray-300">
                  {{ formatPrice(item.price) }}
                </td>
                <td class="py-4 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                  {{ formatPrice(item.price * item.quantity) }}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile Card View -->
          <div class="md:hidden space-y-4">
            <div v-for="item in cartStore.cartItems" :key="item.id" class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
              <div class="flex items-start space-x-4">
                <BaseImage :src="item.imageUrl" :alt="item.name" class-name="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">{{ item.name }}</h3>
                  <p class="text-indigo-600 dark:text-indigo-400 font-bold mb-2">{{ formatPrice(item.price) }}</p>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <button
                        @click="cartStore.decrementQuantity(item.id)"
                        :class="[
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-all',
                          item.quantity === 1 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-red-500 hover:bg-red-600'
                        ]"
                      >
                        {{ item.quantity === 1 ? '🗑️' : '−' }}
                      </button>
                      
                      <span class="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-1 px-3 rounded-full font-medium min-w-[2rem] text-center text-sm">
                        {{ item.quantity }}
                      </span>
                      
                      <button
                        @click="cartStore.incrementQuantity(item.id)"
                        class="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center font-bold text-white transition-all"
                      >
                        +
                      </button>
                    </div>
                    
                    <div class="text-right">
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('cart.subtotal') }}</p>
                      <p class="font-bold text-indigo-600 dark:text-indigo-400">{{ formatPrice(item.price * item.quantity) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 總計 -->
          <div class="mt-6 pt-4 border-t-2 border-gray-300 dark:border-gray-600 text-right">
            <span class="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {{ $t('cart.total') }}：
            </span>
            <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {{ formatPrice(cartStore.totalPrice) }}
            </span>
          </div>
        </div>

        <!-- 截圖按鈕 - 在截圖區域外 -->
        <div class="flex justify-center mt-6">
          <button 
            @click="captureCart"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{{ $t('cart.screenshot') }}</span>
          </button>
        </div>
      </div>

      <!-- 空購物車提示 -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ $t('cart.empty') }}</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-8">{{ $t('cart.emptyDesc') }}</p>
        <RouterLink 
          to="/" 
          class="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          {{ $t('cart.goShopping') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>
