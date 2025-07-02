import { ref, computed, watch } from 'vue'
import { useUserStore } from '@/core/stores/user'
import type { Theme } from '@/core/api/tauri/types'

const isDark = ref(false)
const systemPrefersDark = ref(false)

// Initialize system preference detection
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemPrefersDark.value = mediaQuery.matches
  
  mediaQuery.addEventListener('change', (e) => {
    systemPrefersDark.value = e.matches
  })
}

export function useTheme() {
  const userStore = useUserStore()
  
  const currentTheme = computed(() => userStore.userTheme)
  
  const resolvedTheme = computed(() => {
    if (currentTheme.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return currentTheme.value
  })
  
  // Update isDark based on resolved theme
  watch(resolvedTheme, (theme) => {
    isDark.value = theme === 'dark'
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, { immediate: true })
  
  const setTheme = async (theme: Theme) => {
    await userStore.updateTheme(theme)
  }
  
  const toggleTheme = async () => {
    const newTheme = resolvedTheme.value === 'dark' ? 'light' : 'dark'
    await setTheme(newTheme)
  }
  
  return {
    currentTheme,
    resolvedTheme,
    isDark: computed(() => isDark.value),
    systemPrefersDark: computed(() => systemPrefersDark.value),
    setTheme,
    toggleTheme
  }
}
