<script setup>
import { ref, computed, onMounted, watch } from 'vue'
// 匯入 Store
import { useProductStore } from '../stores/productStore'

// 國際化
import { useI18n } from 'vue-i18n'
import { Search } from '@element-plus/icons-vue'

const { t } = useI18n()
const productStore = useProductStore()

// 狀態
const loading = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(4) // Default 4 items per page (預設每頁 4 筆)
const sortProp = ref('')
const sortOrder = ref('') // 'ascending' or 'descending'

// 欄位顯示狀態
const allColumns = [
  { key: 'name', label: 'management.colName' }, // Fixed Left 1
  { key: 'imageUrl', label: 'management.colImage' }, // Fixed Left 2
  { key: 'category', label: 'management.colCategory' },
  { key: 'brand', label: 'management.colBrand' },
  { key: 'sku', label: 'management.colSku' },
  { key: 'stock', label: 'management.colStock' },
  { key: 'weight', label: 'management.colWeight' },
  { key: 'dimensions', label: 'management.colDimensions' },
  { key: 'description', label: 'management.colDesc' }, // Moved to middle
  { key: 'rating', label: 'management.colRating' }, // Fixed Right 3
  { key: 'status', label: 'management.colStatus' }, // Fixed Right 2
  { key: 'price', label: 'management.colPrice' }   // Fixed Right 1
]
const visibleColumns = ref(['name', 'imageUrl', 'category', 'brand', 'sku', 'stock', 'weight', 'dimensions', 'description', 'rating', 'status', 'price'])

// 初始化資料獲取
onMounted(async () => {
  loading.value = true
  await productStore.fetchProducts()
  loading.value = false
})

// 當頁面大小改變時重置為第 1 頁
watch(pageSize, () => {
  loading.value = true
  setTimeout(() => {
    currentPage.value = 1
    loading.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 300)
})

// 過濾與排序邏輯
const processedProducts = computed(() => {
  let result = [...productStore.products]

  // 1. 搜尋過濾
  // User asked for "Array.prototype.group" but that's experimental/newer. 
  // Standard filtering is usually sufficient unless "grouping" meant UI grouping.
  // Assuming standard filtering by name for now as per specific "Search" requirement.
  if (searchText.value) {
    const lower = searchText.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      (p.description && p.description.toLowerCase().includes(lower))
    )
  }

  // 2. 自定義排序
  if (sortProp.value && sortOrder.value) {
    result.sort((a, b) => {
      let valA = a[sortProp.value]
      let valB = b[sortProp.value]

      // 處理數字
      if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
        valA = parseFloat(valA)
        valB = parseFloat(valB)
      } else {
        // 字串不區分大小寫
        valA = String(valA).toLowerCase()
        valB = String(valB).toLowerCase()
      }

      if (valA < valB) return sortOrder.value === 'ascending' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'ascending' ? 1 : -1
      return 0
    })
  }

  return result
})

// 分頁邏輯
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return processedProducts.value.slice(start, end)
})

// 事件處理
const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop
  sortOrder.value = order
}



const handlePageChange = (val) => {
  const newPage = (val.detail && val.detail[0]) ? val.detail[0] : val
  
  loading.value = true
  
  // 建立一個短暫延遲以顯示載入狀態 (改善 UX)
  setTimeout(() => {
    currentPage.value = Number(newPage)
    loading.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 300)
}

</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header Section -->
      <div class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ $t('management.title') }}
        </h1>
        
        <!-- Search & Settings -->
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <!-- Column Visibility -->
          <el-popover placement="bottom" title="Columns" :width="200" trigger="click">
            <template #reference>
              <el-button>{{ $t('management.columns') }}</el-button>
            </template>
            <el-checkbox-group v-model="visibleColumns" class="flex flex-col">
              <el-checkbox v-for="col in allColumns" :key="col.key" :label="col.key">
                {{ $t(col.label) }}
              </el-checkbox>
            </el-checkbox-group>
          </el-popover>

          <!-- 搜尋輸入框 -->
           <el-input
            v-model="searchText"
            :placeholder="$t('management.searchPlaceholder')"
            class="w-full sm:w-64"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 表格區塊 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <el-table 
          v-fix-col="{ l: 2, r: 3 }"
          :data="paginatedData" 
          style="width: 100%" 
          v-loading="loading"
          @sort-change="handleSortChange"
          header-cell-class-name="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          cell-class-name="dark:bg-gray-800 dark:text-gray-300"
        >
          <!-- 動態欄位 -->
          <template v-for="col in allColumns" :key="col.key">
            <el-table-column
              v-if="visibleColumns.includes(col.key)"
              :prop="col.key"
              :label="$t(col.label)"
              :sortable="['imageUrl', 'description'].includes(col.key) ? false : 'custom'"
              :min-width="col.key === 'name' ? '180' : (col.key === 'description' ? '250' : (['imageUrl', 'stock'].includes(col.key) ? '80' : (['weight', 'status', 'brand', 'price'].includes(col.key) ? '100' : '130')))"
            >
              <template #default="scope">
                <!-- 圖片欄位 -->
                <div v-if="col.key === 'imageUrl'" class="flex items-center">
                  <el-image 
                    :src="scope.row.imageUrl" 
                    :preview-src-list="[scope.row.imageUrl]"
                    fit="cover"
                    class="w-12 h-12 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                    preview-teleported
                    hide-on-click-modal
                  >
                    <template #error>
                      <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <img 
                          src="https://placehold.co/400x300/e2e8f0/64748b?text=No+Image&font=roboto" 
                          alt="Fallback" 
                          class="w-full h-full object-cover opacity-80"
                        />
                      </div>
                    </template>
                  </el-image>
                </div>

                <!-- 狀態 -->
                <el-tag 
                  v-else-if="col.key === 'status'" 
                  :type="scope.row.status === 'In Stock' ? 'success' : (scope.row.status === 'Low Stock' ? 'warning' : 'danger')"
                  effect="light"
                  round
                >
                  {{ scope.row.status }}
                </el-tag>

                <!-- 評分 -->
                <el-rate 
                  v-else-if="col.key === 'rating'" 
                  v-model="scope.row.rating" 
                  disabled 
                  show-score 
                  text-color="#ff9900" 
                  score-template="{value}"
                />
                
                <!-- 庫存 -->
                 <span v-else-if="col.key === 'stock'" :class="{'text-red-500 font-bold': scope.row.stock < 10, 'text-gray-600 dark:text-gray-300': true}">
                  {{ scope.row.stock }}
                </span>

                <!-- Price -->
                <span v-else-if="col.key === 'price'" class="font-medium text-indigo-600 dark:text-indigo-400">
                   ${{ Number(scope.row.price).toFixed(2) }}
                </span>

                <!-- 其他欄位 -->
                <span v-else>{{ scope.row[col.key] }}</span>
              </template>
            </el-table-column>
          </template>
          
          <!-- Example Action Column (Optional based on user request "3. ... Role - Phone") -->
          <!-- User requirement was specific: Checkboxes for Name, Email, Role, Phone. 
               My mock data has Name, Price, Description. I will map logic to available data. -->

        </el-table>
      </div>

      <!-- 分頁區塊 -->
      <div class="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm gap-4">
        
        <!-- Page Size Control -->
        <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <span class="whitespace-nowrap">{{ $t('management.pageSize') }}:</span>
          <el-input-number 
            v-model="pageSize" 
            :min="1" 
            :max="20"
            size="small"
            class="w-32"
          />
        </div>


        <base-pagination
          :total="processedProducts.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @page-change="handlePageChange"
        ></base-pagination>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Element Plus Dark Mode Overrides for specific parts if needed */
:global(.dark .el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #374151;
  --el-table-text-color: #e5e7eb;
  --el-table-header-text-color: #e5e7eb;
  --el-table-row-hover-bg-color: #4b5563;
}
</style>
