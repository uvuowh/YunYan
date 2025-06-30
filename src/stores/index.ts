/**
 * Pinia store index file
 * Exports all stores for easy importing
 */

export { useAppStore } from './app'
export { useThemeStore } from './theme'
export { useUserStore } from './user'

// Store types
export type { AppState } from './app'
export type { ThemeState } from './theme'
export type { UserState } from './user'
