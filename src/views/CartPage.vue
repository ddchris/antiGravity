<script setup>
import { useCartStore } from '../stores/cartStore'
import { ref } from 'vue'

const cartStore = useCartStore()

// 格式化價格為 USD
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

// 截圖並下載功能
const captureCart = async () => {
  // 確保 html2canvas 已載入
  if (typeof window.html2canvas === 'undefined') {
    alert('截圖功能尚未準備好，請稍後再試或檢查網路連線。')
    return
  }

  const cartElement = document.getElementById('cart-container')
  
  try {
    const canvas = await window.html2canvas(cartElement, {
      useCORS: true, // 允許跨域圖片 (如果有的話)
      scale: 2, // 提高解析度
      backgroundColor: '#ffffff' // 確保背景為白色
    })
    
    // 創建下載連結
    const link = document.createElement('a')
    link.download = 'my-shopping-cart.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('截圖失敗:', error)
    alert('截圖失敗，請查看控制台錯誤訊息。')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div id="cart-container" class="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center border-b pb-4">您的購物車</h1>

      <!-- 購物車列表 -->
      <div v-if="cartStore.cartItems.length > 0">
        <div class="overflow-x-auto">
          <table class="w-full mb-8">
            <thead>
              <tr class="border-b-2 border-gray-200 text-left">
                <th class="py-4 px-4 text-gray-600 font-semibold">商品資訊</th>
                <th class="py-4 px-4 text-gray-600 font-semibold text-center">數量</th>
                <th class="py-4 px-4 text-gray-600 font-semibold text-right">單價</th>
                <th class="py-4 px-4 text-gray-600 font-semibold text-right">小計</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartStore.cartItems" :key="item.id" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="py-4 px-4">
                  <div class="flex items-center space-x-4">
                    <img :src="item.imageUrl" :alt="item.name" class="w-16 h-16 object-cover rounded-lg shadow-sm">
                    <span class="font-medium text-gray-800">{{ item.name }}</span>
                  </div>
                </td>
                <td class="py-4 px-4 text-center">
                  <span class="bg-gray-100 text-gray-800 py-1 px-3 rounded-full font-medium">{{ item.quantity }}</span>
                </td>
                <td class="py-4 px-4 text-right text-gray-600">
                  {{ formatPrice(item.price) }}
                </td>
                <td class="py-4 px-4 text-right font-bold text-indigo-600">
                  {{ formatPrice(item.price * item.quantity) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 總計與操作 -->
        <div class="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div class="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            總計：<span class="text-indigo-600">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
          
          <button 
            @click="captureCart"
            class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>截圖並下載</span>
          </button>
        </div>
      </div>

      <!-- 空購物車提示 -->
      <div v-else class="text-center py-12">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">購物車是空的！</h2>
        <p class="text-gray-600 mb-8">看起來您還沒有加入任何商品。</p>
        <RouterLink 
          to="/" 
          class="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
        >
          去逛逛商品
        </RouterLink>
      </div>
    </div>
  </div>
</template>
