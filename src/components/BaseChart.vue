<script setup>
import { ref, onMounted, onBeforeUnmount, watch, markRaw } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: {
    type: Object,
    required: true
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (chartRef.value) {
    // 使用 markRaw 避免 Vue 對實例進行響應式代理，提高效能
    chartInstance = markRaw(echarts.init(chartRef.value))
    chartInstance.setOption(props.option)
  }
}

const resizeHandler = () => {
  chartInstance?.resize()
}

watch(() => props.option, (newOption) => {
  chartInstance?.setOption(newOption, true) // true表示不合併，而是重置合併，避免舊數據殘留
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  chartInstance?.dispose()
})
</script>

<template>
  <div ref="chartRef" class="w-full h-full min-h-[300px]"></div>
</template>
