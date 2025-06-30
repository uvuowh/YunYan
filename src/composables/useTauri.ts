import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

export interface TauriCommand {
  name: string
  args?: Record<string, any>
}

/**
 * Composable for Tauri-specific functionality
 */
export function useTauri() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hasError = computed(() => error.value !== null)
  const isTauri = computed(() => typeof window !== 'undefined' && '__TAURI__' in window)

  /**
   * Invoke a Tauri command
   */
  async function invokeCommand<T = any>(
    command: string,
    args?: Record<string, any>
  ): Promise<T | null> {
    if (!isTauri.value) {
      console.warn('Tauri commands are only available in Tauri environment')
      return null
    }

    try {
      isLoading.value = true
      error.value = null

      const result = await invoke<T>(command, args)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tauri command failed'
      error.value = errorMessage
      console.error(`Tauri command "${command}" failed:`, err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Open URL in default browser
   */
  async function openUrl(url: string): Promise<boolean> {
    if (!isTauri.value) {
      // Fallback for web environment
      window.open(url, '_blank')
      return true
    }

    try {
      // Use Tauri command to open URL
      await invokeCommand('open_url', { url })
      return true
    } catch (err) {
      console.error('Failed to open URL:', err)
      error.value = err instanceof Error ? err.message : 'Failed to open URL'
      return false
    }
  }

  /**
   * Check if running in development mode
   */
  function isDevelopment(): boolean {
    return import.meta.env.DEV
  }

  /**
   * Check if running in production mode
   */
  function isProduction(): boolean {
    return import.meta.env.PROD
  }

  /**
   * Get app version
   */
  async function getAppVersion(): Promise<string | null> {
    return invokeCommand<string>('get_app_version')
  }

  /**
   * Get platform information
   */
  async function getPlatform(): Promise<string | null> {
    return invokeCommand<string>('get_platform')
  }

  /**
   * Show native notification (if supported)
   */
  async function showNotification(
    title: string,
    body: string,
    icon?: string
  ): Promise<boolean> {
    if (!isTauri.value) {
      // Fallback to web notifications
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(title, { body, icon })
          return true
        }
      }
      return false
    }

    try {
      await invokeCommand('show_notification', { title, body, icon })
      return true
    } catch (err) {
      console.error('Failed to show notification:', err)
      return false
    }
  }

  /**
   * Read file content
   */
  async function readFile(path: string): Promise<string | null> {
    return invokeCommand<string>('read_file', { path })
  }

  /**
   * Write file content
   */
  async function writeFile(path: string, content: string): Promise<boolean> {
    try {
      await invokeCommand('write_file', { path, content })
      return true
    } catch (err) {
      console.error('Failed to write file:', err)
      return false
    }
  }

  /**
   * Check if file exists
   */
  async function fileExists(path: string): Promise<boolean> {
    const result = await invokeCommand<boolean>('file_exists', { path })
    return result ?? false
  }

  /**
   * Get system information
   */
  async function getSystemInfo(): Promise<Record<string, any> | null> {
    return invokeCommand<Record<string, any>>('get_system_info')
  }

  function clearError(): void {
    error.value = null
  }

  return {
    isLoading,
    error,
    hasError,
    isTauri,
    invokeCommand,
    openUrl,
    isDevelopment,
    isProduction,
    getAppVersion,
    getPlatform,
    showNotification,
    readFile,
    writeFile,
    fileExists,
    getSystemInfo,
    clearError,
  }
}
