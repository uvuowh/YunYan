import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: UserPreferences
  createdAt: Date
  lastLoginAt: Date
}

export interface UserPreferences {
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  privacy: {
    profileVisible: boolean
    activityVisible: boolean
  }
}

export interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * User management store
 * Handles user authentication, profile, and preferences
 */
export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => currentUser.value !== null)
  const userName = computed(() => currentUser.value?.name ?? 'Guest')
  const userEmail = computed(() => currentUser.value?.email ?? '')
  const userAvatar = computed(() => currentUser.value?.avatar)
  const userPreferences = computed(() => currentUser.value?.preferences)

  // Actions
  function setUser(user: User | null): void {
    currentUser.value = user
  }

  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  async function login(email: string, _password: string): Promise<boolean> {
    setLoading(true)
    
    try {
      // TODO: Implement actual authentication logic
      // This is a placeholder for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUser: User = {
        id: crypto.randomUUID(),
        name: 'Demo User',
        email,
        preferences: {
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            desktop: false,
          },
          privacy: {
            profileVisible: true,
            activityVisible: false,
          },
        },
        createdAt: new Date(),
        lastLoginAt: new Date(),
      }
      
      setUser(mockUser)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  function logout(): void {
    setUser(null)
  }

  function updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'avatar'>>): void {
    if (currentUser.value) {
      currentUser.value = {
        ...currentUser.value,
        ...updates,
      }
    }
  }

  function updatePreferences(updates: Partial<UserPreferences>): void {
    if (currentUser.value) {
      currentUser.value.preferences = {
        ...currentUser.value.preferences,
        ...updates,
      }
    }
  }

  async function refreshUser(): Promise<void> {
    if (!isAuthenticated.value) return
    
    setLoading(true)
    
    try {
      // TODO: Implement actual user refresh logic
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (currentUser.value) {
        currentUser.value.lastLoginAt = new Date()
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    currentUser,
    isLoading,
    
    // Getters
    isAuthenticated,
    userName,
    userEmail,
    userAvatar,
    userPreferences,
    
    // Actions
    setUser,
    setLoading,
    login,
    logout,
    updateProfile,
    updatePreferences,
    refreshUser,
  }
})
