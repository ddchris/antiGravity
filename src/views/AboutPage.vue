<script setup>
import { onMounted, ref } from 'vue'

const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})

const skills = {
  '前端': [
    'JavaScript (ES6~ES14)', 'TypeScript', 'HTML', 'CSS', 'Sass', 'TailwindCSS',
    'Vue.js 2 & 3 (Vuex / Pinia)', 'Astro 框架'
  ],
  'UI 元件與前端開發': [
    'Element UI / Element Plus / Vant', 'Chart.js', 'RWD 響應式網頁設計',
    '元件設計', '路由設計與權限控制'
  ],
  '前端效能與相容性': [
    'CSR/SSR 性能優化', 'Hydration 控制', '跨瀏覽器相容性處理', 'DevTools / Postman'
  ],
  '開發工具與流程': [
    'Git / GitHub / GitLab / SourceTree', 'npm / pnpm', 'Webpack / Jenkins',
    'WebSocket', '多 API domain 連線測試'
  ]
}

const experiences = [
  {
    title: '資深前端工程師',
    company: '艾克森科技有限公司',
    period: '2025/6~2025/10 (5個月)',
    location: '台北市信義區',
    description: '在艾克森的期間，除了維護既有的 Vue2 / Vue3 專案外，剛好有個新的小專案，我便試著從零開始用 Vue2 打造整個後台管理系統，自己設計元件封裝、路由和狀態管理，其中專案中也使用了 Chart.js 做即時統計數據展示。此外專案還做了不同API domain 的線路測試，確保在不同區域的使用者都能獲得最佳的連線。這個階段不只做技術實作，也由於是小規模團隊，比較有碰觸到專案架構設計和流程優化的部分。'
  },
  {
    title: '前端工程師',
    company: '富揚創新科技有限公司',
    period: '2020/9~2025/4 (4年8個月)',
    location: '台北市南港區',
    description: '到富揚科技後，我們前端團隊跟 PM、美術、後端、運維等其他團隊合作開發，主要項目包含維護既有的三個後台系統及後期團隊共同開發一個新後台及一個新前台。除了先前使用的 HTML、JS、CSS vue2 等技術外，新專案也接觸到一些新技術如 Vue3，Element Plus、Tailwind 以及 Astro 框架。這段期間在資深同仁指導下，進一步了解到如何設計實用的元件封裝與複用、router的設計與權限控制、如何利用 Pinia 拆分模組做全局狀態管理外，對於 Vue 的 Virtual DOM 更新機制、雙向綁定原理及如何進一步優化前端效能這些方面也有了更深的理解。另外在新專案 Astro 框架的使用上我們利用 Astro island 的概念，在靜態頁面中嵌入 Vue 元件，透過元件設定控制 Hydration 時機，達到首次載入頁面(SSR)加局部互動(CSR)的效果，讓網站載入更快、SEO更友善並兼顧使用者體驗與網頁互動性。'
  },
  {
    title: '前端工程師',
    company: '辰城科技',
    period: '2018/3~2020/6 (2年4個月)',
    location: '台北市內湖區',
    description: '在辰城的時候，主要接觸到的技術包含 HTML、JS、CSS(scss)，Vue2(含 Vuex 狀態管理、npm、pnpm 做套件管理、Webpack打包、Jenkins部屬)、git版控、element UI。這段期間在資深同仁指導下，除了穩定地提升Vue2框架、JS ES6 新語法跟 RESRful API 串接熟練度之外，實務上的經驗還包含了如何處理跨瀏覽器相容性問題及 RWD 網頁的製作。整體而言這個時段是我前端基礎能力快速累積的階段。'
  }
]
</script>

<template>
  <div class="about-page relative overflow-x-hidden text-sm md:text-base mt-12">
    
    <!-- Background Image (Watermark Style with Parallax) -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div class="fixed inset-0 bg-cover bg-center opacity-70 pointer-events-none"
          style="background-image: url('https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop&q=50&w=1200'); z-index: 0; ; background-attachment: scroll;">
      </div>
    </div>
    <!-- Content Wrapper with Animation -->
    <div class="max-w-4xl mx-auto relative z-10 transition-opacity duration-700 ease-out"
         :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">
      
      <div class="space-y-8" style="transform: scale(0.9); transform-origin: top center; width: 111.11%; margin-left: -5.555%;">
      
      <!-- Hero Section -->
      <div class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
        <div class="md:flex">
          <div class="md:flex-shrink-0 bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center p-8 md:w-1/3">
            <div class="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
              <img class="absolute inset-0 w-full h-full object-cover" src="/me.png" alt="Profile Photo">
            </div>
          </div>
          <div class="p-8 md:w-2/3 flex flex-col justify-center">
            <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-1">{{ $t('about.title') }}</div>
            <h1 class="block mt-1 text-3xl leading-tight font-bold text-gray-900 dark:text-white">Yi Fan Liang</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-300">國立清華大學材料系 碩士畢業</p>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">台北市松山區 | 6~7年工作經驗</p>
            
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-start">
                <span class="text-indigo-500 mr-2">🤝</span>
                <span class="text-gray-600 dark:text-gray-300 text-sm">親切隨和 - 樂於團隊合作</span>
              </div>
              <div class="flex items-start">
                <span class="text-indigo-500 mr-2">🗣️</span>
                <span class="text-gray-600 dark:text-gray-300 text-sm">善於溝通 - 與 PM/RD 密切協作</span>
              </div>
              <div class="flex items-start">
                <span class="text-indigo-500 mr-2">📚</span>
                <span class="text-gray-600 dark:text-gray-300 text-sm">樂於學習 - 關注新技術</span>
              </div>
              <div class="flex items-start">
                <span class="text-indigo-500 mr-2">🎯</span>
                <span class="text-gray-600 dark:text-gray-300 text-sm">具責任感 - 重視品質與時程</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Experience Section -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {{ $t('about.experience') }}
        </h2>
        <div class="space-y-4">
          <div v-for="(exp, index) in experiences" :key="index" 
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-300">
            <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ exp.title }}</h3>
                <p class="text-indigo-600 dark:text-indigo-400 font-medium">{{ exp.company }}</p>
              </div>
              <div class="md:mt-0 text-right">
                <span class="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {{ exp.period }}
                </span>
                <p class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ exp.location }}</p>
              </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
              {{ exp.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Skills Section -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {{ $t('about.skills') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(items, category) in skills" :key="category" 
               class="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-md p-6 hover:translate-y-[-2px] transition-transform duration-300">
            <h3 class="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
              {{ category }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="skill in items" :key="skill" 
                    class="px-3 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm border border-gray-200 dark:border-gray-600">
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>

    </div>
  </div>
</template>
