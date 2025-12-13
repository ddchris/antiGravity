<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseChart from '../components/BaseChart.vue'
import { salesMockData } from '../mock/salesData'

const { t, locale } = useI18n()
const selectedMonth = ref(salesMockData.months[salesMockData.months.length - 1])

const monthOptions = salesMockData.months

// 共用設定
const textStyle = {
  fontFamily: 'Inter, system-ui, sans-serif'
}

// 1. 折線圖配置 (每日銷售趨勢)
const lineChartOption = computed(() => {
  // 依賴 locale 確保更新
  const _ = locale.value
  const { days, categoryData } = salesMockData.getDataByMonth(selectedMonth.value)
  
  const series = salesMockData.categories.map(cat => ({
    name: t(`stats.categories.${cat}`), // 翻譯系列名稱
    type: 'line',
    data: categoryData[cat],
    smooth: true,
    showSymbol: false,
    areaStyle: { opacity: 0.1 },
    emphasis: { focus: 'series' }
  }))

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#eee',
      textStyle: { color: '#333' }
    },
    legend: {
      data: salesMockData.categories.map(cat => t(`stats.categories.${cat}`)), // 翻譯圖例
      bottom: 0,
      textStyle: { color: '#666' } 
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      axisLabel: { color: '#666' }
    },
    series
  }
})

// 2. 圓餅圖配置 (各類別佔比)
const pieChartOption = computed(() => {
  const _ = locale.value
  // 取得資料並同時翻譯 name
  const rawData = salesMockData.getMonthTotals(selectedMonth.value)
  const data = rawData.map(item => ({
    ...item,
    name: t(`stats.categories.${item.name}`)
  }))
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: '#666' }
    },
    series: [
      {
        name: 'Sales',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data
      }
    ]
  }
})

// 3. 長條圖配置 (各類別總額)
const barChartOption = computed(() => {
  const _ = locale.value
  const totals = salesMockData.getMonthCategoryTotals(selectedMonth.value)
  // 翻譯 X 軸類別
  const translatedCategories = salesMockData.categories.map(cat => t(`stats.categories.${cat}`))
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: translatedCategories,
      axisLine: { lineStyle: { color: '#ccc' } },
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [
      {
        data: totals,
        type: 'bar',
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(180, 180, 180, 0.1)'
        },
        itemStyle: {
          borderRadius: [5, 5, 0, 0]
        },
        barWidth: '50%'   
      }
    ]
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
    <!-- Header Area -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{{ $t('stats.title') }}</h1>
      <p class="text-gray-500 dark:text-gray-400">{{ $t('stats.subTitle') }}</p>
    </div>

    <!-- Month Selector -->
    <div class="flex flex-wrap gap-2 mb-8 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
      <button
        v-for="month in monthOptions"
        :key="month"
        @click="selectedMonth = month"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        :class="selectedMonth === month 
          ? 'bg-indigo-600 text-white shadow-md transform scale-105' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
      >
        {{ month }}
      </button>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Line Chart (Wide) -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{{ $t('stats.lineChartTitle') }} - {{ selectedMonth }}</h3>
        <div class="h-[400px]">
          <BaseChart :option="lineChartOption" :key="locale" />
        </div>
      </div>

      <!-- Pie Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{{ $t('stats.pieChartTitle') }}</h3>
        <div class="h-[350px]">
          <BaseChart :option="pieChartOption" :key="locale" />
        </div>
      </div>

      <!-- Bar Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h3 class="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{{ $t('stats.barChartTitle') }}</h3>
        <div class="h-[350px]">
          <BaseChart :option="barChartOption" :key="locale" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
