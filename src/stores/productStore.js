import { defineStore } from 'pinia'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [
      {
        id: 1,
        name: '反重力懸浮滑板',
        price: 199.99,
        description: '體驗未來的移動方式，真正的懸浮科技。',
        imageUrl: 'https://images.unsplash.com/photo-1547754980-3df97fed72a8?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 2,
        name: '量子糾纏通訊器',
        price: 299.99,
        description: '無論身在何處，都能瞬間傳遞訊息。',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        name: '隱形斗篷 (2025款)',
        price: 499.99,
        description: '採用最新的光學迷彩技術，完全隱形。',
        imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 4,
        name: '時光膠囊保險箱',
        price: 149.99,
        description: '保護您的珍貴回憶，抵禦時間的侵蝕。',
        imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 5,
        name: '無限能源電池',
        price: 999.99,
        description: '一次充電，永久使用，環保又高效。',
        imageUrl: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=800&q=80'
      }
    ]
  })
})
