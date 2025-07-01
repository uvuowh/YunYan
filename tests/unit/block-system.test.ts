/**
 * 块文件系统单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { 
  BlockManager, 
  BlockType, 
  BlockStatus,
  ReferenceType, 
  MemoryStorage,
  BlockModel,
  ReferenceModel,
  generateBlockId,
  isValidBlockId,
  extractTimestampFromId
} from '../../src/lib/block-system'

describe('块文件系统', () => {
  let manager: BlockManager

  beforeEach(() => {
    manager = new BlockManager(new MemoryStorage())
  })

  describe('ID生成器', () => {
    it('应该生成有效的块ID', () => {
      const id = generateBlockId()
      expect(isValidBlockId(id)).toBe(true)
      expect(id).toMatch(/^\d{14}-[a-zA-Z0-9]{11}$/)
    })

    it('应该从ID中提取时间戳', () => {
      const id = generateBlockId()
      const timestamp = extractTimestampFromId(id)
      const now = Date.now()
      
      // 时间戳应该在合理范围内（1分钟内）
      expect(Math.abs(timestamp - now)).toBeLessThan(60000)
    })
  })

  describe('块模型', () => {
    it('应该创建有效的块', async () => {
      const block = new BlockModel({
        type: BlockType.PARAGRAPH,
        content: '测试内容',
        title: '测试标题'
      })
      
      await block.initializeHash()
      
      expect(block.id).toBeDefined()
      expect(block.type).toBe(BlockType.PARAGRAPH)
      expect(block.content).toBe('测试内容')
      expect(block.title).toBe('测试标题')
      expect(block.status).toBe(BlockStatus.ACTIVE)
      expect(block.metadata.hash).toBeDefined()
    })

    it('应该更新块内容', async () => {
      const block = new BlockModel({
        type: BlockType.PARAGRAPH,
        content: '原始内容'
      })
      
      await block.initializeHash()
      const originalHash = block.metadata.hash
      const originalVersion = block.metadata.version
      
      await block.update({
        content: '更新内容',
        tags: ['测试']
      })
      
      expect(block.content).toBe('更新内容')
      expect(block.metadata.tags).toContain('测试')
      expect(block.metadata.hash).not.toBe(originalHash)
      expect(block.metadata.version).toBe(originalVersion + 1)
    })

    it('应该管理子块', () => {
      const parent = new BlockModel({
        type: BlockType.DOCUMENT,
        content: '父文档'
      })
      
      const childId = generateBlockId()
      
      parent.addChild(childId)
      expect(parent.children).toContain(childId)
      
      parent.removeChild(childId)
      expect(parent.children).not.toContain(childId)
    })
  })

  describe('引用模型', () => {
    it('应该创建有效的引用', () => {
      const sourceId = generateBlockId()
      const targetId = generateBlockId()
      
      const reference = new ReferenceModel(
        sourceId,
        targetId,
        ReferenceType.LINK,
        '测试引用'
      )
      
      expect(reference.id).toBeDefined()
      expect(reference.sourceId).toBe(sourceId)
      expect(reference.targetId).toBe(targetId)
      expect(reference.type).toBe(ReferenceType.LINK)
      expect(reference.context).toBe('测试引用')
    })

    it('应该检测引用方向', () => {
      const sourceId = generateBlockId()
      const targetId = generateBlockId()
      
      const reference = new ReferenceModel(sourceId, targetId)
      
      expect(reference.isForwardLink(sourceId)).toBe(true)
      expect(reference.isBacklink(targetId)).toBe(true)
      expect(reference.isForwardLink(targetId)).toBe(false)
      expect(reference.isBacklink(sourceId)).toBe(false)
    })
  })

  describe('块管理器', () => {
    it('应该创建块', async () => {
      const blockId = await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '测试段落',
        title: '测试'
      })
      
      expect(blockId).toBeDefined()
      expect(isValidBlockId(blockId)).toBe(true)
      
      const block = await manager.getBlock(blockId)
      expect(block).toBeDefined()
      expect(block!.content).toBe('测试段落')
    })

    it('应该更新块', async () => {
      const blockId = await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '原始内容'
      })
      
      await manager.updateBlock(blockId, {
        content: '更新内容',
        tags: ['更新']
      })
      
      const block = await manager.getBlock(blockId)
      expect(block!.content).toBe('更新内容')
      expect(block!.metadata.tags).toContain('更新')
    })

    it('应该删除块', async () => {
      const blockId = await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '待删除内容'
      })
      
      await manager.deleteBlock(blockId)
      
      const block = await manager.getBlock(blockId)
      expect(block).toBeNull()
    })

    it('应该查询块', async () => {
      // 创建测试数据
      await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '段落1',
        tags: ['测试']
      })
      
      await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '段落2',
        tags: ['测试']
      })
      
      await manager.createBlock({
        type: BlockType.HEADING,
        content: '标题1'
      })
      
      // 按类型查询
      const paragraphs = await manager.queryBlocks({ type: BlockType.PARAGRAPH })
      expect(paragraphs.length).toBe(2)
      
      // 按标签查询
      const testBlocks = await manager.queryBlocks({ tags: ['测试'] })
      expect(testBlocks.length).toBe(2)
      
      // 内容搜索
      const searchResults = await manager.searchBlocks('段落')
      expect(searchResults.length).toBe(2)
    })

    it('应该管理引用', async () => {
      const sourceId = await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '源块'
      })
      
      const targetId = await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '目标块'
      })
      
      // 添加引用
      const refId = await manager.addReference(
        sourceId,
        targetId,
        ReferenceType.LINK,
        '测试引用'
      )
      
      expect(refId).toBeDefined()
      
      // 获取引用
      const references = await manager.getReferences(sourceId)
      expect(references.length).toBe(1)
      expect(references[0].targetId).toBe(targetId)
      
      // 获取反向链接
      const backlinks = await manager.getBacklinks(targetId)
      expect(backlinks.length).toBe(1)
      expect(backlinks[0].sourceId).toBe(sourceId)
      
      // 删除引用
      await manager.deleteReference(refId)
      const referencesAfterDelete = await manager.getReferences(sourceId)
      expect(referencesAfterDelete.length).toBe(0)
    })

    it('应该处理父子关系', async () => {
      const parentId = await manager.createBlock({
        type: BlockType.DOCUMENT,
        content: '父文档'
      })
      
      const childId = await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '子段落',
        parentId,
        rootId: parentId
      })
      
      // 检查父块的子块列表
      const parent = await manager.getBlock(parentId)
      expect(parent!.children).toContain(childId)
      
      // 查询子块
      const children = await manager.getChildren(parentId)
      expect(children.length).toBe(1)
      expect(children[0].id).toBe(childId)
      
      // 删除子块时应该从父块中移除
      await manager.deleteBlock(childId)
      const parentAfterDelete = await manager.getBlock(parentId)
      expect(parentAfterDelete!.children).not.toContain(childId)
    })

    it('应该批量操作', async () => {
      // 批量创建
      const ids = await manager.batchCreate([
        { type: BlockType.PARAGRAPH, content: '段落1' },
        { type: BlockType.PARAGRAPH, content: '段落2' },
        { type: BlockType.PARAGRAPH, content: '段落3' }
      ])
      
      expect(ids.length).toBe(3)
      
      // 批量更新
      await manager.batchUpdate([
        { id: ids[0], options: { tags: ['批量'] } },
        { id: ids[1], options: { tags: ['批量'] } }
      ])
      
      const updatedBlocks = await manager.queryBlocks({ tags: ['批量'] })
      expect(updatedBlocks.length).toBe(2)
      
      // 批量删除
      await manager.batchDelete(ids)
      
      for (const id of ids) {
        const block = await manager.getBlock(id)
        expect(block).toBeNull()
      }
    })
  })

  describe('事件系统', () => {
    it('应该触发事件', async () => {
      const events: string[] = []
      
      manager.addEventListener('created', (event) => {
        events.push(`created:${event.blockId}`)
      })
      
      manager.addEventListener('updated', (event) => {
        events.push(`updated:${event.blockId}`)
      })
      
      manager.addEventListener('deleted', (event) => {
        events.push(`deleted:${event.blockId}`)
      })
      
      const blockId = await manager.createBlock({
        type: BlockType.PARAGRAPH,
        content: '测试'
      })
      
      await manager.updateBlock(blockId, { content: '更新' })
      await manager.deleteBlock(blockId)
      
      expect(events).toContain(`created:${blockId}`)
      expect(events).toContain(`updated:${blockId}`)
      expect(events).toContain(`deleted:${blockId}`)
    })
  })
})
