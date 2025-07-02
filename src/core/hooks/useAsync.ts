import { ref, computed, type Ref } from 'vue'

export interface UseAsyncState<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  isLoading: Ref<boolean>
  isSuccess: Ref<boolean>
  isError: Ref<boolean>
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

/**
 * Composable for handling async operations
 */
export function useAsync<T, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: {
    immediate?: boolean
    initialData?: T
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
): UseAsyncState<T> {
  const { immediate = false, initialData = null, onSuccess, onError } = options

  const data = ref<T | null>(initialData)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const isSuccess = computed(() => !isLoading.value && !error.value && data.value !== null)
  const isError = computed(() => !isLoading.value && error.value !== null)

  const execute = async (...args: Args): Promise<T> => {
    try {
      isLoading.value = true
      error.value = null

      const result = await asyncFunction(...args)
      data.value = result

      onSuccess?.(result)
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      error.value = errorObj
      onError?.(errorObj)
      throw errorObj
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    data.value = initialData
    error.value = null
    isLoading.value = false
  }

  // Execute immediately if requested
  if (immediate) {
    execute()
  }

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    execute,
    reset,
  }
}
