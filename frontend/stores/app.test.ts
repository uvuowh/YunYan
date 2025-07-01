// App Store 测试
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './app'

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with correct default state', () => {
    const store = useAppStore()

    expect(store.isInitialized).toBe(false)
    expect(store.isLoading).toBe(false)
    expect(store.currentView).toBe('home')
    expect(store.notifications).toEqual([])
    expect(store.hasNotifications).toBe(false)
    expect(store.unreadNotifications).toEqual([])
  })

  it('should add notifications correctly', () => {
    const store = useAppStore()

    const notificationId = store.addNotification({
      type: 'success',
      title: 'Test Title',
      message: 'Test Message',
      autoClose: false,
    })

    expect(store.notifications).toHaveLength(1)
    expect(store.hasNotifications).toBe(true)
    expect(store.notifications[0]).toMatchObject({
      id: notificationId,
      type: 'success',
      title: 'Test Title',
      message: 'Test Message',
      autoClose: false,
    })
    expect(store.notifications[0]?.timestamp).toBeTypeOf('number')
  })

  it('should remove notifications correctly', () => {
    const store = useAppStore()

    const id1 = store.addNotification({
      type: 'info',
      title: 'Test 1',
      message: 'Message 1',
    })

    const id2 = store.addNotification({
      type: 'warning',
      title: 'Test 2',
      message: 'Message 2',
    })

    expect(store.notifications).toHaveLength(2)

    store.removeNotification(id1)
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]?.id).toBe(id2)

    store.removeNotification(id2)
    expect(store.notifications).toHaveLength(0)
    expect(store.hasNotifications).toBe(false)
  })

  it('should clear all notifications', () => {
    const store = useAppStore()

    store.addNotification({ type: 'info', title: 'Test 1', message: 'Message 1' })
    store.addNotification({ type: 'error', title: 'Test 2', message: 'Message 2' })

    expect(store.notifications).toHaveLength(2)

    store.clearNotifications()
    expect(store.notifications).toHaveLength(0)
    expect(store.hasNotifications).toBe(false)
  })

  it('should provide convenience notification methods', () => {
    const store = useAppStore()

    store.notifySuccess('Success', 'Success message')
    store.notifyError('Error', 'Error message')
    store.notifyWarning('Warning', 'Warning message')
    store.notifyInfo('Info', 'Info message')

    expect(store.notifications).toHaveLength(4)
    expect(store.notifications[3]?.type).toBe('success')
    expect(store.notifications[2]?.type).toBe('error')
    expect(store.notifications[1]?.type).toBe('warning')
    expect(store.notifications[0]?.type).toBe('info')
  })

  it('should change current view', () => {
    const store = useAppStore()

    expect(store.currentView).toBe('home')

    store.setCurrentView('settings')
    expect(store.currentView).toBe('settings')

    store.setCurrentView('about')
    expect(store.currentView).toBe('about')
  })

  it('should reset state correctly', () => {
    const store = useAppStore()

    // 修改状态
    store.setCurrentView('settings')
    store.addNotification({ type: 'info', title: 'Test', message: 'Test' })

    expect(store.currentView).toBe('settings')
    expect(store.hasNotifications).toBe(true)

    // 重置状态
    store.reset()

    expect(store.isInitialized).toBe(false)
    expect(store.currentView).toBe('home')
    expect(store.hasNotifications).toBe(false)
  })

  it('should filter unread notifications correctly', () => {
    const store = useAppStore()

    store.addNotification({
      type: 'info',
      title: 'Auto close',
      message: 'This will auto close',
      autoClose: true,
    })

    store.addNotification({
      type: 'error',
      title: 'Manual close',
      message: 'This needs manual close',
      autoClose: false,
    })

    expect(store.notifications).toHaveLength(2)
    expect(store.unreadNotifications).toHaveLength(1)
    expect(store.unreadNotifications[0]?.title).toBe('Manual close')
  })
})
