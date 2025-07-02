// System types
export interface SystemInfo {
  os: string
  arch: string
  family: string
  hostname: string
}

export interface AppVersion {
  version: string
  build: string
}

// File types
export interface FileInfo {
  name: string
  path: string
  size: number
  is_dir: boolean
  modified?: number
}

export interface DirectoryListing {
  path: string
  files: FileInfo[]
}

// User types
export interface User {
  id: string
  name: string
  email?: string
  preferences: UserPreferences
  created_at: number
  last_login?: number
}

export interface UserPreferences {
  theme: Theme
  language: string
  notifications: NotificationSettings
  app_settings: AppSettings
}

export type Theme = 'light' | 'dark' | 'auto'

export interface NotificationSettings {
  desktop: boolean
  sound: boolean
  frequency: NotificationFrequency
}

export type NotificationFrequency = 'immediate' | 'hourly' | 'daily' | 'never'

export interface AppSettings {
  auto_save_interval: number
  max_recent_files: number
  analytics_enabled: boolean
}

// Error types
export interface AppError {
  type: 'SystemError' | 'FileError' | 'SecurityError' | 'ValidationError' | 'NetworkError' | 'DatabaseError' | 'ConfigError' | 'Unknown'
  message: string
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T
  error?: AppError
  success: boolean
}

// Common utility types
export interface PaginationParams {
  page: number
  limit: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_prev: boolean
}
