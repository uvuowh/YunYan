/**
 * 引用模型类
 * 实现块之间的引用关系管理
 */

import { 
  BlockReference, 
  ReferenceType,
  BlockError,
  ErrorCodes
} from '../types'
import { generateReferenceId } from '../utils/id-generator'

export class ReferenceModel implements BlockReference {
  id: string
  sourceId: string
  targetId: string
  type: ReferenceType
  context?: string
  created: number

  constructor(
    sourceId: string,
    targetId: string,
    type: ReferenceType = ReferenceType.LINK,
    context?: string,
    id?: string
  ) {
    this.id = id || generateReferenceId()
    this.sourceId = sourceId
    this.targetId = targetId
    this.type = type
    this.context = context
    this.created = Date.now()
    
    this.validate()
  }

  /**
   * 更新引用上下文
   */
  updateContext(context: string): void {
    this.context = context
  }

  /**
   * 更新引用类型
   */
  updateType(type: ReferenceType): void {
    this.type = type
  }

  /**
   * 检查是否为反向链接
   */
  isBacklink(blockId: string): boolean {
    return this.targetId === blockId
  }

  /**
   * 检查是否为正向链接
   */
  isForwardLink(blockId: string): boolean {
    return this.sourceId === blockId
  }

  /**
   * 获取另一端的块ID
   */
  getOtherBlockId(blockId: string): string | null {
    if (this.sourceId === blockId) {
      return this.targetId
    } else if (this.targetId === blockId) {
      return this.sourceId
    }
    return null
  }

  /**
   * 验证引用数据
   */
  private validate(): void {
    if (!this.id) {
      throw new BlockError('Reference ID is required', ErrorCodes.VALIDATION_ERROR)
    }
    
    if (!this.sourceId) {
      throw new BlockError('Source block ID is required', ErrorCodes.VALIDATION_ERROR)
    }
    
    if (!this.targetId) {
      throw new BlockError('Target block ID is required', ErrorCodes.VALIDATION_ERROR)
    }
    
    if (this.sourceId === this.targetId) {
      throw new BlockError('Self-reference is not allowed', ErrorCodes.VALIDATION_ERROR)
    }
    
    if (!Object.values(ReferenceType).includes(this.type)) {
      throw new BlockError('Invalid reference type', ErrorCodes.VALIDATION_ERROR)
    }
  }

  /**
   * 转换为JSON
   */
  toJSON(): BlockReference {
    return {
      id: this.id,
      sourceId: this.sourceId,
      targetId: this.targetId,
      type: this.type,
      context: this.context,
      created: this.created
    }
  }

  /**
   * 从JSON创建引用实例
   */
  static fromJSON(data: BlockReference): ReferenceModel {
    const reference = Object.create(ReferenceModel.prototype)
    Object.assign(reference, data)
    return reference
  }

  /**
   * 克隆引用
   */
  clone(): ReferenceModel {
    return ReferenceModel.fromJSON(this.toJSON())
  }
}

/**
 * 引用管理器
 * 提供引用关系的高级管理功能
 */
export class ReferenceManager {
  private references: Map<string, ReferenceModel> = new Map()
  private sourceIndex: Map<string, Set<string>> = new Map() // sourceId -> referenceIds
  private targetIndex: Map<string, Set<string>> = new Map() // targetId -> referenceIds

  /**
   * 添加引用
   */
  addReference(reference: ReferenceModel): void {
    this.references.set(reference.id, reference)
    
    // 更新索引
    this.addToIndex(this.sourceIndex, reference.sourceId, reference.id)
    this.addToIndex(this.targetIndex, reference.targetId, reference.id)
  }

  /**
   * 删除引用
   */
  removeReference(referenceId: string): boolean {
    const reference = this.references.get(referenceId)
    if (!reference) {
      return false
    }
    
    this.references.delete(referenceId)
    
    // 更新索引
    this.removeFromIndex(this.sourceIndex, reference.sourceId, referenceId)
    this.removeFromIndex(this.targetIndex, reference.targetId, referenceId)
    
    return true
  }

  /**
   * 获取引用
   */
  getReference(referenceId: string): ReferenceModel | null {
    return this.references.get(referenceId) || null
  }

  /**
   * 获取块的所有引用
   */
  getBlockReferences(blockId: string): ReferenceModel[] {
    const sourceRefs = this.getSourceReferences(blockId)
    const targetRefs = this.getTargetReferences(blockId)
    
    // 合并并去重
    const allRefs = new Map<string, ReferenceModel>()
    sourceRefs.forEach(ref => allRefs.set(ref.id, ref))
    targetRefs.forEach(ref => allRefs.set(ref.id, ref))
    
    return Array.from(allRefs.values())
  }

  /**
   * 获取正向引用（以此块为源的引用）
   */
  getSourceReferences(blockId: string): ReferenceModel[] {
    const referenceIds = this.sourceIndex.get(blockId) || new Set()
    return Array.from(referenceIds)
      .map(id => this.references.get(id))
      .filter(ref => ref !== undefined) as ReferenceModel[]
  }

  /**
   * 获取反向引用（以此块为目标的引用）
   */
  getTargetReferences(blockId: string): ReferenceModel[] {
    const referenceIds = this.targetIndex.get(blockId) || new Set()
    return Array.from(referenceIds)
      .map(id => this.references.get(id))
      .filter(ref => ref !== undefined) as ReferenceModel[]
  }

  /**
   * 获取特定类型的引用
   */
  getReferencesByType(blockId: string, type: ReferenceType): ReferenceModel[] {
    return this.getBlockReferences(blockId).filter(ref => ref.type === type)
  }

  /**
   * 检查两个块之间是否存在引用
   */
  hasReference(sourceId: string, targetId: string): boolean {
    const sourceRefs = this.getSourceReferences(sourceId)
    return sourceRefs.some(ref => ref.targetId === targetId)
  }

  /**
   * 获取引用路径（从源块到目标块的引用链）
   */
  getReferencePath(sourceId: string, targetId: string, maxDepth: number = 5): string[] | null {
    const visited = new Set<string>()
    const queue: Array<{ blockId: string; path: string[] }> = [{ blockId: sourceId, path: [sourceId] }]
    
    while (queue.length > 0) {
      const { blockId, path } = queue.shift()!
      
      if (path.length > maxDepth) {
        continue
      }
      
      if (blockId === targetId) {
        return path
      }
      
      if (visited.has(blockId)) {
        continue
      }
      
      visited.add(blockId)
      
      const sourceRefs = this.getSourceReferences(blockId)
      for (const ref of sourceRefs) {
        queue.push({
          blockId: ref.targetId,
          path: [...path, ref.targetId]
        })
      }
    }
    
    return null
  }

  /**
   * 检查循环引用
   */
  hasCircularReference(sourceId: string, targetId: string): boolean {
    return this.getReferencePath(targetId, sourceId) !== null
  }

  /**
   * 获取引用统计
   */
  getStats(): {
    totalReferences: number
    referencesByType: Record<ReferenceType, number>
    blocksWithReferences: number
  } {
    const referencesByType = Object.values(ReferenceType).reduce((acc, type) => {
      acc[type] = 0
      return acc
    }, {} as Record<ReferenceType, number>)
    
    for (const reference of this.references.values()) {
      referencesByType[reference.type]++
    }
    
    const blocksWithReferences = new Set([
      ...this.sourceIndex.keys(),
      ...this.targetIndex.keys()
    ]).size
    
    return {
      totalReferences: this.references.size,
      referencesByType,
      blocksWithReferences
    }
  }

  /**
   * 清空所有引用
   */
  clear(): void {
    this.references.clear()
    this.sourceIndex.clear()
    this.targetIndex.clear()
  }

  /**
   * 添加到索引
   */
  private addToIndex(index: Map<string, Set<string>>, key: string, value: string): void {
    if (!index.has(key)) {
      index.set(key, new Set())
    }
    index.get(key)!.add(value)
  }

  /**
   * 从索引中移除
   */
  private removeFromIndex(index: Map<string, Set<string>>, key: string, value: string): void {
    const set = index.get(key)
    if (set) {
      set.delete(value)
      if (set.size === 0) {
        index.delete(key)
      }
    }
  }

  /**
   * 导出所有引用
   */
  exportReferences(): BlockReference[] {
    return Array.from(this.references.values()).map(ref => ref.toJSON())
  }

  /**
   * 导入引用
   */
  importReferences(references: BlockReference[]): void {
    this.clear()
    for (const refData of references) {
      const reference = ReferenceModel.fromJSON(refData)
      this.addReference(reference)
    }
  }
}
