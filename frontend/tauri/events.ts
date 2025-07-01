// Tauri 事件处理 - 类型安全的事件监听
import type {
  DiskUsageEvent,
  ErrorEvent,
  FileChangeEvent,
  NetworkStatusEvent,
  SystemEvent,
} from '@shared/types'
import { SystemEventType } from '@shared/types'
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event'

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (event: T) => void | Promise<void>

/**
 * 事件监听器管理器
 */
class EventManager {
  private listeners = new Map<string, UnlistenFn[]>()

  /**
   * 监听系统事件
   */
  async listenSystemEvent<T extends SystemEvent>(
    eventType: T['type'],
    listener: EventListener<T>
  ): Promise<UnlistenFn> {
    const unlisten = await listen<T>('system-event', event => {
      if (event.payload.type === eventType) {
        listener(event.payload)
      }
    })

    // 记录监听器以便统一管理
    const key = `system-event:${eventType}`
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(unlisten)

    return unlisten
  }

  /**
   * 监听文件变化事件
   */
  async onFileChange(listener: EventListener<FileChangeEvent>): Promise<UnlistenFn> {
    return this.listenSystemEvent(SystemEventType.FILE_CHANGED, listener)
  }

  /**
   * 监听磁盘使用情况事件
   */
  async onDiskUsageUpdate(listener: EventListener<DiskUsageEvent>): Promise<UnlistenFn> {
    return this.listenSystemEvent(SystemEventType.DISK_USAGE_UPDATE, listener)
  }

  /**
   * 监听网络状态事件
   */
  async onNetworkStatus(listener: EventListener<NetworkStatusEvent>): Promise<UnlistenFn> {
    return this.listenSystemEvent(SystemEventType.NETWORK_STATUS, listener)
  }

  /**
   * 监听错误事件
   */
  async onError(listener: EventListener<ErrorEvent>): Promise<UnlistenFn> {
    return this.listenSystemEvent(SystemEventType.ERROR_OCCURRED, listener)
  }

  /**
   * 监听自定义事件
   */
  async listenCustomEvent<T = any>(
    eventName: string,
    listener: EventListener<T>
  ): Promise<UnlistenFn> {
    const unlisten = await listen<T>(eventName, event => {
      listener(event.payload)
    })

    // 记录监听器
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName)!.push(unlisten)

    return unlisten
  }

  /**
   * 发送事件到后端
   */
  async emitEvent<T = any>(eventName: string, payload: T): Promise<void> {
    try {
      await emit(eventName, payload)
    } catch (error) {
      console.error(`Failed to emit event ${eventName}:`, error)
      throw error
    }
  }

  /**
   * 移除指定事件的所有监听器
   */
  async removeEventListeners(eventName: string): Promise<void> {
    const listeners = this.listeners.get(eventName)
    if (listeners) {
      for (const unlisten of listeners) {
        unlisten()
      }
      this.listeners.delete(eventName)
    }
  }

  /**
   * 移除所有事件监听器
   */
  async removeAllListeners(): Promise<void> {
    for (const [eventName] of this.listeners) {
      await this.removeEventListeners(eventName)
    }
  }

  /**
   * 获取当前监听器数量
   */
  getListenerCount(): number {
    let count = 0
    for (const listeners of this.listeners.values()) {
      count += listeners.length
    }
    return count
  }

  /**
   * 获取事件监听器统计
   */
  getListenerStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const [eventName, listeners] of this.listeners) {
      stats[eventName] = listeners.length
    }
    return stats
  }
}

/**
 * 全局事件管理器实例
 */
export const eventManager = new EventManager()

/**
 * 便捷的事件监听函数
 */
export const events = {
  // 系统事件
  onFileChange: eventManager.onFileChange.bind(eventManager),
  onDiskUsageUpdate: eventManager.onDiskUsageUpdate.bind(eventManager),
  onNetworkStatus: eventManager.onNetworkStatus.bind(eventManager),
  onError: eventManager.onError.bind(eventManager),

  // 自定义事件
  listen: eventManager.listenCustomEvent.bind(eventManager),
  emit: eventManager.emitEvent.bind(eventManager),

  // 管理功能
  removeListeners: eventManager.removeEventListeners.bind(eventManager),
  removeAllListeners: eventManager.removeAllListeners.bind(eventManager),
  getStats: eventManager.getListenerStats.bind(eventManager),
}
