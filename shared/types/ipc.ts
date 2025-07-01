// IPC 通信类型定义 - Tauri 命令接口

import type { ApiResponse } from './base'

/**
 * 问候命令
 */
export interface GreetCommand {
  name: string
}

export interface GreetResponse {
  message: string
  timestamp: number
}

/**
 * 文件系统命令
 */
export interface ReadFileCommand {
  path: string
  encoding?: 'utf8' | 'binary'
}

export interface WriteFileCommand {
  path: string
  content: string
  encoding?: 'utf8'
}

export interface ListDirectoryCommand {
  path: string
  recursive?: boolean
}

export interface FileSystemItem {
  name: string
  path: string
  isDirectory: boolean
  size?: number
  modifiedAt?: number
}

/**
 * 应用配置命令
 */
export interface GetConfigCommand {
  key?: string
}

export interface SetConfigCommand {
  key: string
  value: unknown
}

export interface AppConfigData {
  theme: 'light' | 'dark' | 'auto'
  language: string
  autoSave: boolean
  [key: string]: unknown
}

/**
 * 系统信息命令
 */
export interface SystemInfoResponse {
  platform: string
  arch: string
  version: string
  totalMemory: number
  availableMemory: number
  cpuCount: number
}

/**
 * 所有 Tauri 命令的类型映射
 */
export interface TauriCommands {
  // 基础命令
  greet: {
    args: GreetCommand
    returns: ApiResponse<GreetResponse>
  }

  // 文件系统命令
  read_file: {
    args: ReadFileCommand
    returns: ApiResponse<string>
  }

  write_file: {
    args: WriteFileCommand
    returns: ApiResponse<void>
  }

  list_directory: {
    args: ListDirectoryCommand
    returns: ApiResponse<FileSystemItem[]>
  }

  // 配置命令
  get_config: {
    args: GetConfigCommand
    returns: ApiResponse<AppConfigData>
  }

  set_config: {
    args: SetConfigCommand
    returns: ApiResponse<void>
  }

  // 系统信息命令
  get_system_info: {
    args: void
    returns: ApiResponse<SystemInfoResponse>
  }
}

/**
 * 命令名称类型
 */
export type CommandName = keyof TauriCommands

/**
 * 获取命令参数类型
 */
export type CommandArgs<T extends CommandName> = TauriCommands[T]['args']

/**
 * 获取命令返回类型
 */
export type CommandReturns<T extends CommandName> = TauriCommands[T]['returns']
