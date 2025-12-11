import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useProductStore = defineStore('products', () => {
  const products = ref([])

  const fetchProducts = async () => {
    // Simple cache: don't fetch if we already have data
    // if (products.value.length > 0) return

    try {
      const response = await request.get('https://mocki.io/v1/8405da4e-5514-4d18-ae89-8251372a5a98')
      
      // API returns { "data": [...] }, so we need to access result.data
      const productList = response.data

      if (Array.isArray(productList)) {
        products.value = productList
      } else {
        console.error('Invalid product data format:', response)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Error handling is managed by request.js interceptor
    }
  }

  return {
    products,
    fetchProducts
  }
})
