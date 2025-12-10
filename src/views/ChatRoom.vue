<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { db } from '../firebase/config'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, writeBatch, deleteDoc } from 'firebase/firestore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// State
const messages = ref([])
const inputMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

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
    if (!confirm(t('chat.clearConfirm'))) return
    
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
const triggerAIResponse = async (userText) => {
  // Only trigger AI response if the message was sent by THIS client
  // But strictly speaking, AI response could be cloud function. 
  // For client-side calc, we'll just check if we just sent a message.
  
  isTyping.value = true
  
  // Simulate network delay
  setTimeout(async () => {
    try {
        // Here you would call an actual AI API
        // const response = await fetch('YOUR_AI_ENDPOINT', ...)
        
        // Mock Response
        const aiResponses = [
            "這是很有趣的觀點！",
            "能多告訴我一點嗎？",
            "我們的產品都有品質保證喔。",
            "您提到的這個功能我們正在開發中。",
            "收到，我會將您的意見轉達給相關部門。",
            "This is interesting!",
            "Tell me more about it.",
            "Our products are quality guaranteed."
        ]
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
        
        await addDoc(chatCollection, {
            userId: 'bot', // Special ID for Bot
            from: 'Bot',
            text: `[AI] ${randomResponse}`,
            timestamp: serverTimestamp(),
            createdAt: Date.now()
        })
    } catch (e) {
        // Fallback if local
        messages.value.push({
            id: Date.now() + 1,
            userId: 'bot',
            from: 'Bot',
            text: `[AI (Local)] I received: "${userText}"`,
            timestamp: new Date()
        })
    } finally {
        isTyping.value = false
        scrollToBottom()
    }
  }, 1500)
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
                {{ $t('chat.title') || 'Online Service' }}
            </h2>
            <span class="ml-3 text-xs bg-indigo-500 px-2 py-1 rounded-full text-indigo-100 flex items-center">
                <span class="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                Online
            </span>
        </div>
        
        <!-- Controls -->
        <div class="flex items-center space-x-1">
             <button 
                @click="handleScrollTop" 
                :title="$t('chat.scrollTop')"
                class="p-2 hover:bg-indigo-500 rounded-full transition-colors focus:outline-none"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
             <button 
                @click="handleScrollBottom" 
                :title="$t('chat.scrollBottom')"
                class="p-2 hover:bg-indigo-500 rounded-full transition-colors focus:outline-none"
             >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>
            <div class="w-px h-6 bg-indigo-400 mx-1"></div>
            <button 
                @click="clearMessages" 
                :title="$t('chat.clear')"
                class="p-2 hover:bg-red-500 rounded-full transition-colors focus:outline-none"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
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
                    class="px-4 py-2 rounded-2xl shadow-sm text-sm break-words relative"
                    :class="{
                        'bg-indigo-600 text-white rounded-br-none': msg.userId === currentUserId,
                        'bg-green-100 text-green-900 border border-green-200 rounded-bl-none': msg.from === 'Bot',
                        'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none': msg.userId !== currentUserId && msg.from !== 'Bot'
                    }"
                >
                    <div v-if="msg.userId !== currentUserId" class="text-xs opacity-75 mb-1 font-bold"
                        :class="msg.from === 'Bot' ? 'text-green-700' : 'text-gray-500 dark:text-gray-400'"
                    >
                        {{ msg.from }}
                    </div>
                    <p class="whitespace-pre-wrap leading-relaxed">{{ msg.text }}</p>
                    
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
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-shadow"
            />
            <button 
                @click="sendMessage"
                :disabled="!inputMessage.trim()"
                class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                <span>{{ $t('chat.send') || 'Send' }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>
