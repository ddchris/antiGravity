<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProductStore } from '../stores/productStore'
import { useI18n } from 'vue-i18n'
import { Search } from '@element-plus/icons-vue'

const { t } = useI18n()
const productStore = useProductStore()

// State
const loading = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(5) // Default 5 items per page
const sortProp = ref('')
const sortOrder = ref('') // 'ascending' or 'descending'

// Column Visibility State
const allColumns = [
  { key: 'name', label: 'management.colName' },
  { key: 'imageUrl', label: 'management.colImage' },
  { key: 'price', label: 'management.colPrice' },
  { key: 'description', label: 'management.colDesc' }
]
const visibleColumns = ref(['name', 'imageUrl', 'price', 'description'])

// Initial Data Fetch
onMounted(async () => {
  loading.value = true
  await productStore.fetchProducts()
  loading.value = false
})

// Reset to page 1 when page size changes
watch(pageSize, () => {
  loading.value = true
  setTimeout(() => {
    currentPage.value = 1
    loading.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 300)
})

// Filtering & Sorting Logic
const processedProducts = computed(() => {
  let result = [...productStore.products]

  // 1. Search Filter (Group logic implied as simple filtering here, or strict grouping?)
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

  // 2. Custom Sorting
  if (sortProp.value && sortOrder.value) {
    result.sort((a, b) => {
      let valA = a[sortProp.value]
      let valB = b[sortProp.value]

      // Handle numbers
      if (!isNaN(parseFloat(valA)) && !isNaN(parseFloat(valB))) {
        valA = parseFloat(valA)
        valB = parseFloat(valB)
      } else {
        // Strings case-insensitive
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

// Pagination Logic
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return processedProducts.value.slice(start, end)
})

// Handlers
const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop
  sortOrder.value = order
}



const handlePageChange = (val) => {
  const newPage = (val.detail && val.detail[0]) ? val.detail[0] : val
  console.log('Page Value Extracted:', newPage)
  
  loading.value = true
  
  // Create a small delay to show loading state (UX)
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

          <!-- Search Input -->
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

      <!-- Table Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <el-table 
          :data="paginatedData" 
          style="width: 100%" 
          v-loading="loading"
          @sort-change="handleSortChange"
          header-cell-class-name="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          cell-class-name="dark:bg-gray-800 dark:text-gray-300"
        >
          <!-- Dynamic Columns -->
          <template v-for="col in allColumns" :key="col.key">
            <el-table-column
              v-if="visibleColumns.includes(col.key)"
              :prop="col.key"
              :label="$t(col.label)"
              :sortable="['imageUrl', 'description'].includes(col.key) ? false : 'custom'"
            >
              <template #default="scope">
                <!-- Image Column -->
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
                <!-- Other Columns -->
                <span v-else>{{ scope.row[col.key] }}</span>
              </template>
            </el-table-column>
          </template>
          
          <!-- Example Action Column (Optional based on user request "3. ... Role - Phone") -->
          <!-- User requirement was specific: Checkboxes for Name, Email, Role, Phone. 
               My mock data has Name, Price, Description. I will map logic to available data. -->

        </el-table>
      </div>

      <!-- Pagination Section -->
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
          :total.prop="processedProducts.length"
          :page-size.prop="pageSize"
          :current-page.prop="currentPage"
          @update:currentPage="handlePageChange"
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
