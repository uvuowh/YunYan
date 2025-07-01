// 事件类型定义 - 前后端事件通信

/**
 * 系统事件类型
 */
export enum SystemEventType {
  APP_READY = 'app_ready',
  APP_CLOSING = 'app_closing',
  WINDOW_FOCUS = 'window_focus',
  WINDOW_BLUR = 'window_blur',
  FILE_CHANGED = 'file_changed',
  DISK_USAGE_UPDATE = 'disk_usage_update',
  NETWORK_STATUS = 'network_status',
  ERROR_OCCURRED = 'error_occurred',
}

/**
 * 基础事件接口
 */
export interface BaseEvent {
  type: SystemEventType
  timestamp: number
  source: 'frontend' | 'backend'
}

/**
 * 文件变化事件
 */
export interface FileChangeEvent extends BaseEvent {
  type: SystemEventType.FILE_CHANGED
  payload: {
    filePath: string
    changeType: 'created' | 'modified' | 'deleted'
    fileInfo?: {
      size: number
      modifiedAt: number
    }
  }
}

/**
 * 磁盘使用情况事件
 */
export interface DiskUsageEvent extends BaseEvent {
  type: SystemEventType.DISK_USAGE_UPDATE
  payload: {
    total: number
    used: number
    available: number
    percentage: number
  }
}

/**
 * 网络状态事件
 */
export interface NetworkStatusEvent extends BaseEvent {
  type: SystemEventType.NETWORK_STATUS
  payload: {
    online: boolean
    connectionType?: 'wifi' | 'ethernet' | 'cellular' | 'unknown'
  }
}

/**
 * 错误事件
 */
export interface ErrorEvent extends BaseEvent {
  type: SystemEventType.ERROR_OCCURRED
  payload: {
    error: string
    context?: Record<string, unknown>
    severity: 'low' | 'medium' | 'high' | 'critical'
  }
}

/**
 * 所有系统事件的联合类型
 */
export type SystemEvent =
  | FileChangeEvent
  | DiskUsageEvent
  | NetworkStatusEvent
  | ErrorEvent
  | BaseEvent
