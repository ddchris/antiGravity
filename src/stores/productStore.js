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
      },
      {
        id: 6,
        name: '全息投影腕錶',
        price: 349.99,
        description: '將智慧型手機的功能投射在手腕上，科技感十足。',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 7,
        name: '腦波控制耳機',
        price: 249.99,
        description: '用思想控制音樂播放，釋放雙手。',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 8,
        name: '這不是火焰噴射器',
        price: 599.99,
        description: '絕對不是火焰噴射器，只是除草工具。',
        imageUrl: 'https://images.unsplash.com/photo-1583241475880-083f84372725?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 9,
        name: '奈米醫療修復儀',
        price: 1299.99,
        description: '快速修復輕微外傷，家庭必備醫療神器。',
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 10,
        name: '智慧管家機器人',
        price: 2999.99,
        description: '處理家務，陪伴聊天，您的貼心好幫手。',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 11,
        name: '太空旅行背包',
        price: 459.99,
        description: '輕量化設計，適合短途太空旅行。',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 12,
        name: '植物溝通翻譯機',
        price: 189.99,
        description: '聽懂植物的聲音，成為真正的綠手指。',
        imageUrl: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 13,
        name: '夢境記錄儀',
        price: 799.99,
        description: '醒來後回放您的夢境，探索潛意識的奧秘。',
        imageUrl: 'https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 14,
        name: '重力訓練鞋',
        price: 229.99,
        description: '模擬高重力環境，提升訓練效率。',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 15,
        name: '自動導航無人機',
        price: 699.99,
        description: '全自動跟隨拍攝，記錄您的精彩瞬間。',
        imageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 16,
        name: '虛擬實境隱形眼鏡',
        price: 899.99,
        description: '無需笨重頭盔，直接體驗沉浸式虛擬世界。',
        imageUrl: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 17,
        name: '太陽能自充手機殼',
        price: 59.99,
        description: '有光就有電，告別電量焦慮。',
        imageUrl: 'https://images.unsplash.com/photo-1586506899661-0570b5c10ad4?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 18,
        name: '液態金屬手錶',
        price: 559.99,
        description: '流體設計，隨心變換錶盤形狀。',
        imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 19,
        name: '記憶增強膠囊',
        price: 89.99,
        description: '短期提升記憶力，考試工作必備。',
        imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 20,
        name: '3D 食物列印機',
        price: 1499.99,
        description: '想吃什麼印什麼，廚房革命新體驗。',
        imageUrl: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 21,
        name: '情緒調節光譜儀',
        price: 199.99,
        description: '透過光線調節室內氛圍，改善您的情緒。',
        imageUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 22,
        name: '深海探險呼吸器',
        price: 399.99,
        description: '從水中提取氧氣，像魚一樣自由呼吸。',
        imageUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 23,
        name: '反重力咖啡杯',
        price: 49.99,
        description: '咖啡永遠不會灑出來，辦公室必備。',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 24,
        name: '寵物語言翻譯項圈',
        price: 159.99,
        description: '終於知道主子在想什麼了。',
        imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 25,
        name: '便攜式蟲洞產生器',
        price: 9999.99,
        description: '雖然只能傳送小物件，但絕對酷炫。',
        imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 26,
        name: '全自動洗澡機',
        price: 2499.99,
        description: '躺進去就好，洗澡吹乾一次完成。',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 27,
        name: '智慧型隱形面具',
        price: 199.99,
        description: '隨時更換虛擬妝容，省去化妝時間。',
        imageUrl: 'https://images.unsplash.com/photo-1616554846775-4720612f0fd9?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 28,
        name: '空氣淨化防護罩',
        price: 299.99,
        description: '在您周圍形成純淨空氣層，遠離污染。',
        imageUrl: 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 29,
        name: '腦波打字機',
        price: 349.99,
        description: '想什麼就打什麼，寫作效率提升十倍。',
        imageUrl: 'https://images.unsplash.com/photo-1502570149819-b226063eee4f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 30,
        name: '全息投影鍵盤',
        price: 129.99,
        description: '在任何平面上投射鍵盤，隨時隨地工作。',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-308231c8e065?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 31,
        name: '智能溫控外套',
        price: 399.99,
        description: '自動調節溫度，冬暖夏涼。',
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 32,
        name: '奈米防水噴霧',
        price: 29.99,
        description: '任何物體表面防水防污，保持嶄新。',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 33,
        name: '電子書眼罩',
        price: 149.99,
        description: '閉上眼睛就能閱讀，保護視力。',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 34,
        name: '聲波洗碗機',
        price: 599.99,
        description: '利用聲波震動清潔，省水又乾淨。',
        imageUrl: 'https://images.unsplash.com/photo-1585837575652-2c90f5b248a3?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 35,
        name: '數位排毒盒',
        price: 79.99,
        description: '強制鎖住手機，享受專注時光。',
        imageUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 36,
        name: '懸浮盆栽',
        price: 89.99,
        description: '讓植物懸浮旋轉，360度吸收陽光。',
        imageUrl: 'https://images.unsplash.com/photo-1453904300235-0f2f60b9c25d?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 37,
        name: '智慧跟隨行李箱',
        price: 499.99,
        description: '不用拖著走，行李箱會乖乖跟著您。',
        imageUrl: 'https://images.unsplash.com/photo-1565514020176-6c2235c8747e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 38,
        name: '夜視增強眼鏡',
        price: 259.99,
        description: '黑夜如白晝，看清一切細節。',
        imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 39,
        name: '個人飛行器',
        price: 49999.99,
        description: '上班不再塞車，直接飛過去。',
        imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 40,
        name: '時光回溯鐘',
        price: 999.99,
        description: '只是裝飾品，但看起來真的像能倒流時光。',
        imageUrl: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=800&q=80'
      }
    ]
  })
})
