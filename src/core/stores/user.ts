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

  // Getters
  const userName = computed(() => currentUser.value?.name || 'Guest')
  const userEmail = computed(() => currentUser.value?.email || null)
  const userTheme = computed(() => preferences.value.theme)
  const userLanguage = computed(() => preferences.value.language)
  const notificationSettings = computed(() => preferences.value.notifications)
  const appSettings = computed(() => preferences.value.app_settings)

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

  const setUser = (user: User) => {
    currentUser.value = user
    isAuthenticated.value = true
  }

  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    try {
      setLoading(true)
      clearError()

      preferences.value = {
        ...preferences.value,
        ...newPreferences,
      }

      await savePreferences()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update preferences'
      setError(errorMessage)
      console.error('Failed to update preferences:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateTheme = async (theme: Theme) => {
    await updatePreferences({ theme })
  }

  const updateLanguage = async (language: string) => {
    await updatePreferences({ language })
  }

  const updateNotificationSettings = async (
    notifications: Partial<typeof preferences.value.notifications>
  ) => {
    await updatePreferences({
      notifications: {
        ...preferences.value.notifications,
        ...notifications,
      },
    })
  }

  const updateAppSettings = async (
    appSettings: Partial<typeof preferences.value.app_settings>
  ) => {
    await updatePreferences({
      app_settings: {
        ...preferences.value.app_settings,
        ...appSettings,
      },
    })
  }

  const savePreferences = async () => {
    try {
      await writeJsonFile(USER_PREFERENCES_FILE, preferences.value)
    } catch (err) {
      console.error('Failed to save preferences:', err)
      throw err
    }
  }

  const loadPreferences = async () => {
    try {
      const exists = await fileExists(USER_PREFERENCES_FILE)
      if (exists) {
        const savedPreferences = await readJsonFile<UserPreferences>(
          USER_PREFERENCES_FILE
        )
        preferences.value = {
          ...preferences.value,
          ...savedPreferences,
        }
      }
    } catch (err) {
      console.warn('Failed to load preferences, using defaults:', err)
      // Don't throw here, just use default preferences
    }
  }

  const saveUserData = async () => {
    if (!currentUser.value) return

    try {
      await writeJsonFile(USER_DATA_FILE, currentUser.value)
    } catch (err) {
      console.error('Failed to save user data:', err)
      throw err
    }
  }

  const loadUserData = async () => {
    try {
      const exists = await fileExists(USER_DATA_FILE)
      if (exists) {
        const userData = await readJsonFile<User>(USER_DATA_FILE)
        setUser(userData)
      }
    } catch (err) {
      console.warn('Failed to load user data:', err)
      // Don't throw here, user will need to authenticate
    }
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

  const logout = async () => {
    try {
      setLoading(true)

      // Save current preferences before logout
      await savePreferences()

      currentUser.value = null
      isAuthenticated.value = false
      clearError()
    } catch (err) {
      console.error('Error during logout:', err)
    } finally {
      setLoading(false)
    }
  }

  const initialize = async () => {
    try {
      setLoading(true)
      clearError()

      // Load preferences first
      await loadPreferences()

      // Try to load user data
      await loadUserData()

      // If no user data, create guest user
      if (!currentUser.value) {
        createGuestUser()
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize user'
      setError(errorMessage)
      console.error('Failed to initialize user:', err)

      // Fallback to guest user
      createGuestUser()
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    currentUser.value = null
    preferences.value = {
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
    }
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
    notificationSettings,
    appSettings,

    // Actions
    setLoading,
    setError,
    clearError,
    setUser,
    updatePreferences,
    updateTheme,
    updateLanguage,
    updateNotificationSettings,
    updateAppSettings,
    savePreferences,
    loadPreferences,
    saveUserData,
    loadUserData,
    createGuestUser,
    logout,
    initialize,
    reset,
  }
})
