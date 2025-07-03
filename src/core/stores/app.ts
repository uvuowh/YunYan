import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SystemInfo, AppVersion } from '@/core/api/tauri/types'
import { getSystemInfo, getAppVersion, isDevMode } from '@/core/api'
import { isTauri } from '@/core/utils/platform'

export const useAppStore = defineStore('app', () => {
  // State
  const systemInfo = ref<SystemInfo | null>(null)
  const appVersion = ref<AppVersion | null>(null)
  const isDev = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const isInitialized = ref<boolean>(false)

  // UI State
  const sidebarCollapsed = ref<boolean>(false)
  const theme = ref<'light' | 'dark' | 'auto'>('auto')
  const language = ref<string>('en')

  // Getters
  const isReady = computed(() => isInitialized.value && !isLoading.value)
  const hasError = computed(() => error.value !== null)
  const appTitle = computed(() => {
    if (appVersion.value) {
      return `YunYan v${appVersion.value.version}`
    }
    return 'YunYan'
  })

  // Actions
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme
    // Apply theme to document
    applyTheme(newTheme)
  }

  const setLanguage = (lang: string) => {
    language.value = lang
  }

  const applyTheme = (themeValue: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement

    if (themeValue === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', themeValue)
    }
  }

  const fetchSystemInfo = async () => {
    try {
      setLoading(true)
      clearError()

      // Only fetch system info if running in Tauri environment
      if (isTauri()) {
        const [sysInfo, version, devMode] = await Promise.all([
          getSystemInfo(),
          getAppVersion(),
          isDevMode(),
        ])

        systemInfo.value = sysInfo
        appVersion.value = version
        isDev.value = devMode
      } else {
        // Provide fallback values for web environment
        systemInfo.value = {
          os: 'web',
          arch: 'unknown',
          family: 'web',
        }
        appVersion.value = {
          version: '0.1.0',
          build: 'web',
        }
        isDev.value = import.meta.env.DEV
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch system info'
      setError(errorMessage)
      console.error('Failed to fetch system info:', err)
    } finally {
      setLoading(false)
    }
  }

  const initialize = async () => {
    if (isInitialized.value) return

    try {
      setLoading(true)

      // Fetch system information
      await fetchSystemInfo()

      // Apply initial theme
      applyTheme(theme.value)

      // Listen for system theme changes
      if (theme.value === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', () => {
          if (theme.value === 'auto') {
            applyTheme('auto')
          }
        })
      }

      isInitialized.value = true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize app'
      setError(errorMessage)
      console.error('Failed to initialize app:', err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    systemInfo.value = null
    appVersion.value = null
    isDev.value = false
    isLoading.value = false
    error.value = null
    isInitialized.value = false
    sidebarCollapsed.value = false
    theme.value = 'auto'
    language.value = 'en'
  }

  return {
    // State
    systemInfo,
    appVersion,
    isDev,
    isLoading,
    error,
    isInitialized,
    sidebarCollapsed,
    theme,
    language,

    // Getters
    isReady,
    hasError,
    appTitle,

    // Actions
    setLoading,
    setError,
    clearError,
    toggleSidebar,
    setSidebarCollapsed,
    setTheme,
    setLanguage,
    fetchSystemInfo,
    initialize,
    reset,
  }
})
