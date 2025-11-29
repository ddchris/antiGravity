import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 購物車商品列表 state
  const cartItems = ref([])

  // 加入購物車 action
  const addToCart = (product) => {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    
    if (existingItem) {
      // 如果商品已存在，數量加 1
      existingItem.quantity++
    } else {
      // 如果商品不存在，新增商品並設定數量為 1
      cartItems.value.push({
        ...product,
        quantity: 1
      })
    }
  }

  // 計算總價 getter
  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  })

  return {
    cartItems,
    addToCart,
    totalPrice
  }
})
