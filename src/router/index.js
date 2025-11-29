import { createRouter, createWebHistory } from 'vue-router'
import ProductListPage from '../views/ProductListPage.vue'
import ContactPage from '../views/ContactPage.vue'
import CartPage from '../views/CartPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ProductListPage
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactPage
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartPage
    }
  ]
})

export default router
