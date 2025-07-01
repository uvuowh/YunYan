// 白板状态管理
import { commands } from '@/tauri'
import type {
    DragState,
    HistoryEntry,
    Point,
    ResizeState,
    SelectionState,
    Size,
    ToolType,
    Viewport,
    Whiteboard,
    WhiteboardCard,
} from '@shared/types'
import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export const useWhiteboardStore = defineStore('whiteboard', () => {
  // 状态
  const currentWhiteboard = ref<Whiteboard | null>(null)
  const whiteboards = ref<Whiteboard[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 视口状态
  const viewport = reactive<Viewport>({
    x: 0,
    y: 0,
    zoom: 1,
  })

  // 选择状态
  const selection = reactive<SelectionState>({
    selectedCards: [],
    selectedConnections: [],
    selectedSections: [],
  })

  // 工具状态
  const currentTool = ref<ToolType>('select')
  const toolOptions = ref<Record<string, any>>({})

  // 拖拽状态
  const dragState = ref<DragState | null>(null)

  // 调整大小状态
  const resizeState = ref<ResizeState | null>(null)

  // 操作历史
  const history = ref<HistoryEntry[]>([])
  const historyIndex = ref(-1)

  // 计算属性
  const hasCurrentWhiteboard = computed(() => currentWhiteboard.value !== null)
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)
  const selectedCardsCount = computed(() => selection.selectedCards.length)
  const hasSelection = computed(() => selectedCardsCount.value > 0)

  // 动作
  async function loadWhiteboards() {
    isLoading.value = true
    error.value = null

    try {
      const response = await commands.listWhiteboards()
      if (response.success && response.data) {
        whiteboards.value = response.data
      } else {
        throw new Error(response.error || '加载白板列表失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to load whiteboards:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createWhiteboard(name: string, description?: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await commands.createWhiteboard({ name, description })
      if (response.success && response.data) {
        const newWhiteboard = response.data
        whiteboards.value.push(newWhiteboard)
        return newWhiteboard
      } else {
        throw new Error(response.error || '创建白板失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to create whiteboard:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadWhiteboard(id: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await commands.getWhiteboard({ id })
      if (response.success && response.data) {
        currentWhiteboard.value = response.data

        // 恢复视口状态
        if (response.data.viewport) {
          viewport.x = response.data.viewport.x
          viewport.y = response.data.viewport.y
          viewport.zoom = response.data.viewport.zoom
        }

        // 清除选择状态
        clearSelection()

        return response.data
      } else {
        throw new Error(response.error || '加载白板失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to load whiteboard:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function saveWhiteboard() {
    if (!currentWhiteboard.value) return

    try {
      const response = await commands.updateWhiteboard({
        id: currentWhiteboard.value.id,
        viewport: { ...viewport },
      })

      if (response.success && response.data) {
        currentWhiteboard.value = response.data
      } else {
        throw new Error(response.error || '保存白板失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to save whiteboard:', err)
    }
  }

  async function deleteWhiteboard(id: string) {
    try {
      const response = await commands.deleteWhiteboard({ id })
      if (response.success) {
        whiteboards.value = whiteboards.value.filter(wb => wb.id !== id)

        if (currentWhiteboard.value?.id === id) {
          currentWhiteboard.value = null
        }
      } else {
        throw new Error(response.error || '删除白板失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to delete whiteboard:', err)
      throw err
    }
  }

  // 卡片操作
  async function createCard(title: string, content: string, position: Point, size: Size) {
    if (!currentWhiteboard.value) return

    try {
      const response = await commands.createCard({
        whiteboard_id: currentWhiteboard.value.id,
        title,
        content,
        position,
        size,
      })

      if (response.success && response.data) {
        currentWhiteboard.value.cards.push(response.data)
        return response.data
      } else {
        throw new Error(response.error || '创建卡片失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to create card:', err)
      throw err
    }
  }

  async function updateCard(cardId: string, updates: Partial<WhiteboardCard>) {
    if (!currentWhiteboard.value) return

    try {
      const response = await commands.updateCard({
        whiteboard_id: currentWhiteboard.value.id,
        card_id: cardId,
        ...updates,
      })

      if (response.success && response.data) {
        const cardIndex = currentWhiteboard.value.cards.findIndex(c => c.id === cardId)
        if (cardIndex !== -1) {
          currentWhiteboard.value.cards[cardIndex] = response.data
        }
        return response.data
      } else {
        throw new Error(response.error || '更新卡片失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to update card:', err)
      throw err
    }
  }

  async function deleteCard(cardId: string) {
    if (!currentWhiteboard.value) return

    try {
      const response = await commands.deleteCard({
        whiteboard_id: currentWhiteboard.value.id,
        card_id: cardId,
      })

      if (response.success) {
        currentWhiteboard.value.cards = currentWhiteboard.value.cards.filter(c => c.id !== cardId)
        selection.selectedCards = selection.selectedCards.filter(id => id !== cardId)
      } else {
        throw new Error(response.error || '删除卡片失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '未知错误'
      console.error('Failed to delete card:', err)
      throw err
    }
  }

  // 选择操作
  function selectCard(cardId: string, multiSelect = false) {
    if (multiSelect) {
      if (selection.selectedCards.includes(cardId)) {
        selection.selectedCards = selection.selectedCards.filter(id => id !== cardId)
      } else {
        selection.selectedCards.push(cardId)
      }
    } else {
      selection.selectedCards = [cardId]
    }
  }

  function clearSelection() {
    selection.selectedCards = []
    selection.selectedConnections = []
    selection.selectedSections = []
    delete (selection as any).selectionBounds
  }

  // 工具操作
  function setTool(tool: ToolType, options: Record<string, any> = {}) {
    currentTool.value = tool
    toolOptions.value = options
  }

  // 视口操作
  function updateViewport(updates: Partial<Viewport>) {
    Object.assign(viewport, updates)
  }

  function resetViewport() {
    viewport.x = 0
    viewport.y = 0
    viewport.zoom = 1
  }

  // 拖拽操作
  function startDrag(dragType: DragState['dragType'], targetIds: string[], startPosition: Point) {
    dragState.value = {
      isDragging: true,
      dragType,
      targetIds,
      startPosition,
      currentPosition: startPosition,
      offset: { x: 0, y: 0 },
    }
  }

  function updateDrag(currentPosition: Point) {
    if (dragState.value) {
      dragState.value.currentPosition = currentPosition
      dragState.value.offset = {
        x: currentPosition.x - dragState.value.startPosition.x,
        y: currentPosition.y - dragState.value.startPosition.y,
      }
    }
  }

  function endDrag() {
    dragState.value = null
  }

  // 调整大小操作
  function startResize(
    targetId: string,
    targetType: ResizeState['targetType'],
    direction: ResizeState['direction'],
    startPosition: Point,
    startSize: Size
  ) {
    resizeState.value = {
      isResizing: true,
      targetId,
      targetType,
      direction,
      startPosition,
      startSize,
    }
  }

  function endResize() {
    resizeState.value = null
  }

  // 历史操作
  function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'userId'>) {
    const historyEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
      userId: 'current-user', // TODO: 从用户状态获取
    }

    // 移除当前位置之后的历史记录
    history.value = history.value.slice(0, historyIndex.value + 1)

    // 添加新的历史记录
    history.value.push(historyEntry)
    historyIndex.value = history.value.length - 1

    // 限制历史记录数量
    const maxHistory = 100
    if (history.value.length > maxHistory) {
      history.value = history.value.slice(-maxHistory)
      historyIndex.value = history.value.length - 1
    }
  }

  function undo() {
    if (canUndo.value) {
      historyIndex.value--
      // TODO: 应用撤销操作
    }
  }

  function redo() {
    if (canRedo.value) {
      historyIndex.value++
      // TODO: 应用重做操作
    }
  }

  return {
    // 状态
    currentWhiteboard,
    whiteboards,
    isLoading,
    error,
    viewport,
    selection,
    currentTool,
    toolOptions,
    dragState,
    resizeState,
    history,
    historyIndex,

    // 计算属性
    hasCurrentWhiteboard,
    canUndo,
    canRedo,
    selectedCardsCount,
    hasSelection,

    // 动作
    loadWhiteboards,
    createWhiteboard,
    loadWhiteboard,
    saveWhiteboard,
    deleteWhiteboard,
    createCard,
    updateCard,
    deleteCard,
    selectCard,
    clearSelection,
    setTool,
    updateViewport,
    resetViewport,
    startDrag,
    updateDrag,
    endDrag,
    startResize,
    endResize,
    addHistoryEntry,
    undo,
    redo,
  }
})
