// 应用状态管理
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSystemStore } from './system'
import { useConfigStore } from './config'

export const useAppStore = defineStore('app', () => {
  // 状态
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const currentView = ref<'home' | 'settings' | 'about'>('home')
  const notifications = ref<
    Array<{
      id: string
      type: 'info' | 'success' | 'warning' | 'error'
      title: string
      message: string
      timestamp: number
      autoClose?: boolean
    }>
  >([])

  // 计算属性
  const hasNotifications = computed(() => notifications.value.length > 0)
  const unreadNotifications = computed(() => notifications.value.filter(n => !n.autoClose))

  // 动作
  function setCurrentView(view: typeof currentView.value) {
    currentView.value = view
  }

  function addNotification(notification: {
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    autoClose?: boolean
  }) {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    notifications.value.unshift({
      id,
      ...notification,
      timestamp: Date.now(),
    })

    // 自动关闭通知
    if (notification.autoClose !== false) {
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearNotifications() {
    notifications.value = []
  }

  // 便捷的通知方法
  function notifySuccess(title: string, message: string, autoClose = true) {
    return addNotification({ type: 'success', title, message, autoClose })
  }

  function notifyError(title: string, message: string, autoClose = false) {
    return addNotification({ type: 'error', title, message, autoClose })
  }

  function notifyWarning(title: string, message: string, autoClose = true) {
    return addNotification({ type: 'warning', title, message, autoClose })
  }

  function notifyInfo(title: string, message: string, autoClose = true) {
    return addNotification({ type: 'info', title, message, autoClose })
  }

  // 初始化应用
  async function initialize() {
    if (isInitialized.value) return

    isLoading.value = true

    try {
      // 获取其他 store
      const systemStore = useSystemStore()
      const configStore = useConfigStore()

      // 并行初始化各个模块
      await Promise.all([systemStore.initialize(), configStore.initialize()])

      isInitialized.value = true

      notifySuccess('应用初始化完成', 'YunYan 已成功启动并准备就绪', true)
    } catch (error) {
      console.error('Failed to initialize app:', error)

      notifyError('初始化失败', '应用初始化过程中发生错误，请重试', false)

      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 重置应用状态
  function reset() {
    isInitialized.value = false
    currentView.value = 'home'
    clearNotifications()
  }

  return {
    // 状态
    isInitialized,
    isLoading,
    currentView,
    notifications,

    // 计算属性
    hasNotifications,
    unreadNotifications,

    // 动作
    setCurrentView,
    addNotification,
    removeNotification,
    clearNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    initialize,
    reset,
  }
})
