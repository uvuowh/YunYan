/**
 * 块文件系统主入口
 * 导出所有公共API
 */

// 类型定义
export * from './types'

// 核心模型
export { BlockModel } from './models/block'
export { ReferenceModel, ReferenceManager } from './models/reference'

// 存储引擎
export { MemoryStorage } from './storage/memory-storage'
export { LocalStorage } from './storage/local-storage'

// 管理器
export { BlockManager } from './managers/block-manager'

// 工具函数
export * from './utils/id-generator'

// 默认导出块管理器
export { BlockManager as default } from './managers/block-manager'
