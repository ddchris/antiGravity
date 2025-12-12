import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseImage from '../BaseImage.vue'

describe('BaseImage.vue', () => {
  it('成功渲染 Image', async () => {
    const wrapper = mount(BaseImage, {
      props: {
        src: 'test.jpg',
        alt: 'Test Image'
      }
    })
    
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('test.jpg')
    
    // Simulate load
    await img.trigger('load')
    expect(wrapper.vm.isLoading).toBe(false)
  })

  it('初始時顯示 Loading Spinner', () => {
    const wrapper = mount(BaseImage, {
      props: { src: 'test.jpg' }
    })
    
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })

  it('處理 Error State', async () => {
    const wrapper = mount(BaseImage, {
      props: { src: 'invalid.jpg' }
    })
    
    const img = wrapper.find('img')
    await img.trigger('error')
    
    expect(wrapper.vm.hasError).toBe(true)
    // Check fallback src
    expect(img.element.src).toContain('placehold.co')
  })
})
