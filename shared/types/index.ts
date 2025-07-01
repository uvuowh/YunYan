// 类型定义统一导出

// 基础类型
export * from './base'

// 事件类型
export * from './events'

// IPC 通信类型
export * from './ipc'

// 白板类型
export * from './whiteboard'

// 类型工具函数
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 常用联合类型
export type Theme = 'light' | 'dark' | 'auto'
export type Language = 'zh-CN' | 'en-US' | 'ja-JP'
export type SortOrder = 'asc' | 'desc'
