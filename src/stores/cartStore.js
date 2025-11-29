import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 購物車商品列表 state - 從 localStorage 初始化
  // 嘗試從 localStorage 讀取 "cart" 鍵值，若不存在則初始化為空陣列
  const cartItems = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

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

  // 計算總數量 getter - 所有商品的數量總和
  // 範例：A 商品數量 2 + B 商品數量 1 = 總數量 3
  const totalQuantity = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  })

  // 增加商品數量 action
  const incrementQuantity = (productId) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      item.quantity++
    }
  }

  // 減少商品數量 action
  // 當數量減到 0 時，自動從購物車移除該商品
  const decrementQuantity = (productId) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      if (item.quantity > 1) {
        // 數量大於 1，直接減 1
        item.quantity--
      } else {
        // 數量為 1 時再減，直接移除商品
        const index = cartItems.value.findIndex(i => i.id === productId)
        if (index !== -1) {
          cartItems.value.splice(index, 1)
        }
      }
    }
  }

  return {
    cartItems,
    addToCart,
    incrementQuantity,
    decrementQuantity,
    totalPrice,
    totalQuantity
  }
})

// 持久化訂閱 - 在 Store 外部設置
// 這個函數會在組件首次使用 store 時被調用
export function setupCartPersistence() {
  const store = useCartStore()
  
  // 使用 Pinia 的 $subscribe 監聽 state 變動
  // 每當 cartItems 變動時，自動儲存到 localStorage
  store.$subscribe((mutation, state) => {
    localStorage.setItem('cart', JSON.stringify(state.cartItems))
  })
}
