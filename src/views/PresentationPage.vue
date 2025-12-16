<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Close } from '@element-plus/icons-vue' // Optional: use SVG or Element icon

const router = useRouter()

const closePresentation = () => {
  router.push('/')
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    closePresentation()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

const slides = [
  {
    type: 'cover',
    title: '前端面試簡報',
    subtitle: '講者: 梁藝礬 (Chris)',
    content: [
      '6-7 年前端開發經驗 | 擅長 Vue.js | 架構設計與效能優化',
      '結合邏輯思維與新技術熱情，致力於打造高效能的使用者體驗'
    ]
  },
  {
    type: 'content',
    title: '關於我 (About Me)',
    subtitle: '背景與特質',
    list: [
      { label: '學歷背景', text: '2010/7 - 2012/6 國立清華大學 材料系碩士', text2: '2006/9 - 2010/7 國立交通大學 材料所學士' },
      { label: '核心技能', text: 'HTML, JavaScript,CSS, Vue' },
      { label: '軟實力', text: '有效溝通協作 (PM/後端/美術)、任務兼顧 (時程/品質)、持續學習 (AI/Web Components/Unit test)' }
    ]
  },
  {
    type: 'timeline',
    title: '職涯歷程 (Career Timeline)',
    subtitle: '從基礎到資深的成長之路',
    events: [
      {
        year: '2025/06 - 2025/10',
        company: '艾克森科技有限公司',
        role: '資深前端工程師',
        desc: '獨立打造小型後台管理系統，專注架構設計、流程優化與數據視覺化。'
      },
      {
        year: '2020/09 - 2025/04',
        company: '富揚創新科技有限公司',
        role: '前端工程師',
        desc: '4年8個月深耕。維護多系統並接觸 Vue3、Astro 新技術，實作前端效能優化。'
      },
      {
        year: '2018/03 - 2020/06',
        company: '辰城科技',
        role: '前端工程師',
        desc: '前端基礎奠定：Vue2、Webpack、跨瀏覽器相容性處理。'
      }
    ]
  },
  {
    type: 'work-exp',
    title: '職涯起步 - 辰城科技',
    role: 'Junior 前端工程師',
    period: '2018/03 - 2020/06',
    techStack: ['Vue.js 2 (Vuex, Webpack)', 'Element UI', 'HTML / SCSS / JS (ES6)', 'WebSocket', 'RESTful API'],
    description: '在資深同仁指導下，從基礎開始快速累積實戰經驗，建立堅實的前端開發觀念。',
    achievements: [
      { title: '奠定基礎', desc: '新手 => 資深同仁帶領熟悉 Vue2,Element UI 語法, RESTful API 串接,Webpack 打包。後期: ES6' },
      { title: '實務經驗', desc: '處理跨瀏覽器相容性問題 與 RWD 響應式網頁切版。' },
      { title: '進階功能', desc: '主管指導下 => 實作 WebSocket 小型聊天室功能。' }
    ]
  },
  {
    type: 'work-exp',
    title: '團隊協作與技術深耕 - 富揚創新',
    role: '前端工程師',
    period: '2020/09 - 2025/04',
    techStack: ['Vue 3', 'Pinia / Vite', 'Element Plus / Tailwind', 'Astro', 'Performance Tuning'],
    description: '跨團隊協作 (PM/美術/後端)，負責大型舊系統維護與新專案架構導入，專注於效能與 SEO 優化。',
    achievements: [
      { title: '專案概述', desc: '維護 => 三後台(HTML、JS、CSS vue2), 開發 => 一個新後台及一個新前台' },
      { title: '技術過渡', desc: '後期專案新技術 => Vue3 + El Plus生態系，導入 Pinia 狀態管理與 Vite 打包, Astro框架。' },
      { title: '架構規劃認知', desc: '實作 Router 權限控制、元件做封裝與複用。' },
      { title: '底層原理研究', desc: '進一步了解 Virtual DOM 更新機制、 v-model 雙向綁定原理。' },
      { title: 'SSR + CSR', desc: '使用 Astro 框架，結合 SSR (靜態渲染) 與 CSR (局部互動)，提升載入速度與 SEO 。' },
    ]
  },
  {
    type: 'work-exp',
    title: '架構設計與獨立實戰 - 艾克森科技',
    role: 'Senior 前端工程師',
    period: '2025/06 - 2025/10',
    techStack: ['System Architecture', 'Vue 2 / 3', 'Chart.js', 'Axios Interceptors', 'Route/State Management'],
    description: '獨立負責小型團隊的後台系統建置，從無到有設計架構，並不僅限於 UI 實作。',
    achievements: [
      { title: '獨立架構設計', desc: '從零打造後台管理系統，親自設計元件封裝、路由規劃與全域狀態管理策略。' },
      { title: '穩定性優化', desc: '設計多 API Domain 線路測試機制，自動切換最佳連線，確保跨區域使用者體驗。' },
      { title: '數據視覺化', desc: '整合 Chart.js，將後端 API 數據轉化為即時動態圖表。' },
      { title: '流程優化', desc: '封裝 Axios 攔截器統一處理 API 請求與錯誤，優化開發流程與代碼品質。' }
    ]
  },
  {
    type: 'tech',
    title: '近期技術亮點 - Side Project',
    subtitle: 'AI 驅動的現代化 RWD 網頁 (Antigravity - Gemini3)',
    overview: '整合 Google Gemini API 的 RWD 智能對話網站',
    stack: 'Vue 3 + Vite + Pinia + UnoCSS + Firebase + Vitest',
    highlights: [
      'AI 整合：串接 Google Gemini API，實作 Streaming 打字機效果',
      '雲端整合：整合 Firebase Database，實現聊天記錄即時同步',
      'API 模擬：使用 Mocki.io 建立 Fake API，模擬真實後端資料交互',
      '單元測試：導入 Vitest 及 vue/test-utils，為核心元件建立基本測試',
      'UI/UX：使用 UnoCSS 實作 Dark/Light Mode 主題切換與 RWD',
      '自動化：撰寫 Node.js 腳本自動同步 i18n 翻譯檔'
    ]
  },
  {
    type: 'list',
    title: '為什麼選擇我 (Why Me?)',
    subtitle: '即戰力與團隊契合度',
    items: [
      '1. 深厚的 Vue 生態系經驗：6+ 年實戰經驗，能快速上手並解決複雜問題',
      '2. 高效率開發：不只寫 Code，更懂得靈活運用 AI 快速開發及解決問題',
      '3. 優秀的團隊合作者：個性隨和且善於溝通，能成為技術與產品間的橋樑',
      '4. 擁抱新技術：持續學習 AI、新框架 (UnoCSS)、unit test 並應用於實務，保持競爭力'
    ]
  },
  {
    type: 'end',
    title: 'Thank You',
    subtitle: '感謝您的時間，期待有機會與團隊合作！',
    contact: [
      'Email: evilkillerice@gmail.com',
      'Portfolio: github.com/ddchris'
    ]
  }
]
</script>

<template>
  <div class="presentation-container fixed inset-0 z-[9999] w-screen h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
    
    <!-- Close Button -->
    <button 
      @click="closePresentation"
      class="absolute top-6 right-6 z-50 p-3 bg-slate-800/50 hover:bg-red-500 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-sm group shadow-lg border border-white/10"
      title="Close (ESC)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Main Carousel -->
    <el-carousel 
      indicator-position="outside" 
      trigger="click" 
      arrow="always" 
      :autoplay="false"
      class="flex-1 h-full presentation-carousel"
    >
      <el-carousel-item v-for="(slide, index) in slides" :key="index" class="h-full">
        <!-- Slide Content Wrapper -->
        <div class="h-full w-full flex flex-col items-center justify-center p-4 md:px-8 pb-14 relative overflow-y-auto custom-scrollbar">
          
          <!-- Background Decor -->
          <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div class="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div class="absolute top-1/2 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>

          <!-- Slide Content -->
          <div class="relative z-10 max-w-6xl w-full text-center slide-content h-full flex flex-col justify-center">
            
            <!-- Type: Cover -->
            <div v-if="slide.type === 'cover'" class="space-y-8 animate-fade-in-up">
              <div class="inline-block px-4 py-1 border border-blue-400 rounded-full text-blue-300 text-sm tracking-widest mb-4">PRESENTATION</div>
              <h1 class="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300 leading-tight">
                {{ slide.title }}
              </h1>
              <h2 class="text-3xl text-gray-300 font-light">{{ slide.subtitle }}</h2>
              <div class="w-24 h-1 bg-blue-500 mx-auto my-8 rounded-full"></div>
              <div class="space-y-2 text-lg text-gray-400">
                <p v-for="(line, i) in slide.content" :key="i">{{ line }}</p>
              </div>
            </div>

            <!-- Type: Normal Content / List -->
            <div v-else-if="slide.type === 'content'" class="text-left space-y-4 animate-fade-in-up w-full">
              <h2 class="text-4xl font-bold text-blue-400 border-b border-blue-500/30 pb-4 mb-4">{{ slide.title }}</h2>
              <h3 class="text-2xl text-gray-300 mb-6">{{ slide.subtitle }}</h3>
              <div class="grid gap-4">
                <div v-for="(item, i) in slide.list" :key="i" class="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <span class="block text-xl font-bold text-indigo-300 mb-2">{{ item.label }}</span>
                  <p class="text-gray-300 text-lg">{{ item.text }}</p>
                  <p class="text-gray-300 text-lg">{{ item.text2 }}</p>
                </div>
              </div>
            </div>

            <!-- Type: Timeline -->
            <div v-else-if="slide.type === 'timeline'" class="text-left animate-fade-in-up w-full">
              <h2 class="text-4xl font-bold text-blue-400 border-b border-blue-500/30 pb-4 mb-8">{{ slide.title }}</h2>
              <div class="relative border-l-4 border-blue-900/50 ml-4 md:ml-8 space-y-12 py-4">
                <div v-for="(event, i) in slide.events" :key="i" class="relative pl-8 md:pl-12 group">
                  <div class="absolute -left-[14px] top-1 w-6 h-6 bg-slate-900 border-4 border-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                  <span class="text-sm font-mono text-blue-300 mb-1 block">{{ event.year }}</span>
                  <h3 class="text-2xl font-bold text-white mb-2">{{ event.role }} <span class="text-gray-400 text-base font-normal">@ {{ event.company }}</span></h3>
                  <p class="text-gray-400 text-lg">{{ event.desc }}</p>
                </div>
              </div>
            </div>

            <!-- Type: Work Experience (New) -->
            <div v-else-if="slide.type === 'work-exp'" class="text-left animate-fade-in-up w-full h-full flex flex-col overflow-hidden">
              <!-- Header Section -->
              <div class="flex-shrink-0 mb-4 border-b border-blue-500/30 pb-2 flex justify-between items-end">
                <h2 class="text-2xl md:text-3xl font-bold text-blue-400">
                  {{ slide.title }}
                </h2>
                <div class="hidden md:block text-right">
                  <span class="text-lg text-white font-bold block">{{ slide.role }}</span>
                  <span class="text-sm text-gray-400">{{ slide.period }}</span>
                </div>
              </div>
              
              <!-- Mobile only sub-header -->
              <div class="md:hidden mb-2 text-gray-400 text-sm flex justify-between items-center">
                <span class="font-bold text-white">{{ slide.role }}</span>
                <span>{{ slide.period }}</span>
              </div>

              <!-- Content Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                <!-- Left Column: Tech Stack & Overview -->
                <div class="lg:col-span-4 bg-slate-800/40 p-5 rounded-xl border border-blue-500/20 flex flex-col overflow-y-auto custom-scrollbar">
                   <div class="mb-4 flex-shrink-0">
                     <h3 class="text-lg font-bold text-white mb-2">階段概述</h3>
                     <p class="text-gray-300 text-sm leading-relaxed">{{ slide.description }}</p>
                   </div>
                   
                   <div>
                     <h3 class="text-lg font-bold text-green-400 mb-2">使用技術 (Tech Stack)</h3>
                     <div class="flex flex-wrap gap-2">
                       <span v-for="tech in slide.techStack" :key="tech" class="px-2 py-0.5 bg-slate-700/80 rounded text-xs text-blue-200 border border-slate-600">
                         {{ tech }}
                       </span>
                     </div>
                   </div>
                </div>

                <!-- Right Column: Key Achievements -->
                <div class="lg:col-span-8 flex flex-col min-h-0 bg-slate-900/30 rounded-xl border border-slate-700/30 p-1">
                  <h3 class="flex-shrink-0 text-xl font-bold text-white mb-2 px-3 pt-2">關鍵成就與職責</h3>
                  <div class="flex-1 overflow-y-auto px-3 pb-2 custom-scrollbar space-y-2">
                    <div v-for="(item, i) in slide.achievements" :key="i" class="group p-3 bg-slate-800 rounded hover:bg-slate-750 border-l-4 border-indigo-500 hover:border-indigo-400 transition-all">
                      <h4 class="text-base font-bold text-indigo-300 mb-0.5 group-hover:text-indigo-200">{{ item.title }}</h4>
                      <p class="text-gray-400 text-sm leading-relaxed">{{ item.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Type: Tech -->
            <div v-else-if="slide.type === 'tech'" class="text-left animate-fade-in-up w-full">
              <h2 class="text-4xl font-bold text-blue-400 border-b border-blue-500/30 pb-4 mb-6">{{ slide.title }}</h2>
               <div class="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                  <div class="mb-6">
                    <h3 class="text-2xl font-bold text-white mb-2">{{ slide.subtitle }}</h3>
                    <p class="text-gray-400">{{ slide.overview }}</p>
                  </div>
                  <div class="mb-8 p-4 bg-black/30 rounded-lg font-mono text-green-400 text-sm md:text-base border border-gray-700">
                    > Stack: {{ slide.stack }}
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(high, i) in slide.highlights" :key="i" class="flex items-center p-3 bg-slate-700/50 rounded-lg">
                      <span class="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      <span class="text-gray-200">{{ high }}</span>
                    </div>
                  </div>
               </div>
            </div>

            <!-- Type: Simple List -->
            <div v-else-if="slide.type === 'list'" class="text-left animate-fade-in-up w-full">
              <h2 class="text-4xl font-bold text-blue-400 border-b border-blue-500/30 pb-4 mb-8">{{ slide.title }}</h2>
              <div class="space-y-6">
                <div v-for="(item, i) in slide.items" :key="i" class="text-xl md:text-2xl text-gray-300 p-4 border-l-4 border-indigo-500 bg-gradient-to-r from-slate-800 to-transparent">
                  {{ item }}
                </div>
              </div>
            </div>

            <!-- Type: End -->
            <div v-else-if="slide.type === 'end'" class="animate-fade-in-up space-y-8">
              <h1 class="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">{{ slide.title }}</h1>
               <p class="text-2xl text-gray-300">{{ slide.subtitle }}</p>
               <div class="flex flex-col md:flex-row justify-center items-center gap-6 mt-12">
                 <a href="mailto:evilkillerice@gmail.com" class="px-8 py-3 bg-slate-800 rounded-full hover:bg-slate-700 transition border border-gray-600 flex items-center gap-2">
                   <span>✉️</span> evilkillerice@gmail.com
                 </a>
                 <a href="https://github.com/ddchris" target="_blank" class="px-8 py-3 bg-slate-800 rounded-full hover:bg-slate-700 transition border border-gray-600 flex items-center gap-2">
                   <span>🐱</span> github.com/ddchris
                 </a>
               </div>
            </div>

          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

/* Customize Element Plus Carousel */

:deep(.el-carousel__indicators--outside) {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
}

:deep(.el-carousel__button) {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 0.5;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background-color: #60a5fa; /* blue-400 */
  opacity: 1;
  width: 24px;
  border-radius: 4px;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
}
:deep(.el-carousel__arrow:hover) {
  background-color: rgba(255,255,255,0.3);
}


/* Ensure carousel container takes full height */
:deep(.el-carousel__container) {
  height: 100% !important;
}

.presentation-container {
   /* Ensure it takes full available height minus header */
}
</style>
