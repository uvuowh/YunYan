import { ref, watch, Ref } from 'vue'

/**
 * Reactive localStorage composable
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
  } = {}
): Ref<T> {
  const {
    serializer = {
      read: (v: string) => {
        try {
          return JSON.parse(v)
        } catch {
          return v as T
        }
      },
      write: (v: T) => JSON.stringify(v),
    },
  } = options

  const storedValue = localStorage.getItem(key)
  const initialValue = storedValue !== null 
    ? serializer.read(storedValue) 
    : defaultValue

  const state = ref<T>(initialValue)

  watch(
    state,
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, serializer.write(newValue))
      }
    },
    { deep: true }
  )

  return state as Ref<T>
}
