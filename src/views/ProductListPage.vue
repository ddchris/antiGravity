<script setup>
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'

const productStore = useProductStore()

// Lazy Loading Logic
const displayedCount = ref(12) // Initial number of items to show
const loading = ref(false)
const trigger = ref(null)

const displayedProducts = computed(() => {
  return productStore.products.slice(0, displayedCount.value)
})

let observer = null

const loadMore = (entries) => {
  const [entry] = entries
  if (entry.isIntersecting && displayedCount.value < productStore.products.length) {
    loading.value = true
    // Simulate a small delay for better UX (optional, but requested "loading effect")
    setTimeout(() => {
        displayedCount.value += 8
        loading.value = false
    }, 500)
  }
}

onMounted(() => {
  productStore.fetchProducts()

  const options = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1
  }
  
  observer = new IntersectionObserver(loadMore, options)
  if (trigger.value) {
    observer.observe(trigger.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">{{ $t('product.featured') }}</h1>

    <!-- 商品網格 -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <ProductCard
        v-for="product in displayedProducts"
        :key="product.id"
        :product="product"
        class="transform transition-all duration-500 will-change-transform" 
      />
    </div>
    
    <!-- Infinite Scroll Trigger & Loading Indicator -->
    <div ref="trigger" class="py-8 text-center">
      <div v-if="loading" class="inline-flex items-center text-indigo-600 dark:text-indigo-400">
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="font-medium animate-pulse">{{ $t('product.loading') }}</span>
      </div>
      <div v-else-if="displayedCount >= productStore.products.length" class="text-gray-500 dark:text-gray-400 text-sm mt-4">
        {{ $t('product.noMore') }}
      </div>
    </div>
  </div>
</template>
