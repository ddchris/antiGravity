import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../cartStore'

describe('cartStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        // Mock localStorage
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify([]))
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    })

    it('adds item to cart', () => {
        const store = useCartStore()
        const product = { id: 1, name: 'Item 1', price: 100 }
        
        store.addToCart(product)
        
        expect(store.cartItems).toHaveLength(1)
        expect(store.cartItems[0]).toEqual({ ...product, quantity: 1 })
    })

    it('increments quantity if item exists', () => {
        const store = useCartStore()
        const product = { id: 1, name: 'Item 1', price: 100 }
        
        store.addToCart(product)
        store.addToCart(product)
        
        expect(store.cartItems).toHaveLength(1)
        expect(store.cartItems[0].quantity).toBe(2)
    })
    
    it('calculates total price correctly', () => {
        const store = useCartStore()
        store.addToCart({ id: 1, price: 100 })
        store.addToCart({ id: 1, price: 100 }) // qty 2
        store.addToCart({ id: 2, price: 50 })  // qty 1
        
        expect(store.totalPrice).toBe(250)
    })
    
    it('removes item when quantity decrements to 0', () => {
        const store = useCartStore()
        store.addToCart({ id: 1, price: 100 })
        
        store.decrementQuantity(1)
        
        expect(store.cartItems).toHaveLength(0)
    })
})
