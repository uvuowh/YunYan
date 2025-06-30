import { createPinia } from 'pinia'

export const pinia = createPinia()

// Export all stores
export * from './app'
export * from './whiteboard'
export * from './notes'
