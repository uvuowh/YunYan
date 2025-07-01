// Tauri 命令接口 - 类型安全的命令调用
import type {
  ApiResponse,
  AppConfigData,
  FileSystemItem,
  GetConfigCommand,
  GreetCommand,
  GreetResponse,
  ListDirectoryCommand,
  ReadFileCommand,
  SetConfigCommand,
  SystemInfoResponse,
  WriteFileCommand,
} from '@shared/types'
import { invokeCommand, type InvokeOptions } from './core'

/**
 * 问候命令
 */
export const greetCommand = {
  /**
   * 发送问候
   */
  async greet(params: GreetCommand, options?: InvokeOptions): Promise<ApiResponse<GreetResponse>> {
    return invokeCommand('greet', params, options)
  },
}

/**
 * 文件系统命令
 */
export const fileSystemCommands = {
  /**
   * 读取文件内容
   */
  async readFile(params: ReadFileCommand, options?: InvokeOptions): Promise<ApiResponse<string>> {
    return invokeCommand('read_file', params, options)
  },

  /**
   * 写入文件内容
   */
  async writeFile(params: WriteFileCommand, options?: InvokeOptions): Promise<ApiResponse<void>> {
    return invokeCommand('write_file', params, options)
  },

  /**
   * 列出目录内容
   */
  async listDirectory(
    params: ListDirectoryCommand,
    options?: InvokeOptions
  ): Promise<ApiResponse<FileSystemItem[]>> {
    return invokeCommand('list_directory', params, options)
  },
}

/**
 * 配置命令
 */
export const configCommands = {
  /**
   * 获取配置
   */
  async getConfig(
    params: GetConfigCommand = {},
    options?: InvokeOptions
  ): Promise<ApiResponse<AppConfigData>> {
    return invokeCommand('get_config', params, options)
  },

  /**
   * 设置配置
   */
  async setConfig(params: SetConfigCommand, options?: InvokeOptions): Promise<ApiResponse<void>> {
    return invokeCommand('set_config', params, options)
  },
}

/**
 * 系统信息命令
 */
export const systemCommands = {
  /**
   * 获取系统信息
   */
  async getSystemInfo(options?: InvokeOptions): Promise<ApiResponse<SystemInfoResponse>> {
    return invokeCommand('get_system_info', undefined, options)
  },
}

/**
 * 统一的命令接口
 */
export const commands = {
  ...greetCommand,
  ...fileSystemCommands,
  ...configCommands,
  ...systemCommands,
}

/**
 * 命令类型定义，用于类型推断
 */
export type Commands = typeof commands

/**
 * 获取命令名称的类型
 */
export type CommandKey = keyof Commands
