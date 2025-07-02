import { invoke } from '@tauri-apps/api/core'
import type { SystemInfo, AppVersion } from './types'

/**
 * Get system information
 */
export const getSystemInfo = async (): Promise<SystemInfo> => {
  try {
    return await invoke<SystemInfo>('get_system_info')
  } catch (error) {
    console.error('Failed to get system info:', error)
    throw error
  }
}

/**
 * Get application version information
 */
export const getAppVersion = async (): Promise<AppVersion> => {
  try {
    return await invoke<AppVersion>('get_app_version')
  } catch (error) {
    console.error('Failed to get app version:', error)
    throw error
  }
}

/**
 * Check if the application is running in development mode
 */
export const isDevMode = async (): Promise<boolean> => {
  try {
    return await invoke<boolean>('is_dev_mode')
  } catch (error) {
    console.error('Failed to check dev mode:', error)
    throw error
  }
}

/**
 * Get environment variable (filtered for security)
 */
export const getEnvVar = async (key: string): Promise<string | null> => {
  try {
    return await invoke<string | null>('get_env_var', { key })
  } catch (error) {
    console.error(`Failed to get environment variable ${key}:`, error)
    throw error
  }
}

/**
 * Legacy greet function for backward compatibility
 */
export const greet = async (name: string): Promise<string> => {
  try {
    return await invoke<string>('greet', { name })
  } catch (error) {
    console.error('Failed to greet:', error)
    throw error
  }
}
