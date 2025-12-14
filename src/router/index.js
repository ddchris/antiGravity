import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
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
      component: ContactPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartPage
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutPage.vue'),
      meta: { requiresAuth: true }
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
    },
    {
      path: '/account',
      component: () => import('../views/PersonalCenter.vue'),
      redirect: '/account/orders',
      children: [
        {
          path: 'orders',
          name: 'MyOrders',
          component: () => import('../views/MyOrders.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && authStore.isInitialized && !authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
