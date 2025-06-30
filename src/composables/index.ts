/**
 * Composables index file
 * Exports all composables for easy importing
 */

export { useApi } from './useApi'
export { useLocalStorage } from './useLocalStorage'
export { useNotifications } from './useNotifications'
export { useTauri } from './useTauri'
export { useTheme } from './useTheme'
export { useValidation } from './useValidation'

// Re-export commonly used VueUse composables
export {
  useClipboard,
  useEventListener,
  useKeyModifier,
  useMouseInElement,
  useResizeObserver,
  useWindowSize,
  useOnline,
  useIdle,
  useFocus,
  useElementVisibility,
} from '@vueuse/core'
