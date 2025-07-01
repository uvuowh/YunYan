/**
 * 块文件系统类型定义
 * 基于思源笔记的块级存储概念
 */

// 块类型枚举
export enum BlockType {
  DOCUMENT = 'document',
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  LIST = 'list',
  LIST_ITEM = 'list_item',
  CODE = 'code',
  QUOTE = 'quote',
  TABLE = 'table',
  IMAGE = 'image',
  LINK = 'link',
  MATH = 'math',
  DIVIDER = 'divider'
}

// 块状态枚举
export enum BlockStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
  ARCHIVED = 'archived'
}

// 块接口定义
export interface Block {
  id: string                    // 块ID (时间戳-随机字符串格式)
  type: BlockType              // 块类型
  content: string              // 块内容
  title?: string               // 块标题 (可选)
  parentId?: string            // 父块ID (可选)
  rootId?: string              // 根文档ID (可选)
  path: string                 // 块路径
  status: BlockStatus          // 块状态
  properties: Record<string, any> // 自定义属性
  metadata: BlockMetadata      // 元数据
  children?: string[]          // 子块ID列表
}

// 块元数据
export interface BlockMetadata {
  created: number              // 创建时间戳
  updated: number              // 更新时间戳
  version: number              // 版本号
  hash: string                 // 内容哈希
  size: number                 // 内容大小
  tags: string[]               // 标签列表
  author?: string              // 作者
}

// 块引用关系
export interface BlockReference {
  id: string                   // 引用ID
  sourceId: string             // 源块ID
  targetId: string             // 目标块ID
  type: ReferenceType          // 引用类型
  context?: string             // 引用上下文
  created: number              // 创建时间
}

// 引用类型枚举
export enum ReferenceType {
  LINK = 'link',               // 普通链接
  EMBED = 'embed',             // 嵌入引用
  MENTION = 'mention',         // 提及
  BACKLINK = 'backlink'        // 反向链接
}

// 查询选项
export interface QueryOptions {
  type?: BlockType             // 按类型过滤
  status?: BlockStatus         // 按状态过滤
  parentId?: string            // 按父块过滤
  rootId?: string              // 按根文档过滤
  tags?: string[]              // 按标签过滤
  content?: string             // 内容搜索
  limit?: number               // 结果限制
  offset?: number              // 偏移量
  sortBy?: 'created' | 'updated' | 'title' // 排序字段
  sortOrder?: 'asc' | 'desc'   // 排序方向
}

// 块创建选项
export interface CreateBlockOptions {
  type: BlockType
  content: string
  title?: string
  parentId?: string
  rootId?: string
  properties?: Record<string, any>
  tags?: string[]
}

// 块更新选项
export interface UpdateBlockOptions {
  content?: string
  title?: string
  properties?: Record<string, any>
  tags?: string[]
  status?: BlockStatus
}

// 存储接口
export interface BlockStorage {
  // 块操作
  saveBlock(block: Block): Promise<void>
  getBlock(id: string): Promise<Block | null>
  deleteBlock(id: string): Promise<void>
  queryBlocks(options: QueryOptions): Promise<Block[]>
  
  // 引用操作
  saveReference(reference: BlockReference): Promise<void>
  getReferences(blockId: string): Promise<BlockReference[]>
  deleteReference(id: string): Promise<void>
  
  // 批量操作
  saveBlocks(blocks: Block[]): Promise<void>
  getBlocksByIds(ids: string[]): Promise<Block[]>
}

// 事件类型
export interface BlockEvent {
  type: 'created' | 'updated' | 'deleted' | 'referenced'
  blockId: string
  data?: any
  timestamp: number
}

// 事件监听器
export type BlockEventListener = (event: BlockEvent) => void

// 错误类型
export class BlockError extends Error {
  constructor(
    message: string,
    public code: string,
    public blockId?: string
  ) {
    super(message)
    this.name = 'BlockError'
  }
}

// 常用错误代码
export const ErrorCodes = {
  BLOCK_NOT_FOUND: 'BLOCK_NOT_FOUND',
  INVALID_BLOCK_TYPE: 'INVALID_BLOCK_TYPE',
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE',
  STORAGE_ERROR: 'STORAGE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const
