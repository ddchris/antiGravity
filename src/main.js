import { createApp } from 'vue'
import * as Vue from 'vue' // Expose Vue for remote components
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusNamespace from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './style.css'
import { setupCartPersistence } from './stores/cartStore'
import i18n from './i18n'
import { initWebComponent } from '@/utils/web-component-proxy'

// Expose globals for Remote Web Components (IIFE build expects these)
window.Vue = Vue
window.ElementPlus = ElementPlusNamespace // MUST be the namespace object containing named exports like ElButton
window.ElementPlusIconsVue = ElementPlusIconsVue

// Initialize Remote Components


initWebComponent()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus) // Optional: Use locally if needed, but critical to include code in bundle if not tree-shaken out (though we exposed the whole lib object above)

// 設置購物車持久化 - 啟用 localStorage 自動儲存
setupCartPersistence()

app.mount('#app')
