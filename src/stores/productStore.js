import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useProductStore = defineStore('products', () => {
  const products = ref([])

  const fetchProducts = async () => {
    // 簡單快取：如果我們已經有資料，就不再重新 fetch
    // if (products.value.length > 0) return

    try {
      const response = await request.get('https://mocki.io/v1/5f9cbcfe-4eef-4a25-bc94-99e52390a5bd')
      
      // API 直接回傳 [...] (物件陣列 Array)
      const productList = response

      if (Array.isArray(productList)) {
        products.value = productList
      } else {
        console.error('Invalid product data format:', response)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // 錯誤處理已由 request.js 的 interceptor 管理
    }
  }

  return {
    products,
    fetchProducts
  }
})
