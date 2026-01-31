import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockProducts } from '@/mock/products'

export const useProductStore = defineStore('products', () => {
  const products = ref([])

  const fetchProducts = async () => {
    // 簡單快取：如果我們已經有資料，就不再重新 fetch
    // if (products.value.length > 0) return

    try {
      // 模擬 API 請求延遲
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 使用本地模擬數據取代失效的 mocki.io API
      const productList = mockProducts

      if (Array.isArray(productList)) {
        products.value = productList
      } else {
        console.error('Invalid product data format')
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  return {
    products,
    fetchProducts
  }
})
