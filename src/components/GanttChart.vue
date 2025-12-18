<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

const { t } = useI18n()

// 任務定義
const tasks = [
  { key: 'taskA', start: '2024-01-01', end: '2024-01-03', color: '#5470c6' },
  { key: 'taskB', start: '2024-01-02', end: '2024-01-05', color: '#91cc75' },
  { key: 'taskC', start: '2024-01-06', end: '2024-01-10', color: '#fac858' }
]

const option = computed(() => {
  // 準備 Y 軸類別名稱 (反轉順序讓 Task A 在最上方，因為 Y 軸 0 通常在底部，但我們要看怎麼設置)
  // ECharts 預設 category 軸是 0 在底部。如果我們希望 A 在上，C 在下：
  // Y Axis: [C, B, A] -> index 0=C, 1=B, 2=A.
  const categories = tasks.map(task => t(`stats.tasks.${task.key}`)).reverse()
  
  // 準備資料
  const data = tasks.map((task, originalIndex) => {
    const name = t(`stats.tasks.${task.key}`)
    const startTime = new Date(task.start).getTime()
    // 結束日期需要包含當天，所以通常會視為當天 23:59:59 或者隔天 00:00:00
    // 這裡設為當天結束 (加一天的毫秒數減一，或者直接視覺上顯示到當天)
    // 為了甘特圖顯示整數天，通常寬度是 (end - start + 1 day)
    const endTime = new Date(task.end).getTime() + 24 * 3600 * 1000
    
    // 計算 Y 軸對應的 index
    // categories 是 reversed，所以 originalIndex 0 (Task A) 應該對應 index 2
    // originalIndex 1 (Task B) -> index 1
    // originalIndex 2 (Task C) -> index 0
    // Formula: categories.length - 1 - originalIndex
    const categoryIndex = tasks.length - 1 - originalIndex
    
    const durationDays = (endTime - startTime) / (24 * 3600 * 1000)

    return {
      name: name,
      value: [
        categoryIndex, 
        startTime, 
        endTime,
        durationDays
      ],
      itemStyle: {
        color: task.color
      }
    }
  })

  return {
    tooltip: {
      formatter: function (params) {
        // params.value: [index, startTime, endTime, duration]
        const taskName = params.name
        const start = echarts.format.formatTime('yyyy-MM-dd', params.value[1])
        // 顯示結束日期時，因為我們加了一天做為視覺結束點，顯示給使用者看時要減回來，或者是原始定義的日期
        const displayEndDate = new Date(params.value[2] - 24 * 3600 * 1000)
        const end = echarts.format.formatTime('yyyy-MM-dd', displayEndDate)
        const duration = params.value[3]
        
        return `
          <div style="font-weight:bold">${taskName}</div>
          <div>${start} ~ ${end}</div>
          <div>持續時間: ${Math.round(duration)} 天</div>
        `
      }
    },
    grid: {
      containLabel: true,
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      height: '80%'
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (val) => echarts.format.formatTime('MM-dd', val),
        color: '#666'
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#eee', type: 'dashed' }
      }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#666', fontWeight: 'bold' },
      splitLine: { show: true, lineStyle: { color: '#eee' } }
    },
    series: [
      {
        type: 'custom',
        renderItem: function (params, api) {
          const categoryIndex = api.value(0)
          const start = api.coord([api.value(1), categoryIndex])
          const end = api.coord([api.value(2), categoryIndex])
          // category 軸的一個頻帶高度
          const height = api.size([0, 1])[1] * 0.5
          
          const rectShape = echarts.graphic.clipRectByRect(
            {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height
            },
            {
              x: params.coordSys.x,
              y: params.coordSys.y,
              width: params.coordSys.width,
              height: params.coordSys.height
            }
          )
          
          return (
            rectShape && {
              type: 'rect',
              transition: ['shape'],
              shape: {
                ...rectShape,
                r: 5 // 圓角
              },
              style: api.style()
            }
          )
        },
        itemStyle: {
          opacity: 0.9
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: data
      }
    ]
  }
})
</script>

<template>
  <div class="h-[400px] w-full">
    <BaseChart :option="option" />
  </div>
</template>
