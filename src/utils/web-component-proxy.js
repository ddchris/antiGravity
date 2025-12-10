// Candidate URLs in priority order
// 1. Remote (Root)
// 2. Remote (Dist)
// 3. Local Fallback (public/base-all.js)
const REMOTE_BASE = 'https://ddchris.github.io/my-widget'
const CANDIDATES = [
  `${REMOTE_BASE}/base-all.js`,
  `${REMOTE_BASE}/dist/base-all.js`,
  '/base-all.js' // Local fallback
]

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = () => {
      console.log(`Web Component Script Loaded: ${url}`)
      resolve(url)
    }
    script.onerror = (e) => {
      document.head.removeChild(script) // Clean up failed script
      reject(new Error(`Failed to load: ${url}`))
    }
    document.head.appendChild(script)
  })
}

export async function initWebComponent() {
  const timestamp = Date.now()
  let loadedUrl = null

  for (const basePath of CANDIDATES) {
    // Add timestamp for cache busting (optional, maybe only for remote?)
    // For simplicity, add to all to ensure freshness during dev
    const url = `${basePath}?t=${timestamp}`
    
    try {
      console.log(`Trying to load Web Components from: ${url}`)
      await loadScript(url)
      loadedUrl = url
      break // Success! Stop valid candidates.
    } catch (e) {
      console.warn(`Attempt failed: ${basePath}`, e.message)
    }
  }

  if (!loadedUrl) {
    console.error("CRITICAL: All Web Component candidate URLs (Remote & Local) failed.")
  } else {
    console.log(`Success! Web Components running from: ${loadedUrl}`)
  }
  
  return {
    BaseButton: window.customElements.get('base-button'),
    BaseInput: window.customElements.get('base-input'),
    BasePagination: window.customElements.get('base-pagination'),
    BaseBreadcrumb: window.customElements.get('base-breadcrumb'),
    BaseTabs: window.customElements.get('base-tabs'),
    BaseDateTimePicker: window.customElements.get('base-date-time-picker'),
    BaseTooltip: window.customElements.get('base-tooltip'),
    BaseMessage: window.customElements.get('base-message'),
    BaseMessageBox: window.customElements.get('base-message-box'),
  }
}
