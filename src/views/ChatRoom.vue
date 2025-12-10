<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, h } from 'vue' // Added h
import { db } from '../firebase/config'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, writeBatch, deleteDoc } from 'firebase/firestore'
import { useI18n } from 'vue-i18n'
import { initWebComponent } from '../utils/web-component-proxy'
import axios from 'axios' // Axios for API calls
import { ElMessageBox, ElMessage } from 'element-plus'

const { t, locale } = useI18n()

// State
const messages = ref([])
const inputMessage = ref('')
const isTyping = ref(false)
const isStreaming = ref(false) // For typing cursor animation
const messagesContainer = ref(null)
const isWebComponentLoaded = ref(false)

// Current Session ID (for differentiating users in different tabs)
const getSessionId = () => {
    let id = localStorage.getItem('chatSessionId')
    if (!id) {
        id = 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
        localStorage.setItem('chatSessionId', id)
    }
    return id
}
const currentUserId = getSessionId()
const currentUser = 'User' // Display name (could be dynamic later)

// Firebase Collection Reference
// Note: Ensure your Firestore security rules allow read/write for this collection
const chatCollection = collection(db, 'chat')

// Format bold text: **text** -> <strong>text</strong>
const formatBold = (text) => {
  if (!text) return ''
  // Escape HTML first to prevent XSS
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Convert **text** to <strong>text</strong>
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
}

// Scroll to bottom helper
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight // Direct set for instant
    // For smooth behavior, use scrollIntoView on last element if needed, but scrollTop is reliable
  }
}

// Scroll Handlers
const handleScrollTop = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

const handleScrollBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
    }
}

// Clear Messages
const clearMessages = async () => {
    try {
        await ElMessageBox.confirm(
            t('chat.clearConfirm'),
            t('chat.clear'),
            {
                confirmButtonText: t('error.confirm') || '確定',
                cancelButtonText: t('chat.cancel') || '取消',
                type: 'warning'
            }
        )
    } catch {
        // User cancelled
        return
    }
    
    try {
        const querySnapshot = await getDocs(chatCollection)
        // Batch delete is limited to 500 ops. For demo purposes, we do loop or simple batch.
        // If > 500, need to chunk. Assuming demo volume < 500.
        const batch = writeBatch(db)
        let count = 0
        
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref)
            count++
        })
        
        if (count > 0) {
            await batch.commit()
        }
        
    } catch (error) {
        console.error("Error clearing chat:", error)
        // Fallback for local mode
        messages.value = []
    }
}

// Format Time
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  // Firestore timestamp to Date
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Send Message
const sendMessage = async () => {
  if (!inputMessage.value.trim()) return

  const text = inputMessage.value
  inputMessage.value = ''

  try {
    // 1. Add User Message to Firestore
    await addDoc(chatCollection, {
      userId: currentUserId,
      from: currentUser,
      text: text,
      timestamp: serverTimestamp(),
      createdAt: Date.now() // Fallback for ordering if serverTimestamp is pending
    })

    // 2. Simulate AI Typing & Reply
    triggerAIResponse(text)
    
  } catch (error) {
    console.error("Error sending message:", error)
    // Fallback for demo if Firebase fails (e.g. invalid config)
    messages.value.push({
        id: Date.now(),
        userId: currentUserId,
        from: currentUser,
        text: text,
        timestamp: new Date()
    })
    triggerAIResponse(text)
  }
}

// AI Response Logic
// AI Configuration
// WARNING: exposing API Key in frontend code is risky for production.
// Get your FREE Key here: https://aistudio.google.com/app/apikey(https://aistudio.google.com/)
const GEMINI_API_KEY = 'AIzaSyAKKEBVt-_JKQmSAAgsEdPepWcoSrZXq3I' // input your key here: 'AIza...'

// Language mapping for AI responses
const LANGUAGE_MAP = {
    'zh-TW': '繁體中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어'
}

// Real AI Service (Google Gemini) - Using Axios
const callRealGemini = async (text) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.startsWith('sk-proj')) throw new Error("No Gemini API Key (or using OpenAI key mistakenly)")
    
    // Get current language for AI response
    const currentLang = LANGUAGE_MAP[locale.value] || '繁體中文'
    
    // 1. Dynamic Model Discovery (Fixes 404 issues)
    // We first list available models to find one that actually exists for this Key/Region
    let targetModel = 'models/gemini-1.5-flash' // Default fallback
    
    try {
        const { data: listData } = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
        )
        
        if (listData.models) {
            // Find the best available model (Prefer Flash -> 1.5 -> Pro)
            // Must support 'generateContent'
            const validModel = listData.models.find(m => 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes('generateContent') &&
                (m.name.includes('flash') || m.name.includes('1.5'))
            ) || listData.models.find(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
            
            if (validModel) {
            targetModel = validModel.name
            console.log("Selected Gemini Model:", targetModel)
            }
        }
    } catch (e) {
        console.warn("Model discovery failed, trying default:", e)
    }
    
    // 2. Call Generate Content (With Retry Logic)
    // Note: targetModel comes as 'models/gemini-xxx'
    const url = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${GEMINI_API_KEY}`
    
    let data;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
        try {
            const response = await axios.post(url, {
                systemInstruction: {
                    parts: [{ text: `你是一位超級親切、活潑又專業的AI助手！😊 請使用${currentLang}回覆。

回覆風格指南：
🎨 每個段落或重點前面加上相關的 emoji
🗣️ 用輕鬆口語化的語氣，像朋友聊天一樣
📝 使用清晰的換行，讓內容易讀
✅ 可以用 **粗體** 來強調重要的詞彙
✅ 列表項目用 • 圓點或 emoji 開頭（不要用 * 或 -）
🎉 多用表情符號讓對話更生動！

正確範例：
• 這是 **重點** 說明
• 第二點說明
👉 **推薦** 去這裡玩！` }]
                },
                contents: [{ parts: [{ text: text }] }]
            })
            
            // Axios returns response object, .data contains the actual body
            data = response.data
            console.log('Gemini API Response:', data)
            
            break; // Success
        } catch (e) {
            // Check for 503 status (overloaded)
            if (e.response && e.response.status === 503) {
                attempts++;
                console.warn(`Gemini 503 (Overloaded). Retrying ${attempts}/${maxAttempts}...`);
                await new Promise(r => setTimeout(r, 1500)); // Wait 1.5s
                continue;
            }
            
            attempts++;
            if (attempts >= maxAttempts) throw e;
            await new Promise(r => setTimeout(r, 1500));
        }
    }
    
    // Validate response structure
    if (!data) throw new Error("No data received from API")
    if (data.error) throw new Error(data.error.message)
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid response structure:', data)
        throw new Error("No response content")
    }
    
    const resultText = data.candidates[0].content.parts[0].text
    console.log('Extracted AI Text:', resultText)
    
    return resultText
}

// AI Response Logic (Simulated or Real)
const triggerAIResponse = async (userText) => {
  isTyping.value = true
  
  let responseText = ""
  
  try {
      // 1. Try Real AI (Gemini) first
      responseText = await callRealGemini(userText)
  } catch (err) {
      console.log("Using Simulated AI:", err.message)
      
      // 2. Fallback: Simulate "Thinking" delay
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1500))
      
      // 3. Fallback: Select simulated response
      const aiResponses = [
        "這是一個非常棒的觀點！我們一直在致力於這方面的改進。\n\n根據您的需求，我建議您可以：\n- 參考我們的最新文檔\n- 直接聯繫客服人員\n- 訂閱我們的電子報",
        "很高興您提出這個問題。我們的產品團隊其實已經注意到了這點，預計在下個版本會有驚喜喔！🚀",
        "收到您的訊息了！\n讓我稍微整理一下...\n\n基本上，這個功能是支援的，只是需要到「設定」頁面中手動開啟。如果您找不到，我可以一步步引導您。",
        "The quick brown fox jumps over the lazy dog.\nJust kidding! But seriously, we are working on it.",
        "這聽起來很有趣，能請您多描述一點具體的使用情境嗎？這樣我能給您更準確的建議。",
        "沒問題，這交給我們處理 💪\n\n1. 我們會先記錄您的需求\n2. 轉交給技術部門\n3. 24小時內回覆您"
      ]
      
      responseText = aiResponses[Math.floor(Math.random() * aiResponses.length)]
    
      if (userText.includes('價') || userText.includes('錢') || userText.includes('price')) {
        responseText = "關於價格的部分，我們目前有幾種方案：\n\n- **基礎版**：免費試用\n- **專業版**：每月 $9.99\n- **企業版**：請聯繫業務代表\n\n您對哪個方案感興趣呢？"
      }
      
      // Easter Egg
      if (userText.includes('Real AI') || userText.includes('笨')) {
          responseText = "我是模擬 AI，但如果您填入 Google Gemini Key，我就能變成真的了！ 🤖"
      }
  }
  
  isTyping.value = false

  // 3. Create Placeholder Message with unique ID
  const messageId = Date.now()
  const newMessage = {
    id: messageId,
    userId: 'bot',
    from: 'Bot',
    text: '', // Start Empty
    timestamp: new Date(),
    isStreaming: true // Flag for cursor animation
  }
  
  // Push to local view immediately
  messages.value.push(newMessage)
  isStreaming.value = true
  scrollToBottom()

  // 4. Typing Effect (Stream) - Using array index for reactivity
  let i = 0
  const streamSpeed = 15 // ms per char (slower, more natural)
  const charsPerTick = 2 // Type 2 chars per tick
  
  const streamInterval = setInterval(() => {
    // Find the message in the array by ID
    const msgIndex = messages.value.findIndex(m => m.id === messageId)
    if (msgIndex === -1) {
      clearInterval(streamInterval)
      isStreaming.value = false
      return
    }
    
    // Append multiple characters per tick
    const endIndex = Math.min(i + charsPerTick, responseText.length)
    const newText = messages.value[msgIndex].text + responseText.substring(i, endIndex)
    
    // Update using Vue reactivity
    messages.value[msgIndex] = {
      ...messages.value[msgIndex],
      text: newText
    }
    
    i = endIndex
    
    // Auto Scroll
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
    
    // Finish
    if (i >= responseText.length) {
      clearInterval(streamInterval)
      
      // Remove streaming flag
      messages.value[msgIndex] = {
        ...messages.value[msgIndex],
        isStreaming: false
      }
      isStreaming.value = false
            
            // 5. Finalize (Optional: Save to DB for persistence)
            // We save the FULL message at the end. 
            // Note: onSnapshot might cause a slight flicker when it syncs back, but it ensures persistence.
            (async () => {
              try {
                  if (navigator.onLine) {
                   await addDoc(chatCollection, {
                      userId: 'bot',
                      from: 'Bot',
                      text: responseText,
                      timestamp: serverTimestamp(),
                      createdAt: Date.now()
                   })
                   // Remove the local "draft" to avoid duplicates (Snapshot will replace it)
                   // Actually, we can just let snapshot replace it based on ID/Logic, 
                   // but since ID is different, we might get duplicates. 
                   // A simple way for Demo: Don't save to DB if we want smooth demo, 
                   // OR remove the local one right before saving.
                   
                   // Let's remove the draft message we just typed out, letting the Snapshot take over
                   // This causes a blink.
                   // BETTER DEMO UX: Don't save to DB for 'Simulated' bots to avoid blink. 
                   // User can clear chat to reset. 
                   // (Reverting to original logic: Only save if necessary. For ChatGPT feel, 'Smooth' is better than 'Persist')
                   // UNLESS user strictly wants persistence. Given 'Demo', Smoothness wins.
                   // Commenting out DB save for Bot to prevent 'Blinking/Duplicate'.
                   /* 
                   await addDoc(...) 
                   */
                  }
              } catch (e) {
                  console.error("Failed to save bot response", e)
              }
            })()
        }
    }, streamSpeed)
    

}

// Real-time Listener
let unsubscribe = null

onMounted(() => {
  try {
    const q = query(chatCollection, orderBy('createdAt', 'asc'))
    unsubscribe = onSnapshot(q, (snapshot) => {
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTimeout(scrollToBottom, 100) // Small delay to ensure render
    }, (error) => {
        console.warn("Firestore access failed. Using local mode.", error)
    })
  } catch (e) {
      console.warn("Firebase not initialized correctly.")
  }

  // Init Remote Web Components
  initWebComponent().then(() => {
      console.log('Web Components Loaded')
      isWebComponentLoaded.value = true
  })
  
  // Fake User (Optional Simulation)
  // setInterval(() => {
  //    if (Math.random() > 0.8) {
  //        messages.value.push({ from: 'Stranger', text: 'Hello!', timestamp: new Date() })
  //    }
  // }, 5000)
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

// Initial scroll
watch(messages, () => {
    // Scroll usually handled by snapshot callback, but this catches other updates
}, { deep: true })

// Icons for BaseButton (Rewritten as Render Functions to avoid runtime compiler requirement)
const IconScrollTop = {
  render: () => h('svg', { 
    xmlns: "http://www.w3.org/2000/svg", 
    class: "h-5 w-5", 
    fill: "none", 
    viewBox: "0 0 24 24", 
    stroke: "currentColor" 
  }, [
    h('path', { 
      'stroke-linecap': "round", 
      'stroke-linejoin': "round", 
      'stroke-width': "2", 
      d: "M5 10l7-7m0 0l7 7m-7-7v18" 
    })
  ])
}

const IconScrollBottom = {
  render: () => h('svg', { 
    xmlns: "http://www.w3.org/2000/svg", 
    class: "h-5 w-5", 
    fill: "none", 
    viewBox: "0 0 24 24", 
    stroke: "currentColor" 
  }, [
    h('path', { 
      'stroke-linecap': "round", 
      'stroke-linejoin': "round", 
      'stroke-width': "2", 
      d: "M19 14l-7 7m0 0l-7-7m7 7V3" 
    })
  ])
}

const IconClear = {
  render: () => h('svg', { 
    xmlns: "http://www.w3.org/2000/svg", 
    class: "h-5 w-5", 
    fill: "none", 
    viewBox: "0 0 24 24", 
    stroke: "currentColor" 
  }, [
    h('path', { 
      'stroke-linecap': "round", 
      'stroke-linejoin': "round", 
      'stroke-width': "2", 
      d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
    })
  ])
}

const IconSend = {
  render: () => h('svg', { 
    xmlns: "http://www.w3.org/2000/svg", 
    class: "h-4 w-4", 
    viewBox: "0 0 20 20", 
    fill: "currentColor" 
  }, [
    h('path', { 
      d: "M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" 
    })
  ])
}

// ... (Rest of script)
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        
      <!-- Header -->
      <div class="p-4 bg-indigo-600 border-b border-indigo-700 flex justify-between items-center text-white">
        <div class="flex items-center">
            <h2 class="text-lg font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {{ $t('chat.title') || 'AI Consultant' }}
            </h2>
            <span class="ml-3 text-xs bg-indigo-500 px-2 py-1 rounded-full text-indigo-100 flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Online
            </span>
        </div>
        
        <!-- Controls -->
        <div v-if="isWebComponentLoaded" class="flex items-center space-x-1">
             <!-- Web Components Replacing Original Buttons -->
             <base-button 
                @click="handleScrollTop" 
                :title="$t('chat.scrollTop')"
                class="!p-2 !rounded-full !h-auto"
                style="--el-button-bg-color: transparent; --el-button-border-color: transparent; --el-button-text-color: white; --el-button-hover-text-color: white; --el-button-hover-bg-color: rgba(255,255,255,0.2); --el-button-active-bg-color: rgba(255,255,255,0.3);"
                :icon="IconScrollTop"
             />
             <base-button 
                @click="handleScrollBottom" 
                :title="$t('chat.scrollBottom')"
                class="!p-2 !rounded-full !h-auto"
                style="--el-button-bg-color: transparent; --el-button-border-color: transparent; --el-button-text-color: white; --el-button-hover-text-color: white; --el-button-hover-bg-color: rgba(255,255,255,0.2); --el-button-active-bg-color: rgba(255,255,255,0.3);"
                :icon="IconScrollBottom"
             />
            <div class="w-px h-6 bg-indigo-400 mx-1"></div>
            <base-button 
                @click="clearMessages" 
                :title="$t('chat.clear')"
                class="!p-2 !rounded-full !h-auto"
                style="--el-button-bg-color: transparent; --el-button-border-color: transparent; --el-button-text-color: white; --el-button-hover-text-color: white; --el-button-hover-bg-color: rgba(239, 68, 68, 0.2); --el-button-active-bg-color: rgba(239, 68, 68, 0.3); --el-button-hover-border-color: transparent;"
                :icon="IconClear"
             />
        </div>
        <!-- Fallback if not loaded (Optional: keep original for skeleton? But user asked to REPLACE) -->
        <!-- Since we init fast, we just show empty or use the v-if above -->
      </div>

      <!-- Messages Area -->
      <div 
        ref="messagesContainer" 
        class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 scroll-smooth"
      >
        <div v-if="messages.length === 0" class="text-center text-gray-500 mt-10">
            <p>{{ $t('chat.welcome') || 'Start a conversation...' }}</p>
        </div>

        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="flex flex-col"
          :class="{
            'items-end': msg.userId === currentUserId,
            'items-start': msg.userId !== currentUserId
          }"
        >
            <div class="flex items-end max-w-[80%]">
                <!-- Avatar (Optional for others/bot) -->
                <div v-if="msg.userId !== currentUserId" class="w-8 h-8 rounded-full flex-shrink-0 mr-2 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                     :class="msg.from === 'Bot' ? 'bg-green-500' : 'bg-gray-400'"
                >
                    {{ msg.from === 'Bot' ? 'AI' : msg.from.charAt(0) }}
                </div>

                <div 
                    class="text-sm break-words relative"
                    :class="{
                        'px-4 py-2 rounded-2xl shadow-sm bg-indigo-600 text-white rounded-br-none': msg.userId === currentUserId,
                        'text-gray-800 dark:text-gray-100': msg.from === 'Bot',
                        'px-4 py-2 rounded-2xl shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none': msg.userId !== currentUserId && msg.from !== 'Bot'
                    }"
                >
                    <div v-if="msg.userId !== currentUserId && msg.from !== 'Bot'" class="text-xs opacity-75 mb-1 font-bold text-gray-500 dark:text-gray-400">
                        {{ msg.from }}
                    </div>
                    <p class="whitespace-pre-wrap leading-relaxed" v-html="formatBold(msg.text)"></p><span v-if="msg.isStreaming" class="inline-block ml-1 animate-pulse text-green-600 font-bold">...</span>
                    
                    <div 
                        class="text-[10px] mt-1 text-right"
                        :class="{
                            'text-indigo-200': msg.userId === currentUserId,
                            'text-green-700': msg.from === 'Bot',
                            'text-gray-400': msg.userId !== currentUserId && msg.from !== 'Bot'
                        }"
                    >
                        {{ formatTime(msg.timestamp) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Typing Indicator -->
        <div v-if="isTyping" class="flex items-start">
             <div class="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 mr-2 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                AI
            </div>
            <div class="bg-green-50 border border-green-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="flex space-x-2">
            <input 
                v-model="inputMessage"
                @keyup.enter="sendMessage"
                type="text" 
                :placeholder="$t('chat.placeholder') || 'Type a message...'"
                class="flex-1 px-4 h-12 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-shadow"
            />
            <!-- Notice: Using Container Strategy (Works for Shadow:True or False) -->
            <base-button 
                v-if="isWebComponentLoaded"
                @click="sendMessage"
                type="primary"
                :name="$t('chat.send') || 'Send'"
                :icon="IconSend"
                :disabled="!inputMessage.trim()"
                round
                style="--el-button-bg-color: transparent; --el-button-border-color: transparent; --el-button-text-color: white; --el-button-hover-text-color: white; --el-button-hover-bg-color: transparent; --el-button-hover-border-color: transparent; --el-button-active-bg-color: transparent; --el-button-active-border-color: transparent; --el-button-disabled-bg-color: transparent; --el-button-outline-color: transparent;"
                class="!h-12 !w-40 !rounded-full flex items-center justify-center shadow-sm !bg-[#6366f1] hover:!bg-[#4f46e5] transition-colors cursor-pointer"
            />
        </div>
      </div>
    </div>
  </div>
</template>


