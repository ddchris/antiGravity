import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseChart from '../BaseChart.vue'

// Mock echarts
const mockSetOption = vi.fn()
const mockResize = vi.fn()
const mockDispose = vi.fn()

vi.mock('echarts', () => ({
  init: () => ({
    setOption: mockSetOption,
    resize: mockResize,
    dispose: mockDispose
    // Add other methods if needed
  })
}))

describe('BaseChart.vue', () => {
  it('在 Mount 時初始化 Chart', () => {
    const option = { title: { text: 'Test Chart' } }
    
    mount(BaseChart, {
      props: { option }
    })
    
    expect(mockSetOption).toHaveBeenCalledWith(option)
  })

  it('當 Option Prop 改變時更新 Chart', async () => {
    const option = { title: { text: 'Initial' } }
    const wrapper = mount(BaseChart, {
      props: { option }
    })
    
    // Clear previous calls
    mockSetOption.mockClear()
    
    // Change prop
    const newOption = { title: { text: 'Updated' } }
    await wrapper.setProps({ option: newOption })
    
    expect(mockSetOption).toHaveBeenCalledWith(newOption, true)
  })
  
  it('在 Unmount 時銷毀 Chart', () => {
      const wrapper = mount(BaseChart, {
          props: { option: {} }
      })
      
      wrapper.unmount()
      
      expect(mockDispose).toHaveBeenCalled()
  })
})
