/**
 * Platform detection utilities
 */

// Check if running in Tauri environment
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

// Check if running in development mode
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV
}

// Check if running in production mode
export const isProduction = (): boolean => {
  return import.meta.env.PROD
}

// Platform detection based on user agent
export const getPlatform = (): 'windows' | 'macos' | 'linux' | 'unknown' => {
  if (typeof window === 'undefined') return 'unknown'
  
  const userAgent = window.navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('win')) return 'windows'
  if (userAgent.includes('mac')) return 'macos'
  if (userAgent.includes('linux')) return 'linux'
  
  return 'unknown'
}

// Specific platform checks
export const isWindows = (): boolean => getPlatform() === 'windows'
export const isMacOS = (): boolean => getPlatform() === 'macos'
export const isLinux = (): boolean => getPlatform() === 'linux'

// Check if running on mobile (though unlikely in Tauri)
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  )
}

// Check if running on desktop
export const isDesktop = (): boolean => !isMobile()

// Get browser information
export const getBrowserInfo = () => {
  if (typeof window === 'undefined') {
    return { name: 'unknown', version: 'unknown' }
  }
  
  const userAgent = window.navigator.userAgent
  
  // Chrome
  if (userAgent.includes('Chrome')) {
    const version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown'
    return { name: 'chrome', version }
  }
  
  // Firefox
  if (userAgent.includes('Firefox')) {
    const version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown'
    return { name: 'firefox', version }
  }
  
  // Safari
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown'
    return { name: 'safari', version }
  }
  
  // Edge
  if (userAgent.includes('Edg')) {
    const version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'unknown'
    return { name: 'edge', version }
  }
  
  return { name: 'unknown', version: 'unknown' }
}

// Check for specific features
export const supportsWebGL = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      canvas.getContext('webgl')
    )
  } catch {
    return false
  }
}

export const supportsLocalStorage = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const test = 'test'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export const supportsSessionStorage = (): boolean => {
  if (typeof window === 'undefined') return false
  
  try {
    const test = 'test'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Get system theme preference
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light'
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Check if system supports dark mode
export const supportsDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all'
}

// Get screen information
export const getScreenInfo = () => {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      availWidth: 0,
      availHeight: 0,
      pixelRatio: 1,
    }
  }
  
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    pixelRatio: window.devicePixelRatio || 1,
  }
}

// Check if running in fullscreen
export const isFullscreen = (): boolean => {
  if (typeof document === 'undefined') return false
  
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}

// Platform-specific keyboard shortcuts
export const getKeyboardShortcuts = () => {
  const isMac = isMacOS()
  
  return {
    copy: isMac ? 'Cmd+C' : 'Ctrl+C',
    paste: isMac ? 'Cmd+V' : 'Ctrl+V',
    cut: isMac ? 'Cmd+X' : 'Ctrl+X',
    undo: isMac ? 'Cmd+Z' : 'Ctrl+Z',
    redo: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y',
    save: isMac ? 'Cmd+S' : 'Ctrl+S',
    open: isMac ? 'Cmd+O' : 'Ctrl+O',
    new: isMac ? 'Cmd+N' : 'Ctrl+N',
    find: isMac ? 'Cmd+F' : 'Ctrl+F',
    selectAll: isMac ? 'Cmd+A' : 'Ctrl+A',
  }
}
