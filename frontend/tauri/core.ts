// Tauri 核心封装 - 类型安全的 IPC 通信
import type {
  ApiResponse,
  CommandArgs,
  CommandName,
  CommandReturns,
  ErrorDetail,
} from '@shared/types'
import { ErrorType } from '@shared/types'
import { invoke } from '@tauri-apps/api/core'

/**
 * 调用配置选项
 */
export interface InvokeOptions {
  /** 超时时间（毫秒），默认 10 秒 */
  timeout?: number
  /** 重试次数，默认 0 */
  retries?: number
  /** 重试间隔（毫秒），默认 1 秒 */
  retryDelay?: number
  /** 是否显示加载状态 */
  showLoading?: boolean
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<InvokeOptions> = {
  timeout: 10000,
  retries: 0,
  retryDelay: 1000,
  showLoading: false,
}

/**
 * 创建错误详情
 */
function createErrorDetail(
  type: ErrorType,
  message: string,
  code?: string,
  details?: Record<string, unknown>
): ErrorDetail {
  const result: ErrorDetail = {
    type,
    code: code || type,
    message,
  }
  if (details !== undefined) {
    result.details = details
  }
  return result
}

/**
 * 超时 Promise
 */
function createTimeoutPromise<T>(timeout: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(
        createErrorDetail(ErrorType.TIMEOUT, `Operation timed out after ${timeout}ms`, 'TIMEOUT')
      )
    }, timeout)
  })
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 类型安全的 Tauri 命令调用
 */
export async function safeInvoke<T extends CommandName>(
  command: T,
  args: CommandArgs<T>,
  options: InvokeOptions = {}
): Promise<CommandReturns<T>> {
  const config = { ...DEFAULT_OPTIONS, ...options }

  let lastError: ErrorDetail | null = null

  for (let attempt = 0; attempt <= config.retries; attempt++) {
    try {
      // 如果不是第一次尝试，等待重试间隔
      if (attempt > 0) {
        await delay(config.retryDelay)
      }

      // 创建调用 Promise
      const invokePromise = invoke<CommandReturns<T>>(command, args as any)

      // 创建超时 Promise
      const timeoutPromise = createTimeoutPromise<CommandReturns<T>>(config.timeout)

      // 竞争执行
      const result = await Promise.race([invokePromise, timeoutPromise])

      return result
    } catch (error) {
      console.error(`Command ${command} failed (attempt ${attempt + 1}):`, error)

      // 创建标准化错误
      if (error instanceof Error) {
        lastError = createErrorDetail(ErrorType.INTERNAL, error.message, 'INVOKE_ERROR', {
          command,
          args,
          attempt,
        })
      } else if (typeof error === 'object' && error !== null) {
        lastError = error as ErrorDetail
      } else {
        lastError = createErrorDetail(ErrorType.INTERNAL, String(error), 'UNKNOWN_ERROR', {
          command,
          args,
          attempt,
        })
      }

      // 如果是最后一次尝试，抛出错误
      if (attempt === config.retries) {
        throw lastError
      }
    }
  }

  // 这里不应该到达，但为了类型安全
  throw (
    lastError ||
    createErrorDetail(ErrorType.INTERNAL, 'Unexpected error in safeInvoke', 'UNEXPECTED_ERROR')
  )
}

/**
 * 简化的调用函数，返回 ApiResponse 格式
 */
export async function invokeCommand<T extends CommandName>(
  command: T,
  args: CommandArgs<T>,
  options?: InvokeOptions
): Promise<ApiResponse<any>> {
  try {
    const data = await safeInvoke(command, args, options)
    return {
      success: true,
      data,
      timestamp: Date.now(),
    }
  } catch (error) {
    const errorDetail = error as ErrorDetail
    return {
      success: false,
      error: errorDetail.message,
      timestamp: Date.now(),
    }
  }
}
