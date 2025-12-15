<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useAdminStore } from '../stores/adminStore'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const { t } = useI18n()
const adminStore = useAdminStore()
const authStore = useAuthStore()

// State
const currentPage = ref(1)
const pageSize = ref(8)
const currentStatusFilter = ref('all') // 'all', 'pending', 'shipped', ...

// Dialog
const showDialog = ref(false)
const editForm = reactive({
  id: '',
  status: '',
  note: ''
})

onMounted(() => {
  adminStore.fetchAllOrders()
})

// Filter & Pagination
const filteredOrders = computed(() => {
  let orders = adminStore.allOrders
  if (currentStatusFilter.value !== 'all') {
    orders = orders.filter(o => o.status === currentStatusFilter.value)
  }
  return orders
})

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredOrders.value.slice(start, end)
})

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price)
}

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  // Handle Firestore Timestamp or Date
  const d = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// Actions
const openEditDialog = (order) => {
  editForm.id = order.id
  editForm.status = order.status
  editForm.note = order.note || ''
  showDialog.value = true
}

const handleUpdateStatus = async () => {
  if (editForm.status === 'problem' && !editForm.note.trim()) {
    ElMessage.warning(t('admin.dialog.notePlaceholder'))
    return
  }

  try {
    await adminStore.updateOrderStatus(editForm.id, editForm.status, editForm.note)
    showDialog.value = false
    ElMessage.success(t('admin.dialog.updateSuccess'))
  } catch (e) {
    // handled in store
  }
}



// Status Colors
const getStatusTagType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'shipped': return 'primary'
    case 'delivered': return 'success'
    case 'problem': return 'danger'
    default: return 'info'
  }
}
</script>

<template>
  <!-- Loading State (Show only if NOT initialized AND NOT authenticated) -->
  <div v-if="!authStore.isInitialized && !authStore.isAuthenticated" class="flex justify-center items-center py-20 min-h-[500px]">
    <el-icon class="is-loading text-4xl text-gray-400"><Loading /></el-icon>
  </div>

  <div v-else class="container mx-auto px-4 py-8 mt-6 min-h-[calc(100vh-80px)]">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {{ t('admin.orderManagement') }}
        </h1>
        
        <!-- Status Filter -->
        <el-select v-model="currentStatusFilter" class="w-40">
          <el-option :label="t('admin.status.all')" value="all" />
          <el-option :label="t('admin.status.pending')" value="pending" />
          <el-option :label="t('admin.status.shipped')" value="shipped" />
          <el-option :label="t('admin.status.delivered')" value="delivered" />
          <el-option :label="t('admin.status.problem')" value="problem" />
        </el-select>
      </div>

      <!-- Table -->
      <el-table 
        v-loading="adminStore.loading"
        :data="paginatedOrders" 
        style="width: 100%" 
        class="rounded-lg overflow-hidden"
      >
        <!-- ID -->
        <el-table-column prop="id" :label="t('admin.table.id')" width="180">
          <template #default="{ row }">
            <span class="font-mono text-xs text-gray-500">{{ row.id.substring(0,8) + '...' }}</span>
          </template>
        </el-table-column>

        <!-- Date -->
        <el-table-column :label="t('admin.table.date')" width="180">
          <template #default="{ row }">
            <span class="text-sm">{{ formatDate(row.createdAt) }}</span>
          </template>
        </el-table-column>

        <!-- Recipient -->
        <el-table-column :label="t('admin.table.recipient')" min-width="150">
          <template #default="{ row }">
            <div class="text-sm">
              <p class="font-bold text-gray-800 dark:text-gray-200">{{ row.info.recipient.name }}</p>
              <p class="text-gray-500 text-xs">{{ row.info.recipient.phone }}</p>
            </div>
          </template>
        </el-table-column>
        
        <!-- Store Address (Special Requirement) -->
        <el-table-column :label="t('admin.table.address')" min-width="200">
          <template #default="{ row }">
            <!-- Desktop Hover / Mobile Touch -->
            <el-tooltip 
              effect="dark" 
              :content="row.info.delivery.storeName + ': ' + row.info.delivery.storeAddress" 
              placement="top"
              :show-after="200"
            >
              <div 
                class="truncate cursor-pointer touch-manipulation hover:text-indigo-600 transition-colors"
                @touchstart.passive="$event.target.classList.remove('truncate')"
                @touchend.passive="$event.target.classList.add('truncate')"
                @mousedown="$event.target.classList.remove('truncate')"
                @mouseup="$event.target.classList.add('truncate')"
              >
                <span class="font-bold text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded mr-1">
                   {{ row.info.delivery.method }}
                </span>
                {{ row.info.delivery.storeName }}
              </div>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- Amount -->
        <el-table-column :label="t('admin.table.amount')" width="120">
          <template #default="{ row }">
            <span class="font-bold text-indigo-600">{{ formatPrice(row.totalPrice) }}</span>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column :label="t('admin.table.status')" width="140">
           <template #default="{ row }">
             <el-tag :type="getStatusTagType(row.status)">
               {{ t(`admin.status.${row.status}`) }}
             </el-tag>
             <div v-if="row.status === 'problem' && row.note" class="text-xs text-red-500 mt-1">
               {{ row.note }}
             </div>
           </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column :label="t('admin.table.action')" width="150" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <base-button type="primary" size="small" link :name="t('management.edit')" @click="openEditDialog(row)" />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="mt-6 flex justify-center">
         <el-pagination
           v-model:current-page="currentPage"
           v-model:page-size="pageSize"
           :page-sizes="[8, 16, 32, 64]"
           layout="total, sizes, prev, pager, next"
           :total="filteredOrders.length"
           @size-change="handleSizeChange"
           @current-change="handleCurrentChange"
         />
      </div>
    </div>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="showDialog"
      :title="t('admin.dialog.updateStatus')"
      width="320px"
    >
      <el-form label-position="top">
        <el-form-item :label="t('admin.table.status')">
           <el-select v-model="editForm.status" class="w-full">
             <el-option :label="t('admin.status.pending')" value="pending" />
             <el-option :label="t('admin.status.shipped')" value="shipped" />
             <el-option :label="t('admin.status.delivered')" value="delivered" />
             <el-option :label="t('admin.status.problem')" value="problem" />
           </el-select>
        </el-form-item>
        
        <el-form-item 
          v-if="editForm.status === 'problem'" 
          :label="t('admin.table.note')"
          required
        >
          <el-input 
            v-model="editForm.note" 
            type="textarea" 
            :placeholder="t('admin.dialog.notePlaceholder')" 
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <base-button :name="t('common.cancel')" @click="showDialog = false" class="mr-2" />
          <base-button type="primary" :name="t('common.confirm')" @click="handleUpdateStatus" />
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* Mobile optimized tweaks */
@media (max-width: 768px) {
  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
}
</style>
