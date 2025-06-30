import { useThemeStore } from '@/stores'

/**
 * Theme composable - wrapper around theme store
 */
export function useTheme() {
  const themeStore = useThemeStore()

  return {
    currentTheme: themeStore.currentTheme,
    isDark: themeStore.isDark,
    themeIcon: themeStore.themeIcon,
    themeLabel: themeStore.themeLabel,
    setTheme: themeStore.setTheme,
    toggleTheme: themeStore.toggleTheme,
    initializeTheme: themeStore.initializeTheme,
  }
}
