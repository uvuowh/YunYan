import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export interface ThemeState {
  currentTheme: 'light' | 'dark' | 'auto'
  isDark: boolean
}

/**
 * Theme management store
 * Handles dark/light mode switching and persistence
 */
export const useThemeStore = defineStore('theme', () => {
  // State - persisted in localStorage
  const currentTheme = useLocalStorage<'light' | 'dark' | 'auto'>('theme', 'auto')
  
  // Reactive state for system preference
  const prefersDark = ref(false)

  // Getters
  const isDark = computed(() => {
    if (currentTheme.value === 'auto') {
      return prefersDark.value
    }
    return currentTheme.value === 'dark'
  })

  const themeIcon = computed(() => {
    switch (currentTheme.value) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'auto':
        return '🔄'
      default:
        return '🔄'
    }
  })

  const themeLabel = computed(() => {
    switch (currentTheme.value) {
      case 'light':
        return 'Light Mode'
      case 'dark':
        return 'Dark Mode'
      case 'auto':
        return 'Auto Mode'
      default:
        return 'Auto Mode'
    }
  })

  // Actions
  function setTheme(theme: 'light' | 'dark' | 'auto'): void {
    currentTheme.value = theme
    applyTheme()
  }

  function toggleTheme(): void {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  function applyTheme(): void {
    const html = document.documentElement
    
    if (isDark.value) {
      html.setAttribute('data-theme', 'dark')
      html.classList.add('dark')
    } else {
      html.setAttribute('data-theme', 'light')
      html.classList.remove('dark')
    }
  }

  function initializeTheme(): void {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    prefersDark.value = mediaQuery.matches

    // Listen for system preference changes
    mediaQuery.addEventListener('change', (e) => {
      prefersDark.value = e.matches
      if (currentTheme.value === 'auto') {
        applyTheme()
      }
    })

    // Apply initial theme
    applyTheme()
  }

  return {
    // State
    currentTheme,
    
    // Getters
    isDark,
    themeIcon,
    themeLabel,
    
    // Actions
    setTheme,
    toggleTheme,
    applyTheme,
    initializeTheme,
  }
})
