import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 定義商品介面
export interface Product {
  id: number
  title?: string
  name?: string
  price: number
  category?: string
  description?: string
  image?: string
  rating?: {
    rate: number
    count: number
  }
}

// 定義購物車項目介面（繼承商品，但多了 quantity）
// 這裡使用 Intersection Type 確保保留原本的所有屬性，並強制加入 quantity
export type CartItem = Product & {
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // 購物車商品列表 state - 明確定義型別為 CartItem[]
  // 若 localStorage 為空，則初始化為空陣列
  const cartItems = ref<CartItem[]>(JSON.parse(localStorage.getItem('cart') || '[]'))

  // 加入購物車 action
  const addToCart = (product: Product) => {
    // 檢查商品是否已存在於購物車
    const existingItem = cartItems.value.find(item => item.id === product.id)

    if (existingItem) {
      // 如果商品已存在，數量加 1
      existingItem.quantity++
    } else {
      // 如果商品不存在，新增商品並設定數量為 1
      // 注意：這裡需要斷言或建構符合 CartItem 的物件
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

  // 計算總數量 getter
  const totalQuantity = computed(() => {
    return cartItems.value.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  })

  // 增加商品數量 action
  const incrementQuantity = (productId: number) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      item.quantity++
    }
  }

  // 減少商品數量 action
  const decrementQuantity = (productId: number) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        // 數量為 1 時再減，移除商品
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

// 持久化訂閱 setup
export function setupCartPersistence() {
  const store = useCartStore()

  store.$subscribe((_, state) => {
    localStorage.setItem('cart', JSON.stringify(state.cartItems))
  })
}
