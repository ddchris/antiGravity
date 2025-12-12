<script setup>
import { ref } from 'vue'

const slides = [
  {
    type: 'cover',
    title: '資深前端工程師面試簡報',
    subtitle: 'Chris',
    content: [
      '6-7 年前端開發經驗 | Vue.js 專家 | 架構設計與效能優化',
      '[副標題] 結合邏輯思維與新技術熱情，致力於打造高效能的使用者體驗'
    ]
  },
  {
    type: 'content',
    title: '關於我 (About Me)',
    subtitle: '背景與特質',
    list: [
      { label: '學歷背景', text: '國立清華大學 材料系碩士 (邏輯思維強、擅長分析問題)' },
      { label: '核心技能', text: 'Vue.js (Vue2/Vue3), Astro, TypeScript, Tailwind/UnoCSS, RWD' },
      { label: '軟實力', text: '溝通協作 (PM/Backend/Design)、責任感 (時程/品質)、持續學習 (AI/SSR/Web Components)' }
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
        desc: '獨立打造後台管理系統，專注架構設計、流程優化與數據視覺化。'
      },
      {
        year: '2020/09 - 2025/04',
        company: '富揚創新科技有限公司',
        role: '前端工程師',
        desc: '4年8個月深耕。維護多系統並導入 Vue3、Astro 新技術，大幅提升效能。'
      },
      {
        year: '2018/03 - 2020/06',
        company: '辰城科技',
        role: 'Internet 程式設計師',
        desc: '前端基礎奠定：Vue2、Webpack、跨瀏覽器相容性處理。'
      }
    ]
  },
  {
    type: 'project',
    title: '重點專案 I - 富揚創新 (技術深耕)',
    subtitle: '大型系統維護與架構升級',
    mainPoints: [
      '專案背景：同時維護 3 個後台系統，並開發全新的前/後台',
      '面臨挑戰：需兼顧 SEO 排名與使用者操作流暢度 (效能優化)'
    ],
    solutions: [
      { title: '技術升級', desc: '導入 Vue3 + Element Plus + TailwindCSS' },
      { title: '架構革新', desc: '採用 Astro Island 架構，實作 SSR + CSR' },
      { title: '狀態管理', desc: '使用 Pinia 進行模組化管理' }
    ],
    result: '網站載入速度顯著提升，SEO 更友善，並建立可複用的元件庫'
  },
  {
    type: 'project',
    title: '重點專案 II - 艾克森科技 (獨立實戰)',
    subtitle: '從零建置後台管理系統',
    mainPoints: [
      '專案背景：小型團隊，需快速構建高品質的後台系統'
    ],
    solutions: [
      { title: '獨立架構設計', desc: '實作路由權限控制 (Router Guard)、元件封裝' },
      { title: '數據視覺化', desc: '整合 Chart.js 呈現即時統計數據' },
      { title: '穩定性優化', desc: '開發多 API Domain 線路測試機制，自動切換最佳連線' }
    ],
    result: '成功交付系統，確保不同區域使用者皆能獲得最佳連線體驗'
  },
  {
    type: 'tech',
    title: '近期技術亮點 - Side Project',
    subtitle: 'AI 驅動的現代化 RWD 網頁 (Antigravity)',
    overview: '整合 Google Gemini API 的 RWD 智能對話網站',
    stack: 'Vue 3 (Composition API) + Vite + Pinia + UnoCSS',
    highlights: [
      'AI 整合：串接 Gemini API，實作 Streaming 打字機效果',
      'UI/UX：使用 UnoCSS 實作 Dark/Light Mode 主題切換',
      '自動化：撰寫 Node.js 腳本自動同步 i18n 翻譯檔',
      '進階功能：封裝 Custom Directives 處理表格凍結 (Sticky Columns)'
    ]
  },
  {
    type: 'list',
    title: '為什麼選擇我 (Why Me?)',
    subtitle: '即戰力與團隊契合度',
    items: [
      '1. 深厚的 Vue 生態系經驗：6+ 年實戰經驗，能快速上手並解決複雜問題',
      '2. 解決問題的思維：不只寫 Code，更懂得架構優化 (SSR、Hydration、效能調校)',
      '3. 優秀的團隊合作者：個性隨和且善於溝通，能成為技術與產品間的橋樑',
      '4. 擁抱新技術：持續將 AI、新框架 (Astro/UnoCSS) 應用於實務，保持競爭力'
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
  <div class="presentation-container w-full h-[calc(100vh-73px)] bg-slate-900 text-white flex flex-col overflow-hidden">
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
        <div class="h-full w-full flex flex-col items-center justify-center p-4 md:p-10 relative overflow-y-auto custom-scrollbar">
          
          <!-- Background Decor -->
          <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div class="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div class="absolute top-1/2 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>

          <!-- Slide Content -->
          <div class="relative z-10 max-w-5xl w-full text-center slide-content pb-12">
            
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
            <div v-else-if="slide.type === 'content'" class="text-left space-y-8 animate-fade-in-up w-full">
              <h2 class="text-4xl font-bold text-blue-400 border-b border-blue-500/30 pb-4 mb-8">{{ slide.title }}</h2>
              <h3 class="text-2xl text-gray-300 mb-6">{{ slide.subtitle }}</h3>
              <div class="grid gap-6">
                <div v-for="(item, i) in slide.list" :key="i" class="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <span class="block text-xl font-bold text-indigo-300 mb-2">{{ item.label }}</span>
                  <p class="text-gray-300 text-lg">{{ item.text }}</p>
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

            <!-- Type: Project -->
            <div v-else-if="slide.type === 'project'" class="text-left animate-fade-in-up w-full">
              <h2 class="text-4xl font-bold text-blue-400 border-b border-blue-500/30 pb-4 mb-6">{{ slide.title }}</h2>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Details -->
                <div class="lg:col-span-1 space-y-6">
                  <div class="bg-blue-900/20 p-6 rounded-xl border border-blue-500/20">
                    <h3 class="text-xl font-bold text-blue-300 mb-4">專案概況</h3>
                    <ul class="space-y-3 text-gray-300">
                      <li v-for="(point, i) in slide.mainPoints" :key="i" class="flex items-start">
                         <span class="mr-2 text-blue-500">•</span> {{ point }}
                      </li>
                    </ul>
                  </div>
                  <div class="bg-green-900/20 p-6 rounded-xl border border-green-500/20">
                    <h3 class="text-xl font-bold text-green-300 mb-2">成果</h3>
                    <p class="text-gray-300">{{ slide.result }}</p>
                  </div>
                </div>
                <!-- Right Solutions -->
                <div class="lg:col-span-2 space-y-4">
                  <h3 class="text-2xl font-bold text-white mb-4">解決方案</h3>
                  <div v-for="(sol, i) in slide.solutions" :key="i" class="flex items-start p-4 bg-slate-800 rounded-lg hover:translate-x-2 transition-transform">
                    <div class="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-xl font-bold mr-4">{{ i + 1 }}</div>
                    <div>
                      <h4 class="text-lg font-bold text-indigo-300">{{ sol.title }}</h4>
                      <p class="text-gray-400">{{ sol.desc }}</p>
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
  bottom: 20px;
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
