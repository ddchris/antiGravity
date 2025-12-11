import '@unocss/reset/tailwind.css'
import { createApp } from 'vue'
import * as Vue from 'vue' // 暴露 Vue 供遠端組件使用
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusNamespace from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
// UnoCSS
import 'virtual:uno.css'
import './style.css'
import { setupCartPersistence } from './stores/cartStore'
import i18n from './i18n'
import { initWebComponent } from '@/utils/web-component-proxy'

// 暴露全域變數供遠端 Web Components 使用 (IIFE 建置預期有這些)
window.Vue = Vue
window.ElementPlus = ElementPlusNamespace // 必須是包含 ElButton 等具名匯出的命名空間物件
window.ElementPlusIconsVue = ElementPlusIconsVue

// 初始化遠端組件


initWebComponent()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus) // 可選：如果需要本地使用則引入，但為了確保程式碼包含在 bundle 中 (雖然上面已暴露整個庫物件)

// 設置購物車持久化 - 啟用 localStorage 自動儲存
setupCartPersistence()

// 自定義指令
import fixCol from './directives/fixCol'
app.directive('fixCol', fixCol)

app.mount('#app')
