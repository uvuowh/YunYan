/**
 * 块文件系统基本使用示例
 */

import { 
  BlockManager, 
  BlockType, 
  ReferenceType, 
  MemoryStorage,
  LocalStorage
} from '../index'

/**
 * 基本使用示例
 */
export async function basicUsageExample() {
  console.log('=== 块文件系统基本使用示例 ===')
  
  // 1. 创建块管理器（使用内存存储）
  const manager = new BlockManager(new MemoryStorage())
  
  // 2. 创建根文档
  const docId = await manager.createBlock({
    type: BlockType.DOCUMENT,
    content: '# 我的第一个文档',
    title: '我的第一个文档'
  })
  console.log('创建文档:', docId)
  
  // 3. 创建段落块
  const paragraphId = await manager.createBlock({
    type: BlockType.PARAGRAPH,
    content: '这是文档的第一个段落，包含一些重要信息。',
    parentId: docId,
    rootId: docId
  })
  console.log('创建段落:', paragraphId)
  
  // 4. 创建列表块
  const listId = await manager.createBlock({
    type: BlockType.LIST,
    content: '重要事项清单',
    parentId: docId,
    rootId: docId
  })
  console.log('创建列表:', listId)
  
  // 5. 创建列表项
  const item1Id = await manager.createBlock({
    type: BlockType.LIST_ITEM,
    content: '完成项目文档',
    parentId: listId,
    rootId: docId,
    tags: ['工作', '重要']
  })
  
  const item2Id = await manager.createBlock({
    type: BlockType.LIST_ITEM,
    content: '准备会议材料',
    parentId: listId,
    rootId: docId,
    tags: ['工作']
  })
  
  console.log('创建列表项:', item1Id, item2Id)
  
  // 6. 创建引用
  const refId = await manager.addReference(
    paragraphId, 
    item1Id, 
    ReferenceType.LINK,
    '参考相关任务'
  )
  console.log('创建引用:', refId)
  
  // 7. 查询操作
  console.log('\n=== 查询操作 ===')
  
  // 查询所有段落块
  const paragraphs = await manager.queryBlocks({ type: BlockType.PARAGRAPH })
  console.log('段落块数量:', paragraphs.length)
  
  // 查询带特定标签的块
  const workBlocks = await manager.queryBlocks({ tags: ['工作'] })
  console.log('工作相关块数量:', workBlocks.length)
  
  // 搜索内容
  const searchResults = await manager.searchBlocks('文档')
  console.log('搜索"文档"结果数量:', searchResults.length)
  
  // 8. 引用查询
  console.log('\n=== 引用查询 ===')
  
  const references = await manager.getReferences(paragraphId)
  console.log('段落块的引用数量:', references.length)
  
  const backlinks = await manager.getBacklinks(item1Id)
  console.log('任务项的反向链接数量:', backlinks.length)
  
  // 9. 更新操作
  console.log('\n=== 更新操作 ===')
  
  await manager.updateBlock(paragraphId, {
    content: '这是文档的第一个段落，包含一些重要信息。（已更新）',
    tags: ['更新']
  })
  console.log('段落块已更新')
  
  // 10. 获取文档结构
  console.log('\n=== 文档结构 ===')
  
  const documentBlocks = await manager.getDocumentBlocks(docId)
  console.log('文档总块数:', documentBlocks.length)
  
  const children = await manager.getChildren(docId)
  console.log('根文档子块数:', children.length)
  
  return {
    docId,
    paragraphId,
    listId,
    item1Id,
    item2Id,
    refId,
    manager
  }
}

/**
 * 高级功能示例
 */
export async function advancedUsageExample() {
  console.log('\n=== 高级功能示例 ===')
  
  const manager = new BlockManager(new MemoryStorage())
  
  // 1. 批量创建块
  const blockIds = await manager.batchCreate([
    {
      type: BlockType.DOCUMENT,
      content: '# 项目计划',
      title: '项目计划'
    },
    {
      type: BlockType.HEADING,
      content: '## 第一阶段',
      title: '第一阶段'
    },
    {
      type: BlockType.PARAGRAPH,
      content: '需求分析和设计'
    }
  ])
  
  console.log('批量创建块:', blockIds.length)
  
  // 2. 事件监听
  manager.addEventListener('created', (event) => {
    console.log('块创建事件:', event.blockId)
  })
  
  manager.addEventListener('updated', (event) => {
    console.log('块更新事件:', event.blockId)
  })
  
  // 3. 复杂查询
  const complexQuery = await manager.queryBlocks({
    type: BlockType.PARAGRAPH,
    sortBy: 'created',
    sortOrder: 'desc',
    limit: 5
  })
  
  console.log('复杂查询结果:', complexQuery.length)
  
  // 4. 数据导出
  const stats = await manager.getStats()
  console.log('存储统计:', stats)
  
  return manager
}

/**
 * 持久化存储示例
 */
export async function persistentStorageExample() {
  console.log('\n=== 持久化存储示例 ===')
  
  // 使用 IndexedDB 存储
  const storage = new LocalStorage()
  await storage.initialize()
  
  const manager = new BlockManager(storage)
  
  // 创建一些数据
  const docId = await manager.createBlock({
    type: BlockType.DOCUMENT,
    content: '# 持久化文档',
    title: '持久化文档'
  })
  
  const paragraphId = await manager.createBlock({
    type: BlockType.PARAGRAPH,
    content: '这个文档将被保存到 IndexedDB 中',
    parentId: docId,
    rootId: docId
  })
  
  console.log('数据已保存到 IndexedDB')
  console.log('文档ID:', docId)
  console.log('段落ID:', paragraphId)
  
  // 验证数据持久化
  const retrievedDoc = await manager.getBlock(docId)
  console.log('从存储中检索到文档:', retrievedDoc?.title)
  
  return manager
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  try {
    await basicUsageExample()
    await advancedUsageExample()
    await persistentStorageExample()
    
    console.log('\n=== 所有示例运行完成 ===')
  } catch (error) {
    console.error('示例运行出错:', error)
  }
}

// 如果直接运行此文件，执行示例
if (typeof window !== 'undefined') {
  // 浏览器环境
  (window as any).runBlockSystemExamples = runAllExamples
  console.log('块文件系统示例已加载，运行 runBlockSystemExamples() 来执行示例')
}
