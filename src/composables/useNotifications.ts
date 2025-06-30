import { useAppStore } from '@/stores'
import type { Notification } from '@/stores/app'

/**
 * Composable for managing notifications
 */
export function useNotifications() {
  const appStore = useAppStore()

  /**
   * Show a success notification
   */
  function success(title: string, message: string, duration = 5000): void {
    appStore.showSuccess(title, message, duration)
  }

  /**
   * Show an error notification
   */
  function error(title: string, message: string, duration = 0): void {
    appStore.showError(title, message, duration)
  }

  /**
   * Show a warning notification
   */
  function warning(title: string, message: string, duration = 7000): void {
    appStore.showWarning(title, message, duration)
  }

  /**
   * Show an info notification
   */
  function info(title: string, message: string, duration = 5000): void {
    appStore.showInfo(title, message, duration)
  }

  /**
   * Add a custom notification
   */
  function add(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    appStore.addNotification(notification)
  }

  /**
   * Remove a notification by ID
   */
  function remove(id: string): void {
    appStore.removeNotification(id)
  }

  /**
   * Clear all notifications
   */
  function clear(): void {
    appStore.clearAllNotifications()
  }

  /**
   * Show a confirmation-style notification with actions
   */
  function confirm(
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    // This is a simplified version - in a real app you might want
    // to create a more sophisticated confirmation system
    const confirmed = window.confirm(`${title}\n\n${message}`)
    
    if (confirmed && onConfirm) {
      onConfirm()
    } else if (!confirmed && onCancel) {
      onCancel()
    }
  }

  /**
   * Show a loading notification that can be updated
   */
  function loading(title: string, message: string): {
    update: (newTitle: string, newMessage: string) => void
    success: (newTitle: string, newMessage: string) => void
    error: (newTitle: string, newMessage: string) => void
    remove: () => void
  } {
    const notification: Omit<Notification, 'id' | 'timestamp'> = {
      type: 'info',
      title,
      message,
      duration: 0, // Don't auto-remove loading notifications
    }

    appStore.addNotification(notification)
    
    // Get the ID of the notification we just added
    const notificationId = appStore.latestNotification?.id

    return {
      update: (newTitle: string, newMessage: string) => {
        if (notificationId) {
          // Remove old notification and add updated one
          appStore.removeNotification(notificationId)
          appStore.addNotification({
            type: 'info',
            title: newTitle,
            message: newMessage,
            duration: 0,
          })
        }
      },
      success: (newTitle: string, newMessage: string) => {
        if (notificationId) {
          appStore.removeNotification(notificationId)
          success(newTitle, newMessage)
        }
      },
      error: (newTitle: string, newMessage: string) => {
        if (notificationId) {
          appStore.removeNotification(notificationId)
          error(newTitle, newMessage)
        }
      },
      remove: () => {
        if (notificationId) {
          appStore.removeNotification(notificationId)
        }
      },
    }
  }

  /**
   * Show a toast-style notification (alias for info)
   */
  function toast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    switch (type) {
      case 'success':
        success('Success', message)
        break
      case 'error':
        error('Error', message)
        break
      case 'warning':
        warning('Warning', message)
        break
      case 'info':
      default:
        info('Info', message)
        break
    }
  }

  return {
    success,
    error,
    warning,
    info,
    add,
    remove,
    clear,
    confirm,
    loading,
    toast,
    
    // Expose store getters for reactive access
    notifications: appStore.notifications,
    notificationCount: appStore.notificationCount,
    latestNotification: appStore.latestNotification,
  }
}
