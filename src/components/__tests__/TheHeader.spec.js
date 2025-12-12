import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TheHeader from '../TheHeader.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useThemeStore } from '../../stores/themeStore'
import { useCartStore } from '../../stores/cartStore'

// Mocks
vi.mock('@vueuse/core', () => ({
  useResizeObserver: vi.fn()
}))

vi.mock('vue-router', () => ({
  RouterLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to']
  },
  useRoute: () => ({ path: '/' }),
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
    locale: { value: 'zh-TW' }
  })
}))

// Mock Element Plus Icons
vi.mock('@element-plus/icons-vue', () => ({
  ArrowLeft: { template: '<span class="arrow-left" />' },
  ArrowRight: { template: '<span class="arrow-right" />' }
}))

describe('TheHeader.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('正確渲染', () => {
    const wrapper = mount(TheHeader, {
      global: {
        stubs: {
           'el-icon': true
        },
        mocks: {
          $t: (key) => key
        }
      }
    })
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.text()).toContain('header.brand')
  })

  it('切換 Mobile Menu', async () => {
    const wrapper = mount(TheHeader, {
        global: { 
            stubs: { 'el-icon': true },
            mocks: { $t: (k) => k }
        }
    })
    
    // Find mobile menu button (hidden on desktop usually, but exists in DOM)
    // The button has aria-label toggling, let's look for svgs or the button container
    // Class based finding: .md:hidden button
    const buttons = wrapper.findAll('button.md\\:hidden')
    // The menu toggle is the one with burger icon
    const menuBtn = buttons[0] // Assuming first mobile button is menu
    
    expect(wrapper.vm.isMobileMenuOpen).toBe(false)
    await menuBtn.trigger('click')
    expect(wrapper.vm.isMobileMenuOpen).toBe(true)
  })

  it('顯示 Cart Count', async () => {
    const cartStore = useCartStore()
    cartStore.cartItems = [{ id: 1, quantity: 2 }]
    
    const wrapper = mount(TheHeader, { global: { stubs: { 'el-icon': true }, mocks: { $t: (k) => k } } })
    
    // Check if count text '1' exists (length of items)
    expect(wrapper.text()).toContain('1')
  })

  it('切換 Theme', async () => {
    const themeStore = useThemeStore()
    const wrapper = mount(TheHeader, { global: { stubs: { 'el-icon': true }, mocks: { $t: (k) => k } } })
    
    // Default is dark, so button should show "Switch to Light Mode"
    let toggleBtn = wrapper.find('[title="切換到淺色模式"]')
    expect(toggleBtn.exists()).toBe(true)
    
    // Click to toggle to light
    await toggleBtn.trigger('click')
    expect(themeStore.isDark).toBe(false)

    // Now button should show "Switch to Dark Mode"
    await wrapper.vm.$nextTick()
    toggleBtn = wrapper.find('[title="切換到深色模式"]')
    expect(toggleBtn.exists()).toBe(true)
  })
})
