<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/authStore'

const { t } = useI18n()
const authStore = useAuthStore()
const orders = ref([])
const loading = ref(true)

const fetchOrders = async () => {
  if (!authStore.user) {
    loading.value = false
    return
  }

  try {
    // Remove orderBy to avoid Firestore Composite Index creation error
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', authStore.user.uid)
    )
    
    const querySnapshot = await getDocs(q)
    const fetchedOrders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to Date
    }))

    // Client-side sort
    orders.value = fetchedOrders.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error('Error fetching orders:', error)
    ElMessage.error(t('error.network'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isInitialized) {
    fetchOrders()
  } else {
    const unwatch = watch(
      () => authStore.isInitialized,
      (val) => {
        if (val) {
          unwatch()
          fetchOrders()
        }
      }
    )
  }
})

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{{ t('account.my_orders') }}</h2>
    
    <div v-if="loading" class="py-10 text-center text-gray-400">
      <i class="el-icon-loading animate-spin mr-2"></i> {{ t('account.loading') }}
    </div>

    <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center h-[400px] text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p>{{ t('account.no_orders') }}</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors">
        <div class="flex flex-wrap justify-between items-start gap-4 mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
          <div>
            <span class="text-xs text-gray-500 uppercase tracking-wider block mb-1">{{ t('order.id') }}</span>
            <span class="font-mono text-sm font-bold text-gray-700 dark:text-gray-200">#{{ order.id.slice(0, 8) }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 uppercase tracking-wider block mb-1">{{ t('order.date') }}</span>
            <span class="text-sm text-gray-700 dark:text-gray-200">{{ formatDate(order.createdAt) }}</span>
          </div>
          <div>
            <span class="text-xs text-gray-500 uppercase tracking-wider block mb-1">{{ t('order.status') }}</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {{ t('order.pending') }}
            </span>
          </div>
          <div class="text-right ml-auto">
            <span class="text-xs text-gray-500 uppercase tracking-wider block mb-1">{{ t('order.total') }}</span>
            <span class="text-lg font-bold text-blue-600 dark:text-blue-400">${{ order.totalPrice }}</span>
          </div>
        </div>


        
        <!-- Order Info (Recipient, Delivery, Payment) -->
        <div v-if="order.info" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
           <div>
              <span class="text-xs text-gray-500 block mb-1">{{ t('checkout.recipient_info') }}</span>
              <p class="text-gray-700 dark:text-gray-200 font-medium">{{ order.info.recipient?.name }} / {{ order.info.recipient?.phone }}</p>
           </div>
           <div>
              <span class="text-xs text-gray-500 block mb-1">{{ t('checkout.delivery_method') }}</span>
              <p class="text-gray-700 dark:text-gray-200 font-medium">{{ order.info.delivery?.method }} - {{ order.info.delivery?.storeName }}</p>
              <p class="text-gray-500 text-xs">{{ order.info.delivery?.storeAddress }}</p>
           </div>
           <div>
              <span class="text-xs text-gray-500 block mb-1">{{ t('checkout.payment_method') }}</span>
              <p class="text-gray-700 dark:text-gray-200 font-medium">
                {{ order.info.payment?.method === 'COD' ? t('checkout.payment_cod') : order.info.payment?.method }}
              </p>
           </div>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <span class="text-xs text-gray-500 uppercase tracking-wider block mb-2">{{ t('order.items') }}</span>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="(item, i) in order.items" 
              :key="i"
              class="flex items-center gap-2 bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 text-sm"
            >
              <img :src="item.imageUrl || item.image" class="w-6 h-6 object-cover rounded" v-if="item.imageUrl || item.image" />
              <span class="text-gray-700 dark:text-gray-200">{{ item.name || item.title }}</span>
              <span class="text-gray-400 text-xs">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
