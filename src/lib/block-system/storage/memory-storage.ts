/**
 * 内存存储实现
 * 用于开发和测试，数据存储在内存中
 */

import { 
  Block, 
  BlockReference, 
  BlockStorage, 
  QueryOptions,
  BlockError,
  ErrorCodes
} from '../types'

export class MemoryStorage implements BlockStorage {
  private blocks: Map<string, Block> = new Map()
  private references: Map<string, BlockReference> = new Map()
  private blockReferences: Map<string, Set<string>> = new Map() // blockId -> referenceIds

  /**
   * 保存块
   */
  async saveBlock(block: Block): Promise<void> {
    this.blocks.set(block.id, { ...block })
  }

  /**
   * 获取块
   */
  async getBlock(id: string): Promise<Block | null> {
    const block = this.blocks.get(id)
    return block ? { ...block } : null
  }

  /**
   * 删除块
   */
  async deleteBlock(id: string): Promise<void> {
    // 删除块
    this.blocks.delete(id)
    
    // 删除相关的引用
    const referenceIds = this.blockReferences.get(id)
    if (referenceIds) {
      for (const refId of referenceIds) {
        this.references.delete(refId)
      }
      this.blockReferences.delete(id)
    }
    
    // 从其他块的引用中移除
    for (const [refId, reference] of this.references) {
      if (reference.sourceId === id || reference.targetId === id) {
        this.references.delete(refId)
      }
    }
  }

  /**
   * 查询块
   */
  async queryBlocks(options: QueryOptions): Promise<Block[]> {
    let results = Array.from(this.blocks.values())

    // 按类型过滤
    if (options.type) {
      results = results.filter(block => block.type === options.type)
    }

    // 按状态过滤
    if (options.status) {
      results = results.filter(block => block.status === options.status)
    }

    // 按父块过滤
    if (options.parentId) {
      results = results.filter(block => block.parentId === options.parentId)
    }

    // 按根文档过滤
    if (options.rootId) {
      results = results.filter(block => block.rootId === options.rootId)
    }

    // 按标签过滤
    if (options.tags && options.tags.length > 0) {
      results = results.filter(block => 
        options.tags!.some(tag => block.metadata.tags.includes(tag))
      )
    }

    // 内容搜索
    if (options.content) {
      const searchTerm = options.content.toLowerCase()
      results = results.filter(block => 
        block.content.toLowerCase().includes(searchTerm) ||
        (block.title && block.title.toLowerCase().includes(searchTerm))
      )
    }

    // 排序
    if (options.sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any
        
        switch (options.sortBy) {
          case 'created':
            aValue = a.metadata.created
            bValue = b.metadata.created
            break
          case 'updated':
            aValue = a.metadata.updated
            bValue = b.metadata.updated
            break
          case 'title':
            aValue = a.title || ''
            bValue = b.title || ''
            break
          default:
            return 0
        }
        
        if (options.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
        }
      })
    }

    // 分页
    const offset = options.offset || 0
    const limit = options.limit
    
    if (limit) {
      results = results.slice(offset, offset + limit)
    } else if (offset > 0) {
      results = results.slice(offset)
    }

    return results.map(block => ({ ...block }))
  }

  /**
   * 保存引用
   */
  async saveReference(reference: BlockReference): Promise<void> {
    this.references.set(reference.id, { ...reference })
    
    // 更新块引用索引
    if (!this.blockReferences.has(reference.sourceId)) {
      this.blockReferences.set(reference.sourceId, new Set())
    }
    this.blockReferences.get(reference.sourceId)!.add(reference.id)
    
    if (!this.blockReferences.has(reference.targetId)) {
      this.blockReferences.set(reference.targetId, new Set())
    }
    this.blockReferences.get(reference.targetId)!.add(reference.id)
  }

  /**
   * 获取块的引用
   */
  async getReferences(blockId: string): Promise<BlockReference[]> {
    const referenceIds = this.blockReferences.get(blockId)
    if (!referenceIds) {
      return []
    }
    
    const references: BlockReference[] = []
    for (const refId of referenceIds) {
      const reference = this.references.get(refId)
      if (reference) {
        references.push({ ...reference })
      }
    }
    
    return references
  }

  /**
   * 删除引用
   */
  async deleteReference(id: string): Promise<void> {
    const reference = this.references.get(id)
    if (!reference) {
      return
    }
    
    this.references.delete(id)
    
    // 从块引用索引中移除
    const sourceRefs = this.blockReferences.get(reference.sourceId)
    if (sourceRefs) {
      sourceRefs.delete(id)
      if (sourceRefs.size === 0) {
        this.blockReferences.delete(reference.sourceId)
      }
    }
    
    const targetRefs = this.blockReferences.get(reference.targetId)
    if (targetRefs) {
      targetRefs.delete(id)
      if (targetRefs.size === 0) {
        this.blockReferences.delete(reference.targetId)
      }
    }
  }

  /**
   * 批量保存块
   */
  async saveBlocks(blocks: Block[]): Promise<void> {
    for (const block of blocks) {
      await this.saveBlock(block)
    }
  }

  /**
   * 批量获取块
   */
  async getBlocksByIds(ids: string[]): Promise<Block[]> {
    const blocks: Block[] = []
    for (const id of ids) {
      const block = await this.getBlock(id)
      if (block) {
        blocks.push(block)
      }
    }
    return blocks
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    this.blocks.clear()
    this.references.clear()
    this.blockReferences.clear()
  }

  /**
   * 获取统计信息
   */
  async getStats(): Promise<{
    blockCount: number
    referenceCount: number
    totalSize: number
  }> {
    const blockCount = this.blocks.size
    const referenceCount = this.references.size
    const totalSize = Array.from(this.blocks.values())
      .reduce((sum, block) => sum + block.metadata.size, 0)
    
    return { blockCount, referenceCount, totalSize }
  }

  /**
   * 导出所有数据
   */
  async exportData(): Promise<{
    blocks: Block[]
    references: BlockReference[]
  }> {
    return {
      blocks: Array.from(this.blocks.values()),
      references: Array.from(this.references.values())
    }
  }

  /**
   * 导入数据
   */
  async importData(data: {
    blocks: Block[]
    references: BlockReference[]
  }): Promise<void> {
    await this.clear()
    
    for (const block of data.blocks) {
      await this.saveBlock(block)
    }
    
    for (const reference of data.references) {
      await this.saveReference(reference)
    }
  }
}
