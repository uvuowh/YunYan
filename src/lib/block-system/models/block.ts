/**
 * 块模型类
 * 实现块的核心逻辑和验证
 */

import { 
  Block, 
  BlockType, 
  BlockStatus, 
  BlockMetadata, 
  CreateBlockOptions,
  UpdateBlockOptions,
  BlockError,
  ErrorCodes
} from '../types'
import { generateBlockId, generateContentHash } from '../utils/id-generator'

export class BlockModel implements Block {
  id: string
  type: BlockType
  content: string
  title?: string
  parentId?: string
  rootId?: string
  path: string
  status: BlockStatus
  properties: Record<string, any>
  metadata: BlockMetadata
  children?: string[]

  constructor(options: CreateBlockOptions, id?: string) {
    this.id = id || generateBlockId()
    this.type = options.type
    this.content = options.content
    this.title = options.title
    this.parentId = options.parentId
    this.rootId = options.rootId || this.id // 如果没有指定根ID，则自己就是根
    this.path = this.generatePath()
    this.status = BlockStatus.ACTIVE
    this.properties = options.properties || {}
    this.children = []
    
    // 初始化元数据
    const now = Date.now()
    this.metadata = {
      created: now,
      updated: now,
      version: 1,
      hash: '', // 将在异步方法中设置
      size: this.content.length,
      tags: options.tags || [],
      author: undefined
    }
    
    this.validate()
  }

  /**
   * 异步初始化哈希值
   */
  async initializeHash(): Promise<void> {
    this.metadata.hash = await generateContentHash(this.content)
  }

  /**
   * 更新块内容
   */
  async update(options: UpdateBlockOptions): Promise<void> {
    const oldContent = this.content
    
    if (options.content !== undefined) {
      this.content = options.content
      this.metadata.size = this.content.length
    }
    
    if (options.title !== undefined) {
      this.title = options.title
    }
    
    if (options.properties !== undefined) {
      this.properties = { ...this.properties, ...options.properties }
    }
    
    if (options.tags !== undefined) {
      this.metadata.tags = options.tags
    }
    
    if (options.status !== undefined) {
      this.status = options.status
    }
    
    // 如果内容发生变化，更新哈希和版本
    if (oldContent !== this.content) {
      this.metadata.hash = await generateContentHash(this.content)
      this.metadata.version += 1
    }
    
    this.metadata.updated = Date.now()
    this.validate()
  }

  /**
   * 添加子块
   */
  addChild(childId: string): void {
    if (!this.children) {
      this.children = []
    }
    
    if (!this.children.includes(childId)) {
      this.children.push(childId)
      this.metadata.updated = Date.now()
    }
  }

  /**
   * 移除子块
   */
  removeChild(childId: string): void {
    if (this.children) {
      const index = this.children.indexOf(childId)
      if (index > -1) {
        this.children.splice(index, 1)
        this.metadata.updated = Date.now()
      }
    }
  }

  /**
   * 设置父块
   */
  setParent(parentId: string): void {
    this.parentId = parentId
    this.path = this.generatePath()
    this.metadata.updated = Date.now()
  }

  /**
   * 添加标签
   */
  addTag(tag: string): void {
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag)
      this.metadata.updated = Date.now()
    }
  }

  /**
   * 移除标签
   */
  removeTag(tag: string): void {
    const index = this.metadata.tags.indexOf(tag)
    if (index > -1) {
      this.metadata.tags.splice(index, 1)
      this.metadata.updated = Date.now()
    }
  }

  /**
   * 设置属性
   */
  setProperty(key: string, value: any): void {
    this.properties[key] = value
    this.metadata.updated = Date.now()
  }

  /**
   * 获取属性
   */
  getProperty(key: string): any {
    return this.properties[key]
  }

  /**
   * 删除属性
   */
  deleteProperty(key: string): void {
    delete this.properties[key]
    this.metadata.updated = Date.now()
  }

  /**
   * 标记为删除
   */
  markAsDeleted(): void {
    this.status = BlockStatus.DELETED
    this.metadata.updated = Date.now()
  }

  /**
   * 标记为归档
   */
  markAsArchived(): void {
    this.status = BlockStatus.ARCHIVED
    this.metadata.updated = Date.now()
  }

  /**
   * 恢复激活状态
   */
  restore(): void {
    this.status = BlockStatus.ACTIVE
    this.metadata.updated = Date.now()
  }

  /**
   * 生成块路径
   */
  private generatePath(): string {
    if (!this.parentId) {
      return `/${this.id}`
    }
    // 简化版路径，实际应该递归获取完整路径
    return `/${this.parentId}/${this.id}`
  }

  /**
   * 验证块数据
   */
  private validate(): void {
    if (!this.id) {
      throw new BlockError('Block ID is required', ErrorCodes.VALIDATION_ERROR)
    }
    
    if (!Object.values(BlockType).includes(this.type)) {
      throw new BlockError('Invalid block type', ErrorCodes.INVALID_BLOCK_TYPE, this.id)
    }
    
    if (this.content === undefined || this.content === null) {
      throw new BlockError('Block content is required', ErrorCodes.VALIDATION_ERROR, this.id)
    }
    
    if (!Object.values(BlockStatus).includes(this.status)) {
      throw new BlockError('Invalid block status', ErrorCodes.VALIDATION_ERROR, this.id)
    }
  }

  /**
   * 转换为JSON
   */
  toJSON(): Block {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      title: this.title,
      parentId: this.parentId,
      rootId: this.rootId,
      path: this.path,
      status: this.status,
      properties: this.properties,
      metadata: this.metadata,
      children: this.children
    }
  }

  /**
   * 从JSON创建块实例
   */
  static fromJSON(data: Block): BlockModel {
    const block = Object.create(BlockModel.prototype)
    Object.assign(block, data)
    return block
  }

  /**
   * 克隆块
   */
  clone(): BlockModel {
    const cloned = BlockModel.fromJSON(this.toJSON())
    cloned.id = generateBlockId() // 生成新的ID
    cloned.metadata.created = Date.now()
    cloned.metadata.updated = Date.now()
    cloned.metadata.version = 1
    return cloned
  }
}
