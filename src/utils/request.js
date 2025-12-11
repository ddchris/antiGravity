/**
 * Axios Request Wrapper
 * 
 * Features:
 * - Request interceptor: Add token & common headers
 * - Response interceptor: Error handling with Element Plus MessageBox
 * - `quiet` option: Skip auto-error dialog for custom handling
 * - Full i18n support for error messages
 * 
 * Usage:
 *   import request from '@/utils/request'
 *   
 *   // Normal call (shows error dialog on failure)
 *   const data = await request.get('/api/users')
 *   
 *   // Quiet mode (component handles errors)
 *   const data = await request.get('/api/users', { quiet: true })
 */

import axios from 'axios'
import { ElMessageBox } from 'element-plus'
import i18n from '../i18n'

// Helper to get translated text
const t = (key) => i18n.global.t(key)

// Create axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
service.interceptors.request.use(
  (config) => {
    // Add token from localStorage if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // Add timestamp to prevent caching (optional)
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
service.interceptors.response.use(
  (response) => {
    // Return data directly for convenience
    return response.data
  },
  async (error) => {
    const config = error.config || {}
    
    // --- Auto-retry Logic ---
    // Default: 3 retries, 1000ms delay
    const retryTotal = config.retry ?? 3
    const retryDelay = config.retryDelay ?? 1000
    
    config.__retryCount = config.__retryCount || 0
    
    const isNetworkError = !error.response
    const isServerError = error.response && error.response.status >= 500
    
    if ((isNetworkError || isServerError) && config.__retryCount < retryTotal) {
      config.__retryCount += 1
      console.log(`[Axios Retry] Attempt ${config.__retryCount}/${retryTotal} for ${config.url}...`)
      
      // Wait for delay
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      
      // Retry request
      return service(config)
    }
    // ------------------------

    const quiet = config.quiet || false
    
    // Extract error message using i18n
    let message = t('error.unknown')
    let title = t('error.title')
    
    if (error.response) {
      // Server responded with error
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
      message = t('error.networkError')
      title = t('error.networkErrorTitle')
    } else {
      // Something else happened
      message = error.message || t('error.sendFailed')
    }
    
    // Show error dialog unless quiet mode is enabled
    if (!quiet) {
      try {
        await ElMessageBox.alert(message, title, {
          confirmButtonText: t('error.confirm'),
          type: 'error'
        })
      } catch {
        // User closed dialog, ignore
      }
    }
    
    // Attach parsed message to error for component use
    error.displayMessage = message
    error.displayTitle = title
    
    return Promise.reject(error)
  }
)

/**
 * Request wrapper with quiet option support
 * 
 * @param {Object} config - Axios config + { quiet: boolean }
 * @returns {Promise}
 */
export function request(config) {
  return service(config)
}

// Convenience methods
request.get = (url, config = {}) => service.get(url, config)
request.post = (url, data, config = {}) => service.post(url, data, config)
request.put = (url, data, config = {}) => service.put(url, data, config)
request.delete = (url, config = {}) => service.delete(url, config)
request.patch = (url, data, config = {}) => service.patch(url, data, config)

// Export raw axios instance for advanced use
export { service as axios }

export default request
