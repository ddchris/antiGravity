<script setup>
defineProps({
  product: {
    type: Object,
    required: true
  }
})

// 格式化價格為 USD
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <!-- 商品圖片 -->
    <div class="h-48 overflow-hidden bg-gray-200">
      <img
        :src="product.imageUrl"
        :alt="product.name"
        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      >
    </div>

    <!-- 商品資訊 -->
    <div class="p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-2">{{ product.name }}</h3>
      <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ product.description }}</p>
      <div class="flex justify-between items-center">
        <span class="text-2xl font-bold text-indigo-600">{{ formatPrice(product.price) }}</span>
        <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          加入購物車
        </button>
      </div>
    </div>
  </div>
</template>
