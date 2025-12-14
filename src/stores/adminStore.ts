import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import { ElMessage } from 'element-plus'

export interface Order {
  id: string
  userId: string
  items: any[]
  totalPrice: number
  info: {
    recipient: {
      name: string
      phone: string
    }
    delivery: {
      method: string
      storeName: string
      storeAddress: string
      storeId?: string
      storeCity?: string
      storeDistrict?: string
    }
    payment: {
      method: string
    }
  }
  status: 'pending' | 'shipped' | 'delivered' | 'problem'
  note?: string // For problem orders
  createdAt: any
}

export const useAdminStore = defineStore('admin', () => {
  const allOrders = ref<Order[]>([])
  const loading = ref(false)

  // Fetch All Orders
  const fetchAllOrders = async () => {
    loading.value = true
    try {
      // In real app, consider pagination with limit() and startAfter()
      // For now, fetch all as per requirements
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      allOrders.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
    } catch (error: any) {
      console.error('Fetch Orders Error:', error)
      ElMessage.error('Failed to fetch orders')
    } finally {
      loading.value = false
    }
  }

  // Update Order Status
  const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      const updateData: any = { status }

      if (note !== undefined) {
        updateData.note = note
      }

      if (status !== 'problem') {
        // Clear note if status is not problem, or keep it history? 
        // User req: "If problem... input note... show remarks". 
        // Usually good to keep history but let's just update the field.
        // If switching OUT of problem, maybe we don't clear it automatically unless requested.
        // But logic says: "If problem... must input note". 
      }

      await updateDoc(orderRef, updateData)

      // Update local state
      const target = allOrders.value.find(o => o.id === orderId)
      if (target) {
        target.status = status as any
        if (note !== undefined) target.note = note
      }

      ElMessage.success('Order status updated')
    } catch (error: any) {
      console.error('Update Status Error:', error)
      ElMessage.error('Failed to update status')
      throw error
    }
  }

  // Delete Order
  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId))

      // Update local state
      allOrders.value = allOrders.value.filter(o => o.id !== orderId)

      ElMessage.success('Order deleted')
    } catch (error: any) {
      console.error('Delete Order Error:', error)
      ElMessage.error('Failed to delete order')
    }
  }

  return {
    allOrders,
    loading,
    fetchAllOrders,
    updateOrderStatus,
    deleteOrder
  }
})
