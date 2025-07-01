/**
 * 块管理器
 * 提供块的CRUD操作、查询、引用管理等核心功能
 */

import { 
  Block, 
  BlockReference, 
  BlockStorage, 
  QueryOptions,
  CreateBlockOptions,
  UpdateBlockOptions,
  ReferenceType,
  BlockEvent,
  BlockEventListener,
  BlockError,
  ErrorCodes
} from '../types'
import { BlockModel } from '../models/block'
import { generateReferenceId } from '../utils/id-generator'
import { MemoryStorage } from '../storage/memory-storage'

export class BlockManager {
  private storage: BlockStorage
  private eventListeners: Map<string, Set<BlockEventListener>> = new Map()

  constructor(storage?: BlockStorage) {
    this.storage = storage || new MemoryStorage()
  }

  /**
   * 创建新块
   */
  async createBlock(options: CreateBlockOptions): Promise<string> {
    try {
      const block = new BlockModel(options)
      await block.initializeHash()
      
      // 如果有父块，更新父块的子块列表
      if (options.parentId) {
        const parentBlock = await this.getBlock(options.parentId)
        if (parentBlock) {
          const parentModel = BlockModel.fromJSON(parentBlock)
          parentModel.addChild(block.id)
          await this.storage.saveBlock(parentModel.toJSON())
        }
      }
      
      await this.storage.saveBlock(block.toJSON())
      
      // 触发创建事件
      this.emitEvent({
        type: 'created',
        blockId: block.id,
        data: block.toJSON(),
        timestamp: Date.now()
      })
      
      return block.id
    } catch (error) {
      throw new BlockError(
        `Failed to create block: ${error.message}`,
        ErrorCodes.STORAGE_ERROR
      )
    }
  }

  /**
   * 获取块
   */
  async getBlock(id: string): Promise<Block | null> {
    try {
      return await this.storage.getBlock(id)
    } catch (error) {
      throw new BlockError(
        `Failed to get block: ${error.message}`,
        ErrorCodes.STORAGE_ERROR,
        id
      )
    }
  }

  /**
   * 更新块
   */
  async updateBlock(id: string, options: UpdateBlockOptions): Promise<void> {
    try {
      const existingBlock = await this.storage.getBlock(id)
      if (!existingBlock) {
        throw new BlockError('Block not found', ErrorCodes.BLOCK_NOT_FOUND, id)
      }
      
      const blockModel = BlockModel.fromJSON(existingBlock)
      await blockModel.update(options)
      
      await this.storage.saveBlock(blockModel.toJSON())
      
      // 触发更新事件
      this.emitEvent({
        type: 'updated',
        blockId: id,
        data: blockModel.toJSON(),
        timestamp: Date.now()
      })
    } catch (error) {
      if (error instanceof BlockError) {
        throw error
      }
      throw new BlockError(
        `Failed to update block: ${error.message}`,
        ErrorCodes.STORAGE_ERROR,
        id
      )
    }
  }

  /**
   * 删除块
   */
  async deleteBlock(id: string): Promise<void> {
    try {
      const block = await this.storage.getBlock(id)
      if (!block) {
        throw new BlockError('Block not found', ErrorCodes.BLOCK_NOT_FOUND, id)
      }
      
      // 删除子块
      if (block.children && block.children.length > 0) {
        for (const childId of block.children) {
          await this.deleteBlock(childId)
        }
      }
      
      // 从父块中移除
      if (block.parentId) {
        const parentBlock = await this.storage.getBlock(block.parentId)
        if (parentBlock) {
          const parentModel = BlockModel.fromJSON(parentBlock)
          parentModel.removeChild(id)
          await this.storage.saveBlock(parentModel.toJSON())
        }
      }
      
      await this.storage.deleteBlock(id)
      
      // 触发删除事件
      this.emitEvent({
        type: 'deleted',
        blockId: id,
        data: block,
        timestamp: Date.now()
      })
    } catch (error) {
      if (error instanceof BlockError) {
        throw error
      }
      throw new BlockError(
        `Failed to delete block: ${error.message}`,
        ErrorCodes.STORAGE_ERROR,
        id
      )
    }
  }

  /**
   * 查询块
   */
  async queryBlocks(options: QueryOptions = {}): Promise<Block[]> {
    try {
      return await this.storage.queryBlocks(options)
    } catch (error) {
      throw new BlockError(
        `Failed to query blocks: ${error.message}`,
        ErrorCodes.STORAGE_ERROR
      )
    }
  }

  /**
   * 搜索块
   */
  async searchBlocks(query: string, options: Partial<QueryOptions> = {}): Promise<Block[]> {
    return this.queryBlocks({
      ...options,
      content: query
    })
  }

  /**
   * 获取块的子块
   */
  async getChildren(parentId: string): Promise<Block[]> {
    return this.queryBlocks({ parentId })
  }

  /**
   * 获取根文档的所有块
   */
  async getDocumentBlocks(rootId: string): Promise<Block[]> {
    return this.queryBlocks({ rootId })
  }

  /**
   * 添加引用
   */
  async addReference(
    sourceId: string, 
    targetId: string, 
    type: ReferenceType = ReferenceType.LINK,
    context?: string
  ): Promise<string> {
    try {
      // 检查源块和目标块是否存在
      const sourceBlock = await this.storage.getBlock(sourceId)
      const targetBlock = await this.storage.getBlock(targetId)
      
      if (!sourceBlock) {
        throw new BlockError('Source block not found', ErrorCodes.BLOCK_NOT_FOUND, sourceId)
      }
      
      if (!targetBlock) {
        throw new BlockError('Target block not found', ErrorCodes.BLOCK_NOT_FOUND, targetId)
      }
      
      // 检查循环引用
      if (await this.hasCircularReference(sourceId, targetId)) {
        throw new BlockError(
          'Circular reference detected',
          ErrorCodes.CIRCULAR_REFERENCE,
          sourceId
        )
      }
      
      const reference: BlockReference = {
        id: generateReferenceId(),
        sourceId,
        targetId,
        type,
        context,
        created: Date.now()
      }
      
      await this.storage.saveReference(reference)
      
      // 触发引用事件
      this.emitEvent({
        type: 'referenced',
        blockId: sourceId,
        data: { reference, targetId },
        timestamp: Date.now()
      })
      
      return reference.id
    } catch (error) {
      if (error instanceof BlockError) {
        throw error
      }
      throw new BlockError(
        `Failed to add reference: ${error.message}`,
        ErrorCodes.STORAGE_ERROR
      )
    }
  }

  /**
   * 获取块的引用
   */
  async getReferences(blockId: string): Promise<BlockReference[]> {
    try {
      return await this.storage.getReferences(blockId)
    } catch (error) {
      throw new BlockError(
        `Failed to get references: ${error.message}`,
        ErrorCodes.STORAGE_ERROR,
        blockId
      )
    }
  }

  /**
   * 获取反向链接
   */
  async getBacklinks(blockId: string): Promise<BlockReference[]> {
    const references = await this.getReferences(blockId)
    return references.filter(ref => ref.targetId === blockId)
  }

  /**
   * 获取正向链接
   */
  async getForwardLinks(blockId: string): Promise<BlockReference[]> {
    const references = await this.getReferences(blockId)
    return references.filter(ref => ref.sourceId === blockId)
  }

  /**
   * 删除引用
   */
  async deleteReference(referenceId: string): Promise<void> {
    try {
      await this.storage.deleteReference(referenceId)
    } catch (error) {
      throw new BlockError(
        `Failed to delete reference: ${error.message}`,
        ErrorCodes.STORAGE_ERROR,
        referenceId
      )
    }
  }

  /**
   * 检查循环引用
   */
  private async hasCircularReference(sourceId: string, targetId: string): Promise<boolean> {
    const visited = new Set<string>()
    const stack = [targetId]
    
    while (stack.length > 0) {
      const currentId = stack.pop()!
      
      if (currentId === sourceId) {
        return true
      }
      
      if (visited.has(currentId)) {
        continue
      }
      
      visited.add(currentId)
      
      const references = await this.getForwardLinks(currentId)
      for (const ref of references) {
        stack.push(ref.targetId)
      }
    }
    
    return false
  }

  /**
   * 批量操作
   */
  async batchCreate(blocks: CreateBlockOptions[]): Promise<string[]> {
    const ids: string[] = []
    for (const options of blocks) {
      const id = await this.createBlock(options)
      ids.push(id)
    }
    return ids
  }

  async batchUpdate(updates: Array<{ id: string; options: UpdateBlockOptions }>): Promise<void> {
    for (const { id, options } of updates) {
      await this.updateBlock(id, options)
    }
  }

  async batchDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.deleteBlock(id)
    }
  }

  /**
   * 事件系统
   */
  addEventListener(eventType: string, listener: BlockEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }
    this.eventListeners.get(eventType)!.add(listener)
  }

  removeEventListener(eventType: string, listener: BlockEventListener): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType)
      }
    }
  }

  private emitEvent(event: BlockEvent): void {
    const listeners = this.eventListeners.get(event.type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          console.error('Error in event listener:', error)
        }
      })
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStats(): Promise<any> {
    if ('getStats' in this.storage) {
      return (this.storage as any).getStats()
    }
    return null
  }

  /**
   * 导出数据
   */
  async exportData(): Promise<any> {
    if ('exportData' in this.storage) {
      return (this.storage as any).exportData()
    }
    throw new Error('Export not supported by current storage')
  }

  /**
   * 导入数据
   */
  async importData(data: any): Promise<void> {
    if ('importData' in this.storage) {
      return (this.storage as any).importData(data)
    }
    throw new Error('Import not supported by current storage')
  }
}
