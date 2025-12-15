<script setup>
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchStores, getCities, getDistricts } from '../mock/storeService'
import { Search, ArrowLeft } from '@element-plus/icons-vue'
import BaseImage from '../components/BaseImage.vue'

const router = useRouter()
const { t, locale: currentLocale } = useI18n()
const cartStore = useCartStore()
const authStore = useAuthStore()

const formRef = ref(null)
const showStoreDialog = ref(false)
const selectedStore = ref(null)

// Store Selection Data
const allStores = ref([])
const cityOptions = ref([])
const districtOptions = ref([])
const loadingStores = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Store Selection Filters
const storeFilter = reactive({
  city: '',
  district: '',
  keyword: ''
})

const form = reactive({
  recipientName: '',
  recipientPhone: '',
  deliveryMethod: '711',
  paymentMethod: 'COD'
})

// Validation Rules
const rules = computed(() => ({
  recipientName: [
    { required: true, message: t('checkout.validation.name_required'), trigger: 'blur' },
    { min: 2, message: t('checkout.validation.name_length'), trigger: 'blur' },
    { 
      pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/, 
      message: t('checkout.validation.name_format'), 
      trigger: 'blur' 
    }
  ],
  recipientPhone: [
    { required: true, message: t('checkout.validation.phone_required'), trigger: 'blur' },
    { 
      pattern: /^(09\d{8}|8869\d{8})$/, 
      message: t('checkout.validation.phone_format'), 
      trigger: 'blur' 
    }
  ]
}))

// Fetch Data for Dialog
const initStoreData = async () => {
  loadingStores.value = true
  try {
    allStores.value = await fetchStores()
    cityOptions.value = getCities(currentLocale.value)
  } catch (e) {
    ElMessage.error('Failed to load store data')
  } finally {
    loadingStores.value = false
  }
}

// Watchers for Filter Logic
const refreshFilters = () => {
  storeFilter.city = ''
  storeFilter.district = ''
  cityOptions.value = getCities(currentLocale.value)
}

watch(currentLocale, () => {
  refreshFilters()
})

watch(() => storeFilter.city, (newCity) => {
  storeFilter.district = '' 
  if (newCity) {
    districtOptions.value = getDistricts(newCity, currentLocale.value)
  } else {
    districtOptions.value = []
  }
})

const filteredStores = computed(() => {
  // Optimization: Don't show any stores if no filter is active
  if (!storeFilter.city && !storeFilter.keyword) {
    return []
  }

  const isEn = currentLocale.value === 'en'
  const nameKey = isEn ? 'StoreName_En' : 'StoreName'
  const addressKey = isEn ? 'StoreAddress_En' : 'StoreAddress'
  const cityKey = isEn ? 'City_En' : 'City'
  const districtKey = isEn ? 'District_En' : 'District'

  return allStores.value.filter(store => {
    const matchCity = storeFilter.city ? store[cityKey] === storeFilter.city : true
    const matchDistrict = storeFilter.district ? store[districtKey] === storeFilter.district : true
    
    // Search keyword in both languages for better UX
    const keyword = storeFilter.keyword.toLowerCase()
    const matchKeyword = keyword 
      ? (store[nameKey]?.toLowerCase().includes(keyword) || store[addressKey]?.toLowerCase().includes(keyword))
      : true
      
    if (matchCity && matchDistrict && matchKeyword) {
        return true
    }
    return false
  }).map(store => ({
      ...store,
      DisplayName: store[nameKey],
      DisplayAddress: store[addressKey],
      DisplayCity: store[cityKey],
      DisplayDistrict: store[districtKey]
  }))
})

const openStoreDialog = () => {
  showStoreDialog.value = true
  if (allStores.value.length === 0) {
    initStoreData()
  } else {
    // Refresh options in case language changed while closed
    cityOptions.value = getCities(currentLocale.value)
  }
}

// Store Selection Logic
const handleSelectStore = (store) => {
  selectedStore.value = {
    id: store.StoreId,
    name: store.DisplayName, // Dynamic based on current lang
    address: store.DisplayAddress,
    city: store.DisplayCity,
    district: store.DisplayDistrict,
    original: store 
  }
  showStoreDialog.value = false
}

// LocalStorage Logic
const loadDefaultInfo = () => {
  const savedInfo = localStorage.getItem('defaultShippingInfo')
  if (savedInfo) {
    try {
      const parsed = JSON.parse(savedInfo)
      form.recipientName = parsed.recipientName || ''
      form.recipientPhone = parsed.recipientPhone || ''
      if (parsed.storeId) {
        // Use saved store info
        if (parsed.store) {
           selectedStore.value = parsed.store
        }
      }
    } catch (e) {
      console.error('Failed to load default info', e)
    }
  }
}

const saveAsDefault = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (!selectedStore.value) {
      ElMessage.warning(t('checkout.validation.store_required'))
      return
    }

    const infoToSave = {
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      storeId: selectedStore.value.id,
      store: selectedStore.value 
    }
    
    localStorage.setItem('defaultShippingInfo', JSON.stringify(infoToSave))
    ElMessage.success(t('checkout.save_success'))
  } catch (e) {
    // Validation failed
  }
}

// Submit Order
const handleSubmit = async () => {
  if (!formRef.value) return

  // 1. Element Plus Form Validation
  try {
    await formRef.value.validate()
  } catch (e) {
    ElMessage.warning(t('contact.validationError') || 'Please check the input fields')
    return
  }

  // 2. Validate Store
  if (!selectedStore.value) {
    ElMessage.warning(t('checkout.validation.store_required') || 'Please select a store')
    return
  }

  // 3. Confirmation
  try {
    await ElMessageBox.confirm(
      t('order.confirm_msg'), 
      t('checkout.title'),
      {
        confirmButtonText: t('checkout.submit_order'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
  } catch (e) {
    return // User cancelled
  }

  // 4. Submit Order
  try {
    const orderInfo = {
      recipient: {
        name: form.recipientName,
        phone: form.recipientPhone
      },
      delivery: {
        method: '7-11',
        storeName: selectedStore.value.name,
        storeAddress: selectedStore.value.address,
        storeId: selectedStore.value.id,
        storeCity: selectedStore.value.city,
        storeDistrict: selectedStore.value.district
      },
      payment: {
        method: form.paymentMethod
      }
    }

    await cartStore.submitOrder(authStore.user.uid, orderInfo)
    
    ElMessage.success(t('order.success'))
    router.push('/account/orders')

  } catch (e) {
    console.error('Order Submit Error:', e)
    ElMessage.error(t('error.serverError') || 'System Error')
  }
}

onMounted(() => {
  // Check auth - Wait for initialization
  const checkAuth = () => {
    if (!authStore.isAuthenticated) {
      router.push('/cart')
      return
    }
     
    // Check empty cart
    if (cartStore.cartItems.length === 0) {
      ElMessage.warning(t('cart.empty'))
      router.push('/')
      return
    }

    loadDefaultInfo()
  }

  // Check mobile on mount
  checkMobile()
  window.addEventListener('resize', checkMobile)

  if (authStore.isInitialized) {
    checkMobile() // Ensure it runs
    checkAuth()
  } else {
    const unwatch = watch(
      () => authStore.isInitialized,
      (isInit) => {
        if (isInit) {
          checkAuth()
          unwatch()
        }
      }
    )
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(price)
}
</script>

<template>
  <div class="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
    <div class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-colors relative my-auto animate-fade-in-up">
      <div class="p-5">
        <div class="flex items-center mb-4 relative border-b dark:border-gray-700 pb-3">
          <el-button 
            @click="router.push('/cart')" 
            link 
            class="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <el-icon :size="18"><ArrowLeft /></el-icon>
            <span class="ml-1 text-sm font-bold">{{ t('common.back') || 'Back' }}</span>
          </el-button>
          <h1 class="text-xl font-bold text-center flex-1 pr-16 text-gray-800 dark:text-gray-100">
            {{ t('checkout.title') }}
          </h1>
        </div>

        <div class="mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 custom-summary">
          <h2 class="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 border-b dark:border-gray-600 pb-1">
            {{ t('order.items') || 'Order Items' }}
          </h2>
          <div class="space-y-2 max-h-32 overflow-y-auto pr-1">
            <div v-for="item in cartStore.cartItems" :key="item.id" class="flex justify-between items-center text-sm py-1">
               <div class="flex items-center gap-3 overflow-hidden">
                 <BaseImage :src="item.imageUrl" :alt="item.name" class-name="w-8 h-8 object-cover rounded flex-shrink-0 border border-gray-200 dark:border-gray-600" />
                 <div class="flex flex-col min-w-0">
                   <span class="font-bold text-gray-700 dark:text-gray-200 truncate text-xs">{{ item.name }}</span>
                   <span class="text-gray-500 dark:text-gray-400 text-[10px]">{{ t('cart.quantity') }}: {{ item.quantity }}</span>
                 </div>
               </div>
               <div class="font-bold text-gray-700 dark:text-gray-300 ml-2 text-xs">
                 {{ formatPrice(item.price * item.quantity) }}
               </div>
            </div>
          </div>
          <div class="border-t dark:border-gray-600 pt-2 flex justify-end mt-1">
             <span class="text-gray-600 dark:text-gray-300 font-bold text-xs mr-2 self-center">{{ t('cart.total') }}:</span>
             <span class="text-indigo-600 dark:text-indigo-400 font-bold text-base">{{ formatPrice(cartStore.totalPrice) }}</span>
          </div>
        </div>

        <el-form 
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="checkout-form compact-form"
          size="default" 
        >
          <!-- Recipient Info -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2 border-b dark:border-gray-700 pb-1">
              <h2 class="text-base font-bold text-gray-700 dark:text-gray-200">
                {{ t('checkout.recipient_info') }}
              </h2>
              <base-button type="primary" link size="small" :name="t('checkout.save_default')" @click="saveAsDefault" />
            </div>
          
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item :label="t('checkout.recipient_name')" prop="recipientName" class="!mb-3">
                <el-input 
                  v-model="form.recipientName" 
                  :placeholder="t('checkout.recipient_name')"
                  size="default"
                />
              </el-form-item>
              
              <el-form-item :label="t('checkout.recipient_phone')" prop="recipientPhone" class="!mb-3">
                <el-input 
                  v-model="form.recipientPhone" 
                  :placeholder="t('checkout.recipient_phone')"
                  size="default"
                  maxlength="11" 
                />
              </el-form-item>
            </div>
          </div>

          <!-- Delivery Info -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">
              {{ t('checkout.delivery_method') }}
            </h2>
            
            <el-form-item>
              <el-radio-group v-model="form.deliveryMethod" size="large">
                <el-radio-button label="711">7-11 {{ t('checkout.store_select') }}</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div v-if="!selectedStore" class="text-center py-4">
                <p class="text-gray-500 dark:text-gray-400 mb-4">{{ t('checkout.validation.store_required') }}</p>
                <base-button type="primary" :name="t('checkout.store_select')" @click="openStoreDialog" />
              </div>
              <div v-else class="flex items-center justify-between">
                <div>
                  <p class="font-bold text-lg text-gray-800 dark:text-white">{{ selectedStore.name }}</p>
                  <p class="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    {{ selectedStore.city }}{{ selectedStore.district }}{{ selectedStore.address }}
                  </p>
                  <p class="text-gray-500 text-xs mt-1">ID: {{ selectedStore.id }}</p>
                </div>
                <base-button type="primary" plain size="small" :name="t('common.edit') || 'Change'" @click="openStoreDialog" />
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-700 pb-2">
              {{ t('checkout.payment_method') }}
            </h2>
            
            <el-select v-model="form.paymentMethod" size="large" class="w-full md:w-1/2" disabled>
              <el-option value="COD" :label="t('checkout.payment_cod')" />
            </el-select>
          </div>

          <!-- Summary & Actions -->
          <div class="border-t dark:border-gray-700 pt-6 mt-8 flex justify-end">
            <div class="w-full md:w-1/3 flex flex-col gap-4">
              <div class="flex justify-between text-lg font-bold">
                <span class="text-gray-700 dark:text-gray-200">{{ t('cart.total') }}</span>
                <span class="text-indigo-600 dark:text-indigo-400">
                  ${{ cartStore.totalPrice }}
                </span>
              </div>
              
              <base-button 
                type="primary"
                :name="t('checkout.submit_order')"
                @click.prevent="handleSubmit"
                class="w-full !py-3.5 !text-lg !font-bold shadow-lg"
              />
            </div>
          </div>
        </el-form>
      </div>

    <!-- Store Selection Dialog -->
    <el-dialog
      v-model="showStoreDialog"
      :title="t('checkout.store_select')"
      width="90%"
      max-width="800px"
      append-to-body
      class="store-dialog"
    >
      <div class="flex flex-col gap-4">
        <!-- Filters -->
        <div class="flex flex-col md:flex-row gap-4 mb-2">
           <el-select v-model="storeFilter.city" :placeholder="t('checkout.validation.select_city')" class="flex-1">
             <el-option v-for="city in cityOptions" :key="city" :label="city" :value="city" />
           </el-select>
           
           <el-select v-model="storeFilter.district" :placeholder="t('checkout.validation.select_district')" class="flex-1" :disabled="!storeFilter.city">
             <el-option v-for="dist in districtOptions" :key="dist" :label="dist" :value="dist" />
           </el-select>

           <el-input 
             v-model="storeFilter.keyword" 
             :placeholder="t('checkout.validation.search_placeholder')"
             class="flex-[1.5]"
             :prefix-icon="Search"
             clearable
           />
        </div>

        <!-- Results Table -->
        <div class="h-[400px] overflow-auto border rounded-lg">
           <el-table 
             :data="filteredStores" 
             style="width: 100%" 
             v-loading="loadingStores"
             highlight-current-row
             @current-change="handleSelectStore"
             @row-click="handleSelectStore"
             :border="false"
             :empty-text="t('common.no_data') || 'No stores found'"
           >
              <el-table-column prop="DisplayName" :label="t('checkout.validation.col_name')" width="95" header-align="center" align="center" />
              <el-table-column prop="DisplayAddress" :label="t('checkout.validation.col_address')" min-width="200" header-align="center" />
              <el-table-column 
                v-if="!isMobile"
                :label="t('checkout.validation.col_action')" 
                width="80" 
                align="center"
              >
                <template #default="scope">
                   <base-button type="primary" size="small" link :name="t('checkout.validation.select')" />
                </template>
              </el-table-column>
           </el-table>
        </div>
        
        <div class="text-right text-sm text-gray-500">
           {{ t('management.pageSize') }} {{ filteredStores.length }} 
        </div>

      </div>
    </el-dialog>
    </div>
  </div>
</template>

<style scoped>
:deep(.el-table__row) {
  cursor: pointer;
}

@media (max-width: 768px) {
  :deep(.el-table .cell) {
    font-size: 12px !important; 
    padding: 0 2px !important;
    line-height: 1.3 !important;
  }
  
  :deep(.el-table .el-table__cell) {
    padding: 4px 0 !important;
  }
}
</style>
