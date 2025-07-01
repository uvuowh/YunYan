// 白板选择功能的组合式函数
import type { Point, Rect, WhiteboardCard } from '@shared/types'
import { computed, reactive, ref, type Ref } from 'vue'

export interface UseWhiteboardSelectionOptions {
  cards: Ref<WhiteboardCard[]>
  onSelectionChange?: (selectedIds: string[]) => void
}

export function useWhiteboardSelection(options: UseWhiteboardSelectionOptions) {
  const { cards, onSelectionChange } = options

  // 选中的卡片ID列表
  const selectedCardIds = ref<string[]>([])

  // 选择框状态
  const selectionBox = reactive<{
    start: Point
    end: Point
    active: boolean
  }>({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    active: false
  })

  // 计算属性
  const selectedCards = computed(() =>
    cards.value.filter(card => selectedCardIds.value.includes(card.id))
  )

  const hasSelection = computed(() => selectedCardIds.value.length > 0)

  const selectionBounds = computed((): Rect | null => {
    if (selectedCards.value.length === 0) return null

    let minX = Infinity, minY = Infinity
    let maxX = -Infinity, maxY = -Infinity

    selectedCards.value.forEach(card => {
      minX = Math.min(minX, card.position.x)
      minY = Math.min(minY, card.position.y)
      maxX = Math.max(maxX, card.position.x + card.size.width)
      maxY = Math.max(maxY, card.position.y + card.size.height)
    })

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  })

  const selectionBoxRect = computed((): Rect => {
    const start = selectionBox.start
    const end = selectionBox.end

    return {
      x: Math.min(start.x, end.x),
      y: Math.min(start.y, end.y),
      width: Math.abs(end.x - start.x),
      height: Math.abs(end.y - start.y)
    }
  })

  // 方法
  const selectCard = (cardId: string, multiSelect = false) => {
    if (multiSelect) {
      if (selectedCardIds.value.includes(cardId)) {
        selectedCardIds.value = selectedCardIds.value.filter(id => id !== cardId)
      } else {
        selectedCardIds.value.push(cardId)
      }
    } else {
      selectedCardIds.value = [cardId]
    }
    onSelectionChange?.(selectedCardIds.value)
  }

  const selectCards = (cardIds: string[], multiSelect = false) => {
    if (multiSelect) {
      const newIds = cardIds.filter(id => !selectedCardIds.value.includes(id))
      selectedCardIds.value.push(...newIds)
    } else {
      selectedCardIds.value = [...cardIds]
    }
    onSelectionChange?.(selectedCardIds.value)
  }

  const deselectCard = (cardId: string) => {
    selectedCardIds.value = selectedCardIds.value.filter(id => id !== cardId)
    onSelectionChange?.(selectedCardIds.value)
  }

  const clearSelection = () => {
    selectedCardIds.value = []
    onSelectionChange?.(selectedCardIds.value)
  }

  const selectAll = () => {
    selectedCardIds.value = cards.value.map(card => card.id)
    onSelectionChange?.(selectedCardIds.value)
  }

  const isCardSelected = (cardId: string): boolean => {
    return selectedCardIds.value.includes(cardId)
  }

  // 开始选择框
  const startSelectionBox = (startPoint: Point) => {
    selectionBox.start = { ...startPoint }
    selectionBox.end = { ...startPoint }
    selectionBox.active = true
  }

  // 更新选择框
  const updateSelectionBox = (endPoint: Point) => {
    if (!selectionBox.active) return
    selectionBox.end = { ...endPoint }
  }

  // 结束选择框并选择相交的卡片
  const endSelectionBox = (
    multiSelect = false,
    screenToWorld: (x: number, y: number) => Point
  ) => {
    if (!selectionBox.active) return

    const boxRect = selectionBoxRect.value
    const worldStart = screenToWorld(boxRect.x, boxRect.y)
    const worldEnd = screenToWorld(boxRect.x + boxRect.width, boxRect.y + boxRect.height)

    const worldBox = {
      x: Math.min(worldStart.x, worldEnd.x),
      y: Math.min(worldStart.y, worldEnd.y),
      width: Math.abs(worldEnd.x - worldStart.x),
      height: Math.abs(worldEnd.y - worldStart.y)
    }

    // 找到与选择框相交的卡片
    const intersectingCards = cards.value.filter(card => {
      return !(
        card.position.x + card.size.width < worldBox.x ||
        card.position.y + card.size.height < worldBox.y ||
        card.position.x > worldBox.x + worldBox.width ||
        card.position.y > worldBox.y + worldBox.height
      )
    })

    if (intersectingCards.length > 0) {
      selectCards(intersectingCards.map(card => card.id), multiSelect)
    } else if (!multiSelect) {
      clearSelection()
    }

    selectionBox.active = false
  }

  // 移动选中的卡片
  const moveSelectedCards = (deltaX: number, deltaY: number) => {
    selectedCards.value.forEach(card => {
      card.position.x += deltaX
      card.position.y += deltaY
    })
  }

  // 删除选中的卡片
  const deleteSelectedCards = () => {
    const idsToDelete = [...selectedCardIds.value]
    clearSelection()
    return idsToDelete
  }

  // 复制选中的卡片
  const copySelectedCards = (): WhiteboardCard[] => {
    return selectedCards.value.map(card => ({
      ...card,
      id: `${card.id}_copy_${Date.now()}`,
      position: {
        x: card.position.x + 20,
        y: card.position.y + 20
      }
    }))
  }

  // 对齐功能
  const alignSelectedCards = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedCards.value.length < 2) return

    const bounds = selectionBounds.value
    if (!bounds) return

    selectedCards.value.forEach(card => {
      switch (type) {
        case 'left':
          card.position.x = bounds.x
          break
        case 'center':
          card.position.x = bounds.x + bounds.width / 2 - card.size.width / 2
          break
        case 'right':
          card.position.x = bounds.x + bounds.width - card.size.width
          break
        case 'top':
          card.position.y = bounds.y
          break
        case 'middle':
          card.position.y = bounds.y + bounds.height / 2 - card.size.height / 2
          break
        case 'bottom':
          card.position.y = bounds.y + bounds.height - card.size.height
          break
      }
    })
  }

  // 分布功能
  const distributeSelectedCards = (type: 'horizontal' | 'vertical') => {
    if (selectedCards.value.length < 3) return

    const sortedCards = [...selectedCards.value].sort((a, b) => {
      return type === 'horizontal'
        ? a.position.x - b.position.x
        : a.position.y - b.position.y
    })

    const first = sortedCards[0]
    const last = sortedCards[sortedCards.length - 1]

    if (!first || !last) return

    if (type === 'horizontal') {
      const totalWidth = last.position.x + last.size.width - first.position.x
      const availableSpace = totalWidth - sortedCards.reduce((sum, card) => sum + card.size.width, 0)
      const spacing = availableSpace / (sortedCards.length - 1)

      let currentX = first.position.x + first.size.width
      for (let i = 1; i < sortedCards.length - 1; i++) {
        const card = sortedCards[i]
        if (card) {
          card.position.x = currentX + spacing
          currentX = card.position.x + card.size.width
        }
      }
    } else {
      const totalHeight = last.position.y + last.size.height - first.position.y
      const availableSpace = totalHeight - sortedCards.reduce((sum, card) => sum + card.size.height, 0)
      const spacing = availableSpace / (sortedCards.length - 1)

      let currentY = first.position.y + first.size.height
      for (let i = 1; i < sortedCards.length - 1; i++) {
        const card = sortedCards[i]
        if (card) {
          card.position.y = currentY + spacing
          currentY = card.position.y + card.size.height
        }
      }
    }
  }

  return {
    // 状态
    selectedCardIds,
    selectedCards,
    hasSelection,
    selectionBounds,
    selectionBox,
    selectionBoxRect,

    // 方法
    selectCard,
    selectCards,
    deselectCard,
    clearSelection,
    selectAll,
    isCardSelected,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
    moveSelectedCards,
    deleteSelectedCards,
    copySelectedCards,
    alignSelectedCards,
    distributeSelectedCards
  }
}
