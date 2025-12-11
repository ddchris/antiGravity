import { defineStore } from 'pinia'
import request from '@/utils/request'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: []
  }),
  actions: {
    async fetchProducts() {
      // Simple cache: don't fetch if we already have data
      if (this.products.length > 0) return

      try {
        const data = await request.get('https://mocki.io/v1/8405da4e-5514-4d18-ae89-8251372a5a98')
        // Ensure data is an array
        if (Array.isArray(data)) {
          this.products = data
        } else {
          console.error('Invalid product data format:', data)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        // Error handling is managed by request.js interceptor
      }
    }
  }
})
