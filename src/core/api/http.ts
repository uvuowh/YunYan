import type { ApiResponse } from './tauri/types'

/**
 * HTTP client configuration
 */
interface HttpConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

/**
 * HTTP request options
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

/**
 * HTTP client class for external API calls
 */
class HttpClient {
  private config: HttpConfig

  constructor(config: HttpConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    }
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`
    const controller = new AbortController()
    const timeout = options.timeout || this.config.timeout

    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        data,
        success: true,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return {
        error: {
          type: 'NetworkError',
          message: errorMessage,
        },
        success: false,
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HttpConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// Default HTTP client instance
export const httpClient = new HttpClient()

// Export class for custom instances
export { HttpClient }
export type { HttpConfig, RequestOptions }
