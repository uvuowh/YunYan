import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface AppState {
  isLoading: boolean
  error: string | null
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  timestamp: Date
}

/**
 * Main application store
 * Handles global app state, loading states, and notifications
 */
export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const notifications = ref<Notification[]>([])

  // Getters
  const hasError = computed(() => error.value !== null)
  const notificationCount = computed(() => notifications.value.length)
  const latestNotification = computed(() => 
    notifications.value[notifications.value.length - 1]
  )

  // Actions
  function setLoading(loading: boolean): void {
    isLoading.value = loading
  }

  function setError(errorMessage: string | null): void {
    error.value = errorMessage
  }

  function clearError(): void {
    error.value = null
  }

  function addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }
    
    notifications.value.push(newNotification)

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, notification.duration)
    }
  }

  function removeNotification(id: string): void {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAllNotifications(): void {
    notifications.value = []
  }

  // Utility actions
  function showSuccess(title: string, message: string, duration = 5000): void {
    addNotification({ type: 'success', title, message, duration })
  }

  function showError(title: string, message: string, duration = 0): void {
    addNotification({ type: 'error', title, message, duration })
  }

  function showWarning(title: string, message: string, duration = 7000): void {
    addNotification({ type: 'warning', title, message, duration })
  }

  function showInfo(title: string, message: string, duration = 5000): void {
    addNotification({ type: 'info', title, message, duration })
  }

  return {
    // State
    isLoading,
    error,
    notifications,
    
    // Getters
    hasError,
    notificationCount,
    latestNotification,
    
    // Actions
    setLoading,
    setError,
    clearError,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
})
