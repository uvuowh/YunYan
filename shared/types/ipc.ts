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

// 白板相关命令类型
export interface CreateWhiteboardCommand {
  name: string
  description?: string
}

export interface GetWhiteboardCommand {
  id: string
}

export interface UpdateWhiteboardCommand {
  id: string
  name?: string
  description?: string
  viewport?: {
    x: number
    y: number
    zoom: number
  }
  settings?: Record<string, any>
}

export interface DeleteWhiteboardCommand {
  id: string
}

export interface CreateCardCommand {
  whiteboard_id: string
  title: string
  content: string
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
}

export interface UpdateCardCommand {
  whiteboard_id: string
  card_id: string
  title?: string
  content?: string
  position?: {
    x: number
    y: number
  }
  size?: {
    width: number
    height: number
  }
  style?: Record<string, any>
}

export interface DeleteCardCommand {
  whiteboard_id: string
  card_id: string
}

// 白板响应类型
export interface WhiteboardResponse {
  id: string
  name: string
  description: string
  viewport: {
    x: number
    y: number
    zoom: number
  }
  cards: WhiteboardCardResponse[]
  connections: any[]
  sections: any[]
  settings: Record<string, any>
  metadata: Record<string, any>
  createdAt: number
  updatedAt: number
}

export interface WhiteboardCardResponse {
  id: string
  title: string
  content: string
  position: {
    x: number
    y: number
  }
  size: {
    width: number
    height: number
  }
  style: Record<string, any>
  metadata: Record<string, any>
  createdAt: number
  updatedAt: number
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

  // 白板命令
  create_whiteboard: {
    args: CreateWhiteboardCommand
    returns: ApiResponse<WhiteboardResponse>
  }

  get_whiteboard: {
    args: GetWhiteboardCommand
    returns: ApiResponse<WhiteboardResponse>
  }

  list_whiteboards: {
    args: void
    returns: ApiResponse<WhiteboardResponse[]>
  }

  update_whiteboard: {
    args: UpdateWhiteboardCommand
    returns: ApiResponse<WhiteboardResponse>
  }

  delete_whiteboard: {
    args: DeleteWhiteboardCommand
    returns: ApiResponse<void>
  }

  create_card: {
    args: CreateCardCommand
    returns: ApiResponse<WhiteboardCardResponse>
  }

  update_card: {
    args: UpdateCardCommand
    returns: ApiResponse<WhiteboardCardResponse>
  }

  delete_card: {
    args: DeleteCardCommand
    returns: ApiResponse<void>
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
