import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppConfig, AppError } from '@/types'

export const useAppStore = defineStore('app', () => {
  // State
  const config = ref<AppConfig>({
    theme: 'light',
    language: 'en',
    autoSave: true,
    syncEnabled: true
  })

  const currentView = ref<string>('filesystem')
  const loading = ref<boolean>(false)
  const errors = ref<AppError[]>([])
  const sidebarCollapsed = ref<boolean>(false)

  // Getters
  const isDarkMode = computed(() => config.value.theme === 'dark')
  const hasErrors = computed(() => errors.value.length > 0)
  const latestError = computed(() => errors.value[errors.value.length - 1])

  // Actions
  function setTheme(theme: 'light' | 'dark') {
    config.value.theme = theme
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme)
    saveConfig()
  }

  function toggleTheme() {
    setTheme(config.value.theme === 'light' ? 'dark' : 'light')
  }

  function setCurrentView(view: string) {
    currentView.value = view
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading
  }

  function addError(error: AppError) {
    errors.value.push(error)
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      removeError(error.code)
    }, 5000)
  }

  function removeError(errorCode: string) {
    const index = errors.value.findIndex(error => error.code === errorCode)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }

  function clearErrors() {
    errors.value = []
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function updateConfig(newConfig: Partial<AppConfig>) {
    config.value = { ...config.value, ...newConfig }
    saveConfig()
  }

  function saveConfig() {
    try {
      localStorage.setItem('yunyan-config', JSON.stringify(config.value))
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  function loadConfig() {
    try {
      const savedConfig = localStorage.getItem('yunyan-config')
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        config.value = { ...config.value, ...parsed }
        // Apply theme immediately
        document.documentElement.setAttribute('data-theme', config.value.theme)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  function createError(code: string, message: string, module: string, details?: any): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
      module
    }
  }

  // Initialize
  loadConfig()

  return {
    // State
    config,
    currentView,
    loading,
    errors,
    sidebarCollapsed,
    
    // Getters
    isDarkMode,
    hasErrors,
    latestError,
    
    // Actions
    setTheme,
    toggleTheme,
    setCurrentView,
    setLoading,
    addError,
    removeError,
    clearErrors,
    toggleSidebar,
    updateConfig,
    saveConfig,
    loadConfig,
    createError
  }
})
