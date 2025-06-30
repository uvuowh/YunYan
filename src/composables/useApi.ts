import { ref, computed } from 'vue'
import { useAppStore } from '@/stores'

export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  errors?: Record<string, string[]>
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

export interface UseApiOptions {
  showSuccessNotification?: boolean
  showErrorNotification?: boolean
  loadingMessage?: string
}

/**
 * Composable for making API requests with loading states and error handling
 */
export function useApi() {
  const appStore = useAppStore()
  const isLoading = ref(false)
  const error = ref<ApiError | null>(null)

  const hasError = computed(() => error.value !== null)

  async function request<T = any>(
    url: string,
    options: RequestInit = {},
    apiOptions: UseApiOptions = {}
  ): Promise<ApiResponse<T> | null> {
    const {
      showSuccessNotification = false,
      showErrorNotification = true,
      loadingMessage,
    } = apiOptions

    try {
      isLoading.value = true
      error.value = null

      if (loadingMessage) {
        appStore.setLoading(true)
      }

      // Default headers
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      // Merge headers
      const headers = {
        ...defaultHeaders,
        ...options.headers,
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        const apiError: ApiError = {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          errors: data.errors,
        }
        
        error.value = apiError

        if (showErrorNotification) {
          appStore.showError('Request Failed', apiError.message)
        }

        return null
      }

      const result: ApiResponse<T> = {
        data: data.data || data,
        success: true,
        message: data.message,
        errors: data.errors,
      }

      if (showSuccessNotification && result.message) {
        appStore.showSuccess('Success', result.message)
      }

      return result
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'Network error occurred',
      }
      
      error.value = apiError

      if (showErrorNotification) {
        appStore.showError('Network Error', apiError.message)
      }

      return null
    } finally {
      isLoading.value = false
      if (loadingMessage) {
        appStore.setLoading(false)
      }
    }
  }

  async function get<T = any>(
    url: string,
    options: UseApiOptions = {}
  ): Promise<ApiResponse<T> | null> {
    return request<T>(url, { method: 'GET' }, options)
  }

  async function post<T = any>(
    url: string,
    data?: any,
    options: UseApiOptions = {}
  ): Promise<ApiResponse<T> | null> {
    return request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
  }

  async function put<T = any>(
    url: string,
    data?: any,
    options: UseApiOptions = {}
  ): Promise<ApiResponse<T> | null> {
    return request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
  }

  async function patch<T = any>(
    url: string,
    data?: any,
    options: UseApiOptions = {}
  ): Promise<ApiResponse<T> | null> {
    return request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
  }

  async function del<T = any>(
    url: string,
    options: UseApiOptions = {}
  ): Promise<ApiResponse<T> | null> {
    return request<T>(url, { method: 'DELETE' }, options)
  }

  function clearError(): void {
    error.value = null
  }

  return {
    isLoading,
    error,
    hasError,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError,
  }
}
