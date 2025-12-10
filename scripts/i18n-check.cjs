
// scripts/i18n-check-google.cjs
/**
 * ✅ 自動從 Google Sheet 匯入 → 更新本地 JSON
 * ✅ 掃描 Vue 檔案 → 新 key 自動翻譯 & 寫入 JSON
 * ✅ 支援巢狀 key（aaa.bbb → { aaa: { bbb: ... } }）
 * ✅ 無需 API Key、可立即使用
 * ✅ 自動清理未使用的 i18n key（遞迴刪除空物件）
 */

const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')
const glob = require('glob')

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))

const localesDir = 'src/locales'
const vueFilesGlob = 'src/**/*.vue'

// Google Sheet CSV 連結（需公開分享 CSV）
const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQQySaoDhMqziKblX3BLhISn2AlT8hduKpnUxdG45kKxnTeL6KgyjgoaLipDeAbqjYcJc-ZEbAPlKkl/pub?output=csv'

// ----------------------
// 工具函數：安全設定巢狀 key
// ----------------------
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i]
    if (!current[k] || typeof current[k] !== 'object')
      current[k] = {}
    current = current[k]
  }
  current[keys[keys.length - 1]] = value
}

// ----------------------
// 1️⃣ 讀取 Google Sheet CSV 並更新本地 locale JSON
// ----------------------
async function importGoogleSheet() {
  const res = await fetch(sheetCsvUrl)
  if (!res.ok)
    throw new Error('Failed to fetch Google Sheet CSV')
  const csvText = await res.text()

  const parseCsvLine = (line) => {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        inQuotes = !inQuotes
      }
      else if (c === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      }
      else {
        current += c
      }
    }
    result.push(current.trim())
    return result.map(s => s.replace(/^"|"$/g, ''))
  }

  const lines = csvText.split(/\r?\n/).filter(Boolean)
  const headers = parseCsvLine(lines[0])
  const dataLines = lines.slice(1)

  const locales = {}
  headers.slice(1, -1).forEach(lang => (locales[lang] = {}))

  dataLines.forEach((line) => {
    const cols = parseCsvLine(line)
    const key = cols[0]?.trim()
    if (!key)
      return

    headers.slice(1, -1).forEach((lang, idx) => {
      const value = (cols[idx + 1] || '').trim()
      setNestedValue(locales[lang], key, value)
    })

    const detail = cols[cols.length - 1]?.trim()
    if (detail)
      console.log(`💡 Key "${key}" detail: ${detail}`)
  })

  for (const lang of Object.keys(locales)) {
    const safeLang = lang.replace(/[<>:"/\\|?*{}();]/g, '_')
    const filePath = path.join(localesDir, `${safeLang}.json`)
    fs.writeFileSync(filePath, JSON.stringify(locales[lang], null, 2), 'utf8')
    console.log(`✅ Updated ${filePath} from Google Sheet`)
  }

  return Object.keys(locales)
}

// ----------------------
// 2️⃣ 掃描 Vue 文件 missing key
// ----------------------
function scanVueFiles() {
  const vueFiles = glob.sync(vueFilesGlob).map(f => f.replace(/\\/g, '/'))
  if (!vueFiles.length) {
    console.error('❌ No Vue files found')
    process.exit(1)
  }

  const missingKeys = []
  vueFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    const regex = /\b(?:\$t|t|i18n\.t)\(\s*['"`]([^'"`]+)['"`]/g
    let match
    while ((match = regex.exec(content)) !== null) {
      const key = match[1].trim()
      if (!key || /^[#<\\]/.test(key))
        continue
      if (!missingKeys.includes(key))
        missingKeys.push(key)
    }
  })
  return missingKeys
}

// ----------------------
// 3️⃣ 讀 locale JSON
// ----------------------
function loadLocales(langs) {
  const localesData = {}
  langs.forEach((lang) => {
    const filePath = path.join(localesDir, `${lang}.json`)
    let data = {}
    if (fs.existsSync(filePath)) {
      try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')) }
      catch {}
    }
    localesData[lang] = data
  })
  return localesData
}

// ----------------------
// 4️⃣ 翻譯服務
// ----------------------
// async function translateWordViaGoogleFree(word, target) {
//   try {
//     const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${target}&q=${encodeURIComponent(word)}`
//     const res = await fetch(url)
//     const data = await res.json()
//     if (data && data.sentences && data.sentences[0] && data.sentences[0].trans)
//       return data.sentences[0].trans
//   }
//   catch {}
//   return null
// }

// async function translateViaLibre(text, target) {
//   try {
//     const res = await fetch('https://libretranslate.com/translate', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ q: text, source: 'auto', target, format: 'text' }),
//     })
//     const data = await res.json()
//     if (data.translatedText && data.translatedText.trim() !== text)
//       return data.translatedText
//   }
//   catch {}
//   return null
// }

// async function translateText(text, target) {
//   const isWord = !/\s/.test(text)
//   if (isWord) {
//     const wordTr = await translateWordViaGoogleFree(text, target)
//     if (wordTr && wordTr.trim() !== text)
//       return wordTr
//   }
//   const libreTr = await translateViaLibre(text, target)
//   if (libreTr && libreTr.trim() !== text)
//     return libreTr
//   return text
// }

// ----------------------
// 5️⃣ 處理 missing key 並寫回 JSON
// ----------------------
// async function processMissingKeys(missingKeys, localesData, langs) {
//   for (const [idx, key] of missingKeys.entries()) {
//     for (const lang of langs) {
//       const segments = key.split('.')
//       let current = localesData[lang]
//       for (let i = 0; i < segments.length - 1; i++) {
//         if (!current[segments[i]])
//           current[segments[i]] = {}
//         current = current[segments[i]]
//       }
//       const lastKey = segments[segments.length - 1]
//       if (!current[lastKey]) {
//         const tr = await translateText(key, lang)
//         current[lastKey] = tr
//       }
//     }
//     console.log(`✅ [${idx + 1}/${missingKeys.length}] ${key} processed`)
//   }

//   langs.forEach((lang) => {
//     const filePath = path.join(localesDir, `${lang}.json`)
//     fs.writeFileSync(filePath, JSON.stringify(localesData[lang], null, 2), 'utf8')
//     console.log(`✅ Updated ${filePath}`)
//   })
// }

// ----------------------
// 6️⃣ 遞迴清理未使用 key 和空物件
// ----------------------
function cleanUnusedKeys(localesData, vueFiles) {
  const usedKeys = new Set()
  vueFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    const regex = /\b(?:\$t|t|i18n\.t)\(\s*['"`]([^'"`]+)['"`]/g
    let match
    while ((match = regex.exec(content)) !== null) usedKeys.add(match[1].trim())
  })

  Object.keys(localesData).forEach((lang) => {
    removeUnusedKeysRecursively(localesData[lang], '', usedKeys)
    const filePath = path.join(localesDir, `${lang}.json`)
    fs.writeFileSync(filePath, JSON.stringify(localesData[lang], null, 2), 'utf8')
  })
}

function removeUnusedKeysRecursively(obj, prefix, usedKeys) {
  Object.keys(obj).forEach((key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (obj[key] && typeof obj[key] === 'object') {
      removeUnusedKeysRecursively(obj[key], fullKey, usedKeys)
      if (Object.keys(obj[key]).length === 0)
        delete obj[key]
    }
    else {
      if (!usedKeys.has(fullKey))
        delete obj[key]
    }
  })
}

// ----------------------
// 7️⃣ 主流程
// ----------------------
;(async () => {
  try {
    // const langs = await importGoogleSheet()
    // const missingKeys = scanVueFiles()

    // 1. Get languages from local files
    const files = fs.readdirSync(localesDir)
    const langs = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''))
    
    const localesData = loadLocales(langs)
    // await processMissingKeys(missingKeys, localesData, langs)

    // const vueFiles = glob.sync(vueFilesGlob).map(f => f.replace(/\\/g, '/'))
    // cleanUnusedKeys(localesData, vueFiles)

    // 8️⃣ 匯出 CSV
    exportToCSV(localesData)

    console.log('🎉 i18n process completed!')
  }
  catch (err) {
    console.error(err)
    process.exit(1)
  }
})()

// ----------------------
// 8️⃣ 匯出 CSV
// ----------------------
function exportToCSV(localesData) {
  const allKeys = new Set()
  // Ensure we have the specific languages user wants, map ko to kr
  const targetLangs = ['zh-TW', 'en', 'ja', 'kr']
  const langMap = {
    'zh-TW': 'zh-TW',
    'en': 'en',
    'ja': 'ja',
    'kr': 'ko' // Map kr column to ko.json data
  }

  // 收集所有 key (flatten)
  function collectKeys(obj, prefix) {
    Object.keys(obj).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        collectKeys(obj[key], fullKey)
      }
      else {
        allKeys.add(fullKey)
      }
    })
  }

  Object.values(localesData).forEach(data => collectKeys(data, ''))

  const sortedKeys = Array.from(allKeys).sort()
  const header = ['key', ...targetLangs, 'detail']
  const rows = [header.join(',')]

  sortedKeys.forEach((key) => {
    const row = [key]
    targetLangs.forEach((langCol) => {
      const dataLang = langMap[langCol] || langCol
      const val = getNestedValue(localesData[dataLang] || {}, key) || ''
      // 如果值包含逗號或引號，需要用引號包起來，並處理內部的引號
      if (val.includes(',') || val.includes('"')) {
        row.push(`"${val.replace(/"/g, '""')}"`)
      }
      else {
        row.push(val)
      }
    })
    row.push('Auto-detected') // detail
    rows.push(row.join(','))
  })

  fs.writeFileSync('update_sheet.csv', rows.join('\n'), 'utf8')
  console.log('✅ Generated update_sheet.csv')
}

function getNestedValue(obj, keyPath) {
  const keys = keyPath.split('.')
  let current = obj
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    }
    else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

/*
================================================================================
📌 使用說明 / 上手指南

資料夾最外層建立 scripts 放 i18n-check-google.cjs

1️⃣ Node.js 環境
- Node.js >= 18（內建 fetch 可用，或安裝 node-fetch）
- npm 或 pnpm

2️⃣ 安裝必要套件
npm install glob node-fetch vue-i18n-extract --save-dev
# 或 pnpm
pnpm add glob node-fetch vue-i18n-extract -D

3️⃣ Google Sheet CSV 設定
- 建立 Google Sheet，欄位範例：
key                  zh-TW   en                kr     detail
welcome              歡迎    welcome           환영    ...
accountReport.title  帳號報表 account report    계정   보고서 帳號報表標題

- 發佈 CSV 連結：
  文件 -> 檔案 -> 共用 -> 發佈到網路 -> 選擇 CSV 格式
- 將生成的 CSV URL 填入 `sheetCsvUrl`

4️⃣ locales 目錄結構
- src/locales/
  - zh-TW.json
  - en.json
  - kr.json

5️⃣ 執行指令
package.json scripts 加入："i18n:check": "node ./scripts/i18n-check-google.cjs"
pnpm i18n:check

6️⃣ 功能
- 自動從 Google Sheet 更新 locale JSON（忽略 detail 欄）
- 支援巢狀 key（例如 "aaa.bbb" → { aaa: { bbb: "..." } }）
- 掃描 Vue 文件 missing key
- 缺少的 key 自動使用免費翻譯服務補上
- 單詞優先使用 Google 無 API Key 翻譯，句子 fallback LibreTranslate
- detail 欄作為日誌說明，不影響 JSON
- 跨平台可用（Windows / Mac / Linux）
================================================================================
*/
