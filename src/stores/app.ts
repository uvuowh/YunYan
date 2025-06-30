import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AppTheme {
  mode: 'light' | 'dark' | 'auto'
  primaryColor: string
}

export interface AppSettings {
  language: string
  autoSave: boolean
  syncEnabled: boolean
}

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const theme = ref<AppTheme>({
    mode: 'auto',
    primaryColor: '#3b82f6'
  })
  const settings = ref<AppSettings>({
    language: 'zh-CN',
    autoSave: true,
    syncEnabled: false
  })
  const currentView = ref<'notes' | 'whiteboard' | 'hybrid'>('hybrid')

  // Getters
  const isDarkMode = computed(() => {
    if (theme.value.mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return theme.value.mode === 'dark'
  })

  // Actions
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setTheme(newTheme: Partial<AppTheme>) {
    theme.value = { ...theme.value, ...newTheme }
  }

  function setSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
  }

  function setCurrentView(view: 'notes' | 'whiteboard' | 'hybrid') {
    currentView.value = view
  }

  function toggleTheme() {
    const newMode = theme.value.mode === 'light' ? 'dark' : 'light'
    setTheme({ mode: newMode })
  }

  return {
    // State
    isLoading,
    theme,
    settings,
    currentView,
    // Getters
    isDarkMode,
    // Actions
    setLoading,
    setTheme,
    setSettings,
    setCurrentView,
    toggleTheme
  }
})
