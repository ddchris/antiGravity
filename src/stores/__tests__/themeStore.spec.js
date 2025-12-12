import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '../themeStore'

describe('Theme Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        // Reset DOM classList
        document.documentElement.classList.remove('dark')
        // Mock Storage
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null) // Default dark
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
    })

    it('預設初始化為 Dark Mode', () => {
        const store = useThemeStore()
        expect(store.isDark).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('正確切換 Theme', () => {
        const store = useThemeStore()
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        
        // Initial clean state (mocked as null -> dark=true)
        // Let's toggle to light
        store.toggleTheme()
        
        expect(store.isDark).toBe(false)
        expect(document.documentElement.classList.contains('dark')).toBe(false)
        expect(setItemSpy).toHaveBeenCalledWith('theme', 'light')
        
        // Toggle back to dark
        store.toggleTheme()
        expect(store.isDark).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark')
    })
})
