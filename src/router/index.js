import { createRouter, createWebHistory } from 'vue-router'
import ProductListPage from '../views/ProductListPage.vue'
import ProductManagementPage from '../views/ProductManagementPage.vue'
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
      path: '/admin/products',
      name: 'product-management',
      component: ProductManagementPage
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
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutPage.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatRoom.vue')
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../views/SalesStatsPage.vue')
    },
    {
      path: '/presentation',
      name: 'presentation',
      component: () => import('../views/PresentationPage.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router
