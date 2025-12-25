import { createI18n } from 'vue-i18n'
import zhTW from '../locales/zh-TW.json'
import en from '../locales/en.json'
import ja from '../locales/ja.json'
import ko from '../locales/ko.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || (() => {
    const lang = navigator.language.toLowerCase()
    if (lang.startsWith('zh')) return 'zh-TW'
    if (lang.startsWith('en')) return 'en'
    if (lang.startsWith('ja')) return 'ja'
    if (lang.startsWith('ko')) return 'ko'
    return 'zh-TW'
  })(),
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    'en': en,
    'ja': ja,
    'ko': ko
  }
})

export default i18n
