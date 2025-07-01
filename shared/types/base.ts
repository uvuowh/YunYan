// 基础类型定义 - 前后端共享

/**
 * 统一的 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 操作是否成功 */
  success: boolean
  /** 响应数据 */
  data?: T
  /** 错误信息 */
  error?: string
  /** 响应时间戳 */
  timestamp: number
  /** 请求ID，用于追踪 */
  requestId?: string
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  INTERNAL = 'internal',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
}

/**
 * 详细错误信息
 */
export interface ErrorDetail {
  type: ErrorType
  code: string
  message: string
  details?: Record<string, unknown>
  stack?: string
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 文件信息
 */
export interface FileInfo {
  id: string
  name: string
  path: string
  size: number
  mimeType: string
  createdAt: number
  modifiedAt: number
  checksum?: string
}

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  fontSize: number
  autoSave: boolean
  notifications: boolean
}
