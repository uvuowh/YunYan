// Export all stores
export { useAppStore } from './app'
export { useUserStore } from './user'

// Store initialization helper
import { useAppStore } from './app'
import { useUserStore } from './user'

/**
 * Initialize all stores
 * Call this function during app startup
 */
export const initializeStores = async () => {
  const appStore = useAppStore()
  const userStore = useUserStore()

  try {
    // Initialize stores in parallel
    await Promise.all([
      appStore.initialize(),
      userStore.initialize(),
    ])

    // Sync theme between app and user stores
    appStore.setTheme(userStore.userTheme)
    appStore.setLanguage(userStore.userLanguage)

    console.log('All stores initialized successfully')
  } catch (error) {
    console.error('Failed to initialize stores:', error)
    throw error
  }
}

/**
 * Reset all stores to initial state
 */
export const resetStores = () => {
  const appStore = useAppStore()
  const userStore = useUserStore()

  appStore.reset()
  userStore.reset()
}
