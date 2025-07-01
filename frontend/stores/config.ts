// 配置状态管理
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { commands } from '@/tauri'
import type { AppConfigData, Theme, Language } from '@shared/types'

export const useConfigStore = defineStore('config', () => {
  // 状态
  const config = ref<AppConfigData>({
    theme: 'auto',
    language: 'zh-CN',
    autoSave: true,
  })
  const isLoading = ref(false)
  const isDirty = ref(false)

  // 计算属性
  const currentTheme = computed(() => config.value.theme)
  const currentLanguage = computed(() => config.value.language)
  const isAutoSaveEnabled = computed(() => config.value.autoSave)

  // 监听配置变化
  watch(
    config,
    () => {
      isDirty.value = true
    },
    { deep: true }
  )

  // 动作
  async function loadConfig() {
    isLoading.value = true
    try {
      const response = await commands.getConfig()
      if (response.success && response.data) {
        config.value = { ...config.value, ...response.data }
        isDirty.value = false
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function saveConfig() {
    if (!isDirty.value) return

    isLoading.value = true
    try {
      // 保存所有配置项
      for (const [key, value] of Object.entries(config.value)) {
        const response = await commands.setConfig({ key, value })
        if (!response.success) {
          throw new Error(`Failed to save config ${key}: ${response.error}`)
        }
      }
      isDirty.value = false
    } catch (error) {
      console.error('Failed to save config:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  async function updateConfig(key: keyof AppConfigData, value: any) {
    config.value[key] = value

    // 如果启用了自动保存，立即保存
    if (config.value.autoSave) {
      await saveConfig()
    }
  }

  async function setTheme(theme: Theme) {
    await updateConfig('theme', theme)

    // 应用主题到 DOM
    applyTheme(theme)
  }

  async function setLanguage(language: Language) {
    await updateConfig('language', language)
  }

  async function setAutoSave(enabled: boolean) {
    await updateConfig('autoSave', enabled)
  }

  function applyTheme(theme: Theme) {
    const root = document.documentElement

    if (theme === 'auto') {
      // 根据系统偏好设置主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }

  // 重置配置到默认值
  async function resetConfig() {
    config.value = {
      theme: 'auto',
      language: 'zh-CN',
      autoSave: true,
    }
    await saveConfig()
  }

  // 监听系统主题变化
  function setupThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleThemeChange = () => {
      if (config.value.theme === 'auto') {
        applyTheme('auto')
      }
    }

    mediaQuery.addEventListener('change', handleThemeChange)

    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }

  // 初始化
  async function initialize() {
    await loadConfig()
    applyTheme(config.value.theme)
    setupThemeListener()
  }

  return {
    // 状态
    config,
    isLoading,
    isDirty,

    // 计算属性
    currentTheme,
    currentLanguage,
    isAutoSaveEnabled,

    // 动作
    loadConfig,
    saveConfig,
    updateConfig,
    setTheme,
    setLanguage,
    setAutoSave,
    resetConfig,
    initialize,
  }
})
