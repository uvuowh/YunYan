/**
 * Global type definitions for the application
 */

// Re-export store types
export type { AppState, Notification } from '@/stores/app'
export type { ThemeState } from '@/stores/theme'
export type { UserState, User, UserPreferences } from '@/stores/user'

// API types
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

// Component types
export interface BaseComponentProps {
  id?: string
  class?: string
  style?: string | Record<string, any>
}

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  group?: string
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  validation?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom'
  value?: any
  message: string
  validator?: (value: any) => boolean
}

export interface FormErrors {
  [key: string]: string | undefined
}

// Navigation types
export interface NavigationItem {
  path: string
  label: string
  icon?: string
  badge?: string | number
  children?: NavigationItem[]
  meta?: {
    requiresAuth?: boolean
    roles?: string[]
    hidden?: boolean
  }
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  formatter?: (value: any, row: T) => string
  component?: any
}

export interface TableData<T = any> {
  rows: T[]
  total: number
  page: number
  pageSize: number
  loading?: boolean
}

// Modal types
export interface ModalOptions {
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
  persistent?: boolean
}

// File types
export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: number
  path?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto'

export interface ThemeConfig {
  mode: ThemeMode
  primaryColor: string
  secondaryColor: string
  accentColor: string
  customColors?: Record<string, string>
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Event types
export interface CustomEvent<T = any> {
  type: string
  data: T
  timestamp: Date
  source?: string
}

// Search types
export interface SearchOptions {
  query: string
  filters?: Record<string, any>
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  pagination?: {
    page: number
    pageSize: number
  }
}

export interface SearchResult<T = any> {
  items: T[]
  total: number
  facets?: Record<string, any>
  suggestions?: string[]
}

// Date/Time types
export interface DateRange {
  start: Date
  end: Date
}

export interface TimeSlot {
  start: string // HH:mm format
  end: string   // HH:mm format
  available: boolean
}

// Configuration types
export interface AppConfig {
  name: string
  version: string
  description: string
  author: string
  homepage: string
  repository: string
  license: string
  features: {
    [key: string]: boolean
  }
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  ui: {
    theme: ThemeConfig
    language: string
    timezone: string
  }
}

// Error types
export interface AppError extends Error {
  code?: string
  context?: Record<string, any>
  timestamp: Date
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Plugin types
export interface Plugin {
  name: string
  version: string
  enabled: boolean
  config?: Record<string, any>
  install?: () => Promise<void>
  uninstall?: () => Promise<void>
}

// Export utility type guards
export function isApiError(error: any): error is ApiError {
  return error && typeof error.message === 'string'
}

export function isAppError(error: any): error is AppError {
  return error instanceof Error && 'severity' in error
}
