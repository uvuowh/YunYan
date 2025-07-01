<template>
  <div class="container mx-auto p-6">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-3xl mb-6">块文件系统演示</h1>
        
        <!-- 操作面板 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <button 
            class="btn btn-primary" 
            @click="createSampleData"
            :disabled="loading"
          >
            创建示例数据
          </button>
          
          <button 
            class="btn btn-secondary" 
            @click="loadBlocks"
            :disabled="loading"
          >
            刷新数据
          </button>
          
          <button 
            class="btn btn-accent" 
            @click="exportData"
            :disabled="loading"
          >
            导出数据
          </button>
          
          <button 
            class="btn btn-warning" 
            @click="clearData"
            :disabled="loading"
          >
            清空数据
          </button>
        </div>

        <!-- 搜索框 -->
        <div class="form-control mb-6">
          <div class="input-group">
            <input 
              type="text" 
              placeholder="搜索块内容..." 
              class="input input-bordered flex-1"
              v-model="searchQuery"
              @input="searchBlocks"
            />
            <button class="btn btn-square" @click="searchBlocks">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats shadow mb-6" v-if="stats">
          <div class="stat">
            <div class="stat-title">总块数</div>
            <div class="stat-value">{{ stats.blockCount }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">引用数</div>
            <div class="stat-value">{{ stats.referenceCount }}</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">总大小</div>
            <div class="stat-value">{{ formatBytes(stats.totalSize) }}</div>
          </div>
        </div>

        <!-- 块列表 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">块列表</h2>
          
          <div v-if="loading" class="flex justify-center">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
          
          <div v-else-if="blocks.length === 0" class="text-center text-gray-500 py-8">
            暂无数据，点击"创建示例数据"开始体验
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="block in blocks" 
              :key="block.id"
              class="card bg-base-200 shadow-sm"
            >
              <div class="card-body p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="badge badge-primary">{{ block.type }}</span>
                      <span v-if="block.title" class="font-semibold">{{ block.title }}</span>
                      <span class="text-xs text-gray-500">{{ block.id }}</span>
                    </div>
                    
                    <p class="text-sm mb-2">{{ block.content }}</p>
                    
                    <div class="flex flex-wrap gap-1 mb-2">
                      <span 
                        v-for="tag in block.metadata.tags" 
                        :key="tag"
                        class="badge badge-outline badge-xs"
                      >
                        {{ tag }}
                      </span>
                    </div>
                    
                    <div class="text-xs text-gray-500">
                      创建: {{ formatDate(block.metadata.created) }} | 
                      更新: {{ formatDate(block.metadata.updated) }} |
                      版本: {{ block.metadata.version }}
                    </div>
                  </div>
                  
                  <div class="dropdown dropdown-end">
                    <label tabindex="0" class="btn btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li><a @click="editBlock(block)">编辑</a></li>
                      <li><a @click="showReferences(block)">查看引用</a></li>
                      <li><a @click="deleteBlock(block.id)" class="text-error">删除</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 引用对话框 -->
    <dialog ref="referencesModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">块引用关系</h3>
        <div class="py-4">
          <div v-if="selectedBlockReferences.length === 0" class="text-gray-500">
            该块暂无引用关系
          </div>
          <div v-else class="space-y-2">
            <div 
              v-for="ref in selectedBlockReferences" 
              :key="ref.id"
              class="p-3 bg-base-200 rounded"
            >
              <div class="flex justify-between items-center">
                <span class="badge badge-secondary">{{ ref.type }}</span>
                <span class="text-xs">{{ formatDate(ref.created) }}</span>
              </div>
              <div class="text-sm mt-1">
                {{ ref.sourceId }} → {{ ref.targetId }}
              </div>
              <div v-if="ref.context" class="text-xs text-gray-600 mt-1">
                {{ ref.context }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-action">
          <button class="btn" @click="closeReferencesModal">关闭</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  BlockManager, 
  BlockType, 
  ReferenceType, 
  MemoryStorage,
  type Block,
  type BlockReference
} from '../lib/block-system'

// 响应式数据
const manager = new BlockManager(new MemoryStorage())
const blocks = ref<Block[]>([])
const loading = ref(false)
const searchQuery = ref('')
const stats = ref<any>(null)
const selectedBlockReferences = ref<BlockReference[]>([])
const referencesModal = ref<HTMLDialogElement>()

// 生命周期
onMounted(() => {
  loadBlocks()
  loadStats()
})

// 方法
async function createSampleData() {
  loading.value = true
  try {
    // 创建文档
    const docId = await manager.createBlock({
      type: BlockType.DOCUMENT,
      content: '# 块文件系统演示文档',
      title: '演示文档'
    })

    // 创建段落
    const paragraphId = await manager.createBlock({
      type: BlockType.PARAGRAPH,
      content: '这是一个演示段落，展示了块文件系统的基本功能。',
      parentId: docId,
      rootId: docId,
      tags: ['演示', '重要']
    })

    // 创建标题
    const headingId = await manager.createBlock({
      type: BlockType.HEADING,
      content: '## 功能特性',
      parentId: docId,
      rootId: docId
    })

    // 创建列表
    const listId = await manager.createBlock({
      type: BlockType.LIST,
      content: '主要特性：',
      parentId: docId,
      rootId: docId
    })

    // 创建列表项
    await manager.createBlock({
      type: BlockType.LIST_ITEM,
      content: '块级存储和管理',
      parentId: listId,
      rootId: docId,
      tags: ['功能']
    })

    await manager.createBlock({
      type: BlockType.LIST_ITEM,
      content: '双向引用链接',
      parentId: listId,
      rootId: docId,
      tags: ['功能']
    })

    // 创建代码块
    const codeId = await manager.createBlock({
      type: BlockType.CODE,
      content: 'const manager = new BlockManager()\nconst blockId = await manager.createBlock({...})',
      parentId: docId,
      rootId: docId,
      tags: ['代码', '示例']
    })

    // 添加引用
    await manager.addReference(
      paragraphId,
      headingId,
      ReferenceType.LINK,
      '参考功能说明'
    )

    await manager.addReference(
      codeId,
      paragraphId,
      ReferenceType.EMBED,
      '代码示例'
    )

    await loadBlocks()
    await loadStats()
  } catch (error) {
    console.error('创建示例数据失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadBlocks() {
  loading.value = true
  try {
    blocks.value = await manager.queryBlocks({
      sortBy: 'created',
      sortOrder: 'desc'
    })
  } catch (error) {
    console.error('加载块失败:', error)
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    stats.value = await manager.getStats()
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

async function searchBlocks() {
  if (!searchQuery.value.trim()) {
    await loadBlocks()
    return
  }

  loading.value = true
  try {
    blocks.value = await manager.searchBlocks(searchQuery.value)
  } catch (error) {
    console.error('搜索失败:', error)
  } finally {
    loading.value = false
  }
}

async function deleteBlock(blockId: string) {
  if (!confirm('确定要删除这个块吗？')) return

  try {
    await manager.deleteBlock(blockId)
    await loadBlocks()
    await loadStats()
  } catch (error) {
    console.error('删除块失败:', error)
  }
}

async function showReferences(block: Block) {
  try {
    selectedBlockReferences.value = await manager.getReferences(block.id)
    referencesModal.value?.showModal()
  } catch (error) {
    console.error('获取引用失败:', error)
  }
}

function closeReferencesModal() {
  referencesModal.value?.close()
}

function editBlock(block: Block) {
  // TODO: 实现编辑功能
  console.log('编辑块:', block)
}

async function exportData() {
  try {
    const data = await manager.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'block-system-data.json'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出数据失败:', error)
  }
}

async function clearData() {
  if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return

  try {
    const storage = manager['storage'] as any
    if (storage.clear) {
      await storage.clear()
      await loadBlocks()
      await loadStats()
    }
  } catch (error) {
    console.error('清空数据失败:', error)
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN')
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
