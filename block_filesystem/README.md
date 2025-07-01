# 块文件系统 (Block File System)

基于思源笔记设计理念的简化版块文件系统实现。

## 架构设计

### 核心概念

1. **块 (Block)**: 文件系统的最小存储单元
   - 每个块有唯一的ID (时间戳-随机字符串格式)
   - 支持不同类型的块：文档、段落、列表、代码等
   - 块之间可以建立引用关系

2. **双重存储**: 
   - JSON文件存储完整内容
   - SQLite数据库存储索引和元数据

3. **引用系统**: 
   - 块级双向链接
   - 自动维护引用关系

### 目录结构

```
block_filesystem/
├── README.md                 # 项目说明
├── requirements.txt          # 依赖包
├── src/
│   ├── __init__.py
│   ├── models/              # 数据模型
│   │   ├── __init__.py
│   │   ├── block.py         # 块数据结构
│   │   └── reference.py     # 引用关系
│   ├── storage/             # 存储引擎
│   │   ├── __init__.py
│   │   ├── file_storage.py  # 文件存储
│   │   └── db_storage.py    # 数据库存储
│   ├── managers/            # 管理器
│   │   ├── __init__.py
│   │   └── block_manager.py # 块管理器
│   └── utils/               # 工具函数
│       ├── __init__.py
│       └── id_generator.py  # ID生成器
├── tests/                   # 测试文件
│   ├── __init__.py
│   └── test_block_system.py
├── examples/                # 使用示例
│   └── basic_usage.py
└── data/                    # 数据存储目录
    ├── blocks/              # 块文件存储
    └── index.db             # SQLite索引数据库
```

### 主要特性

- 块级存储和管理
- 双向引用链接
- 高效的搜索和查询
- 数据一致性保证
- 简单易用的API

### 技术栈

- Python 3.8+
- SQLite (数据库)
- JSON (文件格式)
- UUID (ID生成)

## 快速开始

### TypeScript/JavaScript 使用

```typescript
import { BlockManager, BlockType, ReferenceType, MemoryStorage } from './src/lib/block-system'

// 初始化块管理器
const manager = new BlockManager(new MemoryStorage())

// 创建块
const blockId = await manager.createBlock({
  type: BlockType.DOCUMENT,
  content: '# 我的第一个文档',
  title: '我的第一个文档'
})

// 查询块
const block = await manager.getBlock(blockId)

// 创建引用
const refBlockId = await manager.createBlock({
  type: BlockType.PARAGRAPH,
  content: `参考文档 ${blockId}`,
  parentId: blockId,
  rootId: blockId
})

await manager.addReference(refBlockId, blockId, ReferenceType.LINK)

// 查找引用
const references = await manager.getReferences(blockId)
```

### Vue 组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BlockManager, BlockType, MemoryStorage } from '@/lib/block-system'

const manager = new BlockManager(new MemoryStorage())
const blocks = ref([])

onMounted(async () => {
  // 创建示例数据
  await manager.createBlock({
    type: BlockType.DOCUMENT,
    content: '# 我的笔记',
    title: '我的笔记'
  })

  // 加载所有块
  blocks.value = await manager.queryBlocks()
})
</script>
```

## 在线演示

访问 `/block-system` 路由查看完整的在线演示，包括：
- 创建和管理块
- 搜索和查询功能
- 引用关系管理
- 数据导入导出
