import { defineConfig, presetAttributify } from 'unocss'
import { presetWind3 } from '@unocss/preset-wind3'

export default defineConfig({
  presets: [
    presetWind3(), // 替代 presetUno, 相容 Tailwind CSS
    presetAttributify(), // 屬性化模式 (可選)
  ],
  // 保持與 Tailwind 相同的 Dark Mode 策略
  shortcuts: {
    // 這裡可以定義常用的快捷 class，目前專案尚未用到
  },
  theme: {
    // 這裡可以自定義主題顏色，目前專案使用預設 Tailwind 顏色
  }
})
