
import { onMounted, onUnmounted } from 'vue'
import { useThrottleFn } from '@vueuse/core'

/**
 * useViewport Composable
 * 
 * 解決 Mobile Web 瀏覽器 (特別是 iOS Safari) 100vh 包含網址列導致內容被遮擋的問題。
 * 計算實際視窗高度並存入 CSS 變數 --vh。
 * 
 * 使用方式:
 * 1. 在 setup() 中呼叫 useViewport()
 * 2. 在 CSS 中使用 height: calc(var(--vh, 1vh) * 100);
 */
export function useViewport() {
  const updateVh = () => {
    // 取得視窗內部高度的 1%
    const vh = window.innerHeight * 0.01
    // 設定 CSS 變數 --vh
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }

  // 1. 建立節流版本的 resize 處理器 (200ms)
  const throttledUpdateVh = useThrottleFn(updateVh, 200)

  // 額外的旋轉處理：確保在旋轉完成後再次校正
  const handleOrientationChange = () => {
    // 立即更新一次
    updateVh()
    // 延遲更新以等待瀏覽器 UI 動畫完成 (例如 iOS Safari 網址列縮放)
    setTimeout(updateVh, 100)
    setTimeout(updateVh, 300)
    
    // 保持原有的滾動到頂部邏輯，優化體驗
    window.scrollTo(0, 0)
  }

  onMounted(() => {
    updateVh()
    // 2. Resize 事件使用節流版本
    window.addEventListener('resize', throttledUpdateVh)
    window.addEventListener('orientationchange', handleOrientationChange)
  })

  onUnmounted(() => {
    // 3. 移除監聽器時必須與添加時的函數引用一致
    window.removeEventListener('resize', throttledUpdateVh)
    window.removeEventListener('orientationchange', handleOrientationChange)
  })
}
