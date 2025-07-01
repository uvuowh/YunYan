// 白板历史记录和撤销重做功能
import type { Viewport, WhiteboardCard } from '@shared/types'
import { computed, ref } from 'vue'

export interface HistoryEntry {
  id: string
  type: 'create' | 'update' | 'delete' | 'move' | 'viewport'
  timestamp: number
  before: any
  after: any
  description: string
}

export interface UseWhiteboardHistoryOptions {
  maxHistorySize?: number
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void
}

export function useWhiteboardHistory(options: UseWhiteboardHistoryOptions = {}) {
  const { maxHistorySize = 100, onHistoryChange } = options

  // 历史记录栈
  const history = ref<HistoryEntry[]>([])
  const currentIndex = ref(-1)

  // 计算属性
  const canUndo = computed(() => currentIndex.value >= 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  // 添加历史记录
  const addHistoryEntry = (
    type: HistoryEntry['type'],
    before: any,
    after: any,
    description: string
  ) => {
    // 移除当前位置之后的所有记录
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // 创建新的历史记录
    const entry: HistoryEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      before: JSON.parse(JSON.stringify(before)),
      after: JSON.parse(JSON.stringify(after)),
      description
    }

    // 添加到历史记录
    history.value.push(entry)
    currentIndex.value = history.value.length - 1

    // 限制历史记录大小
    if (history.value.length > maxHistorySize) {
      history.value = history.value.slice(-maxHistorySize)
      currentIndex.value = history.value.length - 1
    }

    onHistoryChange?.(canUndo.value, canRedo.value)
  }

  // 撤销
  const undo = (): HistoryEntry | null => {
    if (!canUndo.value) return null

    const entry = history.value[currentIndex.value]
    if (!entry) return null

    currentIndex.value--

    onHistoryChange?.(canUndo.value, canRedo.value)
    return entry
  }

  // 重做
  const redo = (): HistoryEntry | null => {
    if (!canRedo.value) return null

    currentIndex.value++
    const entry = history.value[currentIndex.value]
    if (!entry) return null

    onHistoryChange?.(canUndo.value, canRedo.value)
    return entry
  }

  // 清空历史记录
  const clearHistory = () => {
    history.value = []
    currentIndex.value = -1
    onHistoryChange?.(canUndo.value, canRedo.value)
  }

  // 获取历史记录摘要
  const getHistorySummary = () => {
    return history.value.map((entry, index) => ({
      id: entry.id,
      description: entry.description,
      timestamp: entry.timestamp,
      isCurrent: index === currentIndex.value,
      canRevertTo: index <= currentIndex.value
    }))
  }

  // 跳转到特定历史记录
  const jumpToHistory = (targetIndex: number): HistoryEntry[] => {
    if (targetIndex < -1 || targetIndex >= history.value.length) {
      return []
    }

    const oldIndex = currentIndex.value
    currentIndex.value = targetIndex

    onHistoryChange?.(canUndo.value, canRedo.value)

    // 返回需要应用的变更
    if (targetIndex > oldIndex) {
      // 前进：应用 oldIndex+1 到 targetIndex 的变更
      return history.value.slice(oldIndex + 1, targetIndex + 1)
    } else {
      // 后退：撤销 targetIndex+1 到 oldIndex 的变更
      return history.value.slice(targetIndex + 1, oldIndex + 1).reverse()
    }
  }

  // 便捷方法：记录卡片创建
  const recordCardCreate = (card: WhiteboardCard) => {
    addHistoryEntry(
      'create',
      null,
      card,
      `创建卡片: ${card.title || '无标题'}`
    )
  }

  // 便捷方法：记录卡片更新
  const recordCardUpdate = (before: WhiteboardCard, after: WhiteboardCard) => {
    addHistoryEntry(
      'update',
      before,
      after,
      `更新卡片: ${after.title || '无标题'}`
    )
  }

  // 便捷方法：记录卡片删除
  const recordCardDelete = (card: WhiteboardCard) => {
    addHistoryEntry(
      'delete',
      card,
      null,
      `删除卡片: ${card.title || '无标题'}`
    )
  }

  // 便捷方法：记录卡片移动
  const recordCardMove = (
    cardIds: string[],
    beforePositions: { [id: string]: { x: number; y: number } },
    afterPositions: { [id: string]: { x: number; y: number } }
  ) => {
    const description = cardIds.length === 1
      ? '移动卡片'
      : `移动 ${cardIds.length} 个卡片`

    addHistoryEntry(
      'move',
      beforePositions,
      afterPositions,
      description
    )
  }

  // 便捷方法：记录视口变化
  const recordViewportChange = (before: Viewport, after: Viewport) => {
    addHistoryEntry(
      'viewport',
      before,
      after,
      '视图变化'
    )
  }

  // 批量操作：开始批量记录
  const batchOperations = ref<{
    active: boolean
    entries: Omit<HistoryEntry, 'id' | 'timestamp'>[]
    description: string
  }>({
    active: false,
    entries: [],
    description: ''
  })

  const startBatch = (description: string) => {
    batchOperations.value = {
      active: true,
      entries: [],
      description
    }
  }

  const addToBatch = (
    type: HistoryEntry['type'],
    before: any,
    after: any,
    description: string
  ) => {
    if (!batchOperations.value.active) {
      addHistoryEntry(type, before, after, description)
      return
    }

    batchOperations.value.entries.push({
      type,
      before: JSON.parse(JSON.stringify(before)),
      after: JSON.parse(JSON.stringify(after)),
      description
    })
  }

  const commitBatch = () => {
    if (!batchOperations.value.active || batchOperations.value.entries.length === 0) {
      return
    }

    // 将批量操作作为单个历史记录项
    addHistoryEntry(
      'update', // 批量操作类型
      batchOperations.value.entries.map(e => e.before),
      batchOperations.value.entries.map(e => e.after),
      batchOperations.value.description
    )

    batchOperations.value = {
      active: false,
      entries: [],
      description: ''
    }
  }

  const cancelBatch = () => {
    batchOperations.value = {
      active: false,
      entries: [],
      description: ''
    }
  }

  return {
    // 状态
    history,
    currentIndex,
    canUndo,
    canRedo,
    batchOperations,

    // 基础方法
    addHistoryEntry,
    undo,
    redo,
    clearHistory,
    getHistorySummary,
    jumpToHistory,

    // 便捷方法
    recordCardCreate,
    recordCardUpdate,
    recordCardDelete,
    recordCardMove,
    recordViewportChange,

    // 批量操作
    startBatch,
    addToBatch,
    commitBatch,
    cancelBatch
  }
}
