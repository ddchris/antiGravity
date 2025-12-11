/**
 * Axios 請求封裝 (Axios Request Wrapper)
 * 
 * 功能 (Features):
 * - 請求攔截器 (Request interceptor): 自動夾帶 Token 與通用 Header
 * - 回應攔截器 (Response interceptor): 整合 Element Plus MessageBox 進行錯誤處理
 * - `quiet` 選項: 支援靜默模式 (Skip auto-error dialog)，適合自定義錯誤處理
 * - 完整的 i18n 錯誤訊息支援
 * 
 * 使用方式 (Usage):
 *   import request from '@/utils/request'
 *   
 *   // 一般呼叫 (失敗時顯示錯誤對話框)
 *   const data = await request.get('/api/users')
 *   
 *   // 靜默模式 (由元件自行處理錯誤)
 *   const data = await request.get('/api/users', { quiet: true })
 */

import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import i18n from '../i18n'

// Helper to get translated text
// 取得翻譯文字的輔助函式
const t = (key) => i18n.global.t(key)

// Create axios instance
// 建立 Axios 實例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000, // 30 seconds (30 秒超時)
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
// 請求攔截器
service.interceptors.request.use(
  (config) => {
    // Add token from localStorage if available
    // 如果 localStorage 中有 token，則將其加入 Header
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // Add timestamp to prevent caching (optional)
    // 加入時間戳記以防止快取 (可選)
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response Interceptor
// 回應攔截器
service.interceptors.response.use(
  (response) => {
    // Return data directly for convenience
    // 為了方便，直接回傳 data
    return response.data
  },
  async (error) => {
    const config = error.config || {}
    
    // --- Auto-retry Logic ---
    // --- 自動重試邏輯 ---
    // Default: 3 retries, 1000ms delay
    // 預設：重試 3 次，延遲 1000ms
    const retryTotal = config.retry ?? 3
    const retryDelay = config.retryDelay ?? 1000
    
    config.__retryCount = config.__retryCount || 0
    
    const isNetworkError = !error.response
    const isServerError = error.response && error.response.status >= 500
    
    if ((isNetworkError || isServerError) && config.__retryCount < retryTotal) {
      config.__retryCount += 1
      console.log(`[Axios Retry] Attempt ${config.__retryCount}/${retryTotal} for ${config.url}...`)
      
      // Wait for delay
      // 等待延遲
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      
      // Retry request
      // 重試請求
      return service(config)
    }
    // ------------------------

    const quiet = config.quiet || false
    
    // Extract error message using i18n
    // 使用 i18n 取得錯誤訊息
    let message = t('error.unknown')
    let title = t('error.title')
    
    if (error.response) {
      // Server responded with error
      // 伺服器回傳錯誤
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          message = data?.message || t('error.badRequest')
          break
        case 401:
          message = t('error.unauthorized')
          title = t('error.authTitle')
          // Optionally redirect to login
          // 可選擇重導向至登入頁
          // window.location.href = '/login'
          break
        case 403:
          message = t('error.forbidden')
          title = t('error.forbiddenTitle')
          break
        case 404:
          message = data?.message || t('error.notFound')
          break
        case 500:
          message = t('error.serverError')
          title = t('error.serverErrorTitle')
          break
        case 503:
          message = t('error.serviceUnavailable')
          break
        default:
          message = data?.message || `${t('error.requestFailed')} (${status})`
      }
    } else if (error.request) {
      // Request made but no response
      // 請求已發出但沒有回應
      message = t('error.networkError')
      title = t('error.networkErrorTitle')
    } else {
      // Something else happened
      // 發生其他錯誤
      message = error.message || t('error.sendFailed')
    }
    
    // Show error dialog unless quiet mode is enabled
    // 除非啟用靜默模式，否則顯示錯誤對話框
    if (!quiet) {
      try {
        await ElMessageBox.alert(message, title, {
          confirmButtonText: t('error.confirm'),
          type: 'error'
        })
      } catch {
        // User closed dialog, ignore
        // 使用者關閉對話框，忽略
      }
    }
    
    // Attach parsed message to error for component use
    // 將解析後的訊息附加到錯誤物件，供元件使用
    error.displayMessage = message
    error.displayTitle = title
    
    return Promise.reject(error)
  }
)

/**
 * Request wrapper with quiet option support
 * 支援靜默選項的請求封裝
 * 
 * @param {Object} config - Axios config + { quiet: boolean }
 * @returns {Promise}
 */
export function request(config) {
  return service(config)
}

// Convenience methods
// 便捷方法
request.get = (url, config = {}) => service.get(url, config)
request.post = (url, data, config = {}) => service.post(url, data, config)
request.put = (url, data, config = {}) => service.put(url, data, config)
request.delete = (url, config = {}) => service.delete(url, config)
request.patch = (url, data, config = {}) => service.patch(url, data, config)

// Export raw axios instance for advanced use
// 匯出原始 axios 實例供進階使用
export { service as axios }

export default request
