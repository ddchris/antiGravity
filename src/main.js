import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { setupCartPersistence } from './stores/cartStore'
import i18n from './i18n'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

// 設置購物車持久化 - 啟用 localStorage 自動儲存
setupCartPersistence()

app.mount('#app')
