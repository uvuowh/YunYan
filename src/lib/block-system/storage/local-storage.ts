/**
 * 本地存储实现
 * 使用浏览器的 localStorage 和 IndexedDB 进行持久化存储
 */

import { 
  Block, 
  BlockReference, 
  BlockStorage, 
  QueryOptions,
  BlockError,
  ErrorCodes
} from '../types'

// IndexedDB 配置
const DB_NAME = 'BlockFileSystem'
const DB_VERSION = 1
const BLOCKS_STORE = 'blocks'
const REFERENCES_STORE = 'references'

export class LocalStorage implements BlockStorage {
  private db: IDBDatabase | null = null
  private initialized = false

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new BlockError('Failed to open IndexedDB', ErrorCodes.STORAGE_ERROR))
      }

      request.onsuccess = () => {
        this.db = request.result
        this.initialized = true
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // 创建块存储
        if (!db.objectStoreNames.contains(BLOCKS_STORE)) {
          const blockStore = db.createObjectStore(BLOCKS_STORE, { keyPath: 'id' })
          blockStore.createIndex('type', 'type', { unique: false })
          blockStore.createIndex('status', 'status', { unique: false })
          blockStore.createIndex('parentId', 'parentId', { unique: false })
          blockStore.createIndex('rootId', 'rootId', { unique: false })
          blockStore.createIndex('created', 'metadata.created', { unique: false })
          blockStore.createIndex('updated', 'metadata.updated', { unique: false })
        }

        // 创建引用存储
        if (!db.objectStoreNames.contains(REFERENCES_STORE)) {
          const refStore = db.createObjectStore(REFERENCES_STORE, { keyPath: 'id' })
          refStore.createIndex('sourceId', 'sourceId', { unique: false })
          refStore.createIndex('targetId', 'targetId', { unique: false })
          refStore.createIndex('type', 'type', { unique: false })
        }
      }
    })
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
  }

  /**
   * 保存块
   */
  async saveBlock(block: Block): Promise<void> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BLOCKS_STORE], 'readwrite')
      const store = transaction.objectStore(BLOCKS_STORE)
      const request = store.put(block)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new BlockError(
        'Failed to save block', 
        ErrorCodes.STORAGE_ERROR, 
        block.id
      ))
    })
  }

  /**
   * 获取块
   */
  async getBlock(id: string): Promise<Block | null> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BLOCKS_STORE], 'readonly')
      const store = transaction.objectStore(BLOCKS_STORE)
      const request = store.get(id)

      request.onsuccess = () => {
        resolve(request.result || null)
      }
      request.onerror = () => reject(new BlockError(
        'Failed to get block', 
        ErrorCodes.STORAGE_ERROR, 
        id
      ))
    })
  }

  /**
   * 删除块
   */
  async deleteBlock(id: string): Promise<void> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BLOCKS_STORE, REFERENCES_STORE], 'readwrite')
      const blockStore = transaction.objectStore(BLOCKS_STORE)
      const refStore = transaction.objectStore(REFERENCES_STORE)

      // 删除块
      const deleteBlockRequest = blockStore.delete(id)

      // 删除相关引用
      const sourceIndex = refStore.index('sourceId')
      const targetIndex = refStore.index('targetId')

      const deleteSourceRefs = sourceIndex.openCursor(IDBKeyRange.only(id))
      const deleteTargetRefs = targetIndex.openCursor(IDBKeyRange.only(id))

      deleteSourceRefs.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      deleteTargetRefs.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(new BlockError(
        'Failed to delete block', 
        ErrorCodes.STORAGE_ERROR, 
        id
      ))
    })
  }

  /**
   * 查询块
   */
  async queryBlocks(options: QueryOptions): Promise<Block[]> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BLOCKS_STORE], 'readonly')
      const store = transaction.objectStore(BLOCKS_STORE)
      const results: Block[] = []

      let request: IDBRequest

      // 根据查询条件选择合适的索引
      if (options.type) {
        const index = store.index('type')
        request = index.openCursor(IDBKeyRange.only(options.type))
      } else if (options.status) {
        const index = store.index('status')
        request = index.openCursor(IDBKeyRange.only(options.status))
      } else if (options.parentId) {
        const index = store.index('parentId')
        request = index.openCursor(IDBKeyRange.only(options.parentId))
      } else if (options.rootId) {
        const index = store.index('rootId')
        request = index.openCursor(IDBKeyRange.only(options.rootId))
      } else {
        request = store.openCursor()
      }

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          const block: Block = cursor.value
          
          // 应用额外的过滤条件
          if (this.matchesFilters(block, options)) {
            results.push(block)
          }
          
          cursor.continue()
        } else {
          // 排序和分页
          const sortedResults = this.sortAndPaginate(results, options)
          resolve(sortedResults)
        }
      }

      request.onerror = () => reject(new BlockError(
        'Failed to query blocks', 
        ErrorCodes.STORAGE_ERROR
      ))
    })
  }

  /**
   * 检查块是否匹配过滤条件
   */
  private matchesFilters(block: Block, options: QueryOptions): boolean {
    // 标签过滤
    if (options.tags && options.tags.length > 0) {
      const hasMatchingTag = options.tags.some(tag => 
        block.metadata.tags.includes(tag)
      )
      if (!hasMatchingTag) return false
    }

    // 内容搜索
    if (options.content) {
      const searchTerm = options.content.toLowerCase()
      const contentMatch = block.content.toLowerCase().includes(searchTerm)
      const titleMatch = block.title && block.title.toLowerCase().includes(searchTerm)
      if (!contentMatch && !titleMatch) return false
    }

    return true
  }

  /**
   * 排序和分页
   */
  private sortAndPaginate(blocks: Block[], options: QueryOptions): Block[] {
    let results = [...blocks]

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

    return results
  }

  /**
   * 保存引用
   */
  async saveReference(reference: BlockReference): Promise<void> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([REFERENCES_STORE], 'readwrite')
      const store = transaction.objectStore(REFERENCES_STORE)
      const request = store.put(reference)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new BlockError(
        'Failed to save reference', 
        ErrorCodes.STORAGE_ERROR, 
        reference.id
      ))
    })
  }

  /**
   * 获取块的引用
   */
  async getReferences(blockId: string): Promise<BlockReference[]> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([REFERENCES_STORE], 'readonly')
      const store = transaction.objectStore(REFERENCES_STORE)
      const sourceIndex = store.index('sourceId')
      const targetIndex = store.index('targetId')
      const results: BlockReference[] = []

      let completed = 0
      const checkComplete = () => {
        completed++
        if (completed === 2) {
          resolve(results)
        }
      }

      // 查找以此块为源的引用
      const sourceRequest = sourceIndex.openCursor(IDBKeyRange.only(blockId))
      sourceRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          checkComplete()
        }
      }

      // 查找以此块为目标的引用
      const targetRequest = targetIndex.openCursor(IDBKeyRange.only(blockId))
      targetRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          checkComplete()
        }
      }

      sourceRequest.onerror = targetRequest.onerror = () => {
        reject(new BlockError(
          'Failed to get references', 
          ErrorCodes.STORAGE_ERROR, 
          blockId
        ))
      }
    })
  }

  /**
   * 删除引用
   */
  async deleteReference(id: string): Promise<void> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([REFERENCES_STORE], 'readwrite')
      const store = transaction.objectStore(REFERENCES_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new BlockError(
        'Failed to delete reference', 
        ErrorCodes.STORAGE_ERROR, 
        id
      ))
    })
  }

  /**
   * 批量保存块
   */
  async saveBlocks(blocks: Block[]): Promise<void> {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([BLOCKS_STORE], 'readwrite')
      const store = transaction.objectStore(BLOCKS_STORE)
      
      let completed = 0
      const total = blocks.length
      
      if (total === 0) {
        resolve()
        return
      }

      blocks.forEach(block => {
        const request = store.put(block)
        request.onsuccess = () => {
          completed++
          if (completed === total) {
            resolve()
          }
        }
        request.onerror = () => {
          reject(new BlockError(
            'Failed to save blocks', 
            ErrorCodes.STORAGE_ERROR
          ))
        }
      })
    })
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
}
