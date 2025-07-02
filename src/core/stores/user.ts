import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserPreferences, Theme } from '@/core/api/tauri/types'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const preferences = ref<UserPreferences>({
    theme: 'auto',
    language: 'en',
    notifications: {
      desktop: true,
      sound: false,
      frequency: 'immediate',
    },
    app_settings: {
      auto_save_interval: 300,
      max_recent_files: 10,
      analytics_enabled: false,
    },
  })
  const isAuthenticated = ref<boolean>(false)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const userName = computed(() => currentUser.value?.name || 'Guest')
  const userEmail = computed(() => currentUser.value?.email || null)
  const userTheme = computed(() => preferences.value.theme)
  const userLanguage = computed(() => preferences.value.language)

  // Actions
  const setUser = (user: User) => {
    currentUser.value = user
    isAuthenticated.value = true
  }

  const updateTheme = (theme: Theme) => {
    preferences.value.theme = theme
  }

  const createGuestUser = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest User',
      email: undefined,
      preferences: preferences.value,
      created_at: Date.now(),
      last_login: Date.now(),
    }
    setUser(guestUser)
  }

  const logout = () => {
    currentUser.value = null
    isAuthenticated.value = false
    error.value = null
  }

  const initialize = async () => {
    isLoading.value = true
    try {
      // Create guest user for demo
      createGuestUser()
    } catch (err) {
      console.error('Failed to initialize user:', err)
      createGuestUser()
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    currentUser.value = null
    isAuthenticated.value = false
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    currentUser,
    preferences,
    isAuthenticated,
    isLoading,
    error,

    // Getters
    userName,
    userEmail,
    userTheme,
    userLanguage,

    // Actions
    setUser,
    updateTheme,
    createGuestUser,
    logout,
    initialize,
    reset,
  }
})
