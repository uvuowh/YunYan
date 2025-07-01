// 白板交互相关的组合式函数
import {
  animationManager,
  clamp,
  isRectInViewport,
  rafThrottle,
  throttle,
} from '@/utils/performance'
import type { Point, Viewport, WhiteboardCard } from '@shared/types'
import { computed, onMounted, onUnmounted, reactive, ref, type Ref } from 'vue'

export interface UseWhiteboardInteractionOptions {
  canvasRef: Ref<HTMLCanvasElement | undefined>
  containerRef: Ref<HTMLDivElement | undefined>
  viewport: Viewport
  cards: Ref<WhiteboardCard[]>
  onViewportChange?: (viewport: Viewport) => void
  onCardUpdate?: (card: WhiteboardCard) => void
}

export function useWhiteboardInteraction(options: UseWhiteboardInteractionOptions) {
  const { canvasRef, containerRef, viewport, cards, onViewportChange, onCardUpdate } = options

  // 状态
  const isDragging = ref(false)
  const isSpacePressed = ref(false)
  const mousePos = reactive<Point>({ x: 0, y: 0 })
  const lastMousePos = reactive<Point>({ x: 0, y: 0 })
  const canvasSize = reactive({ width: 800, height: 600 })

  // 拖拽状态
  const dragState = ref<{
    type: 'canvas' | 'card'
    cardId?: string
    startPos: Point
    startViewport?: Viewport
    startCardPos?: Point
  } | null>(null)

  // 选择框状态
  const selectionBox = ref<{
    start: Point
    end: Point
    active: boolean
  }>({
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 },
    active: false,
  })

  // 计算属性
  const canvasRect = computed(() => {
    if (!canvasRef.value) return null
    return canvasRef.value.getBoundingClientRect()
  })

  const visibleCards = computed(() => {
    return cards.value.filter(card =>
      isRectInViewport(
        {
          x: card.position.x,
          y: card.position.y,
          width: card.size.width,
          height: card.size.height,
        },
        viewport,
        canvasSize
      )
    )
  })

  // 坐标转换
  const screenToWorld = (screenX: number, screenY: number): Point => {
    return {
      x: (screenX - viewport.x) / viewport.zoom,
      y: (screenY - viewport.y) / viewport.zoom,
    }
  }

  const worldToScreen = (worldX: number, worldY: number): Point => {
    return {
      x: worldX * viewport.zoom + viewport.x,
      y: worldY * viewport.zoom + viewport.y,
    }
  }

  // 更新画布大小
  const updateCanvasSize = () => {
    if (!containerRef.value) return

    const rect = containerRef.value.getBoundingClientRect()
    canvasSize.width = rect.width
    canvasSize.height = rect.height
  }

  // 平滑缩放动画
  const smoothZoom = (targetZoom: number, centerX: number, centerY: number) => {
    const startZoom = viewport.zoom
    const worldPos = screenToWorld(centerX, centerY)

    animationManager.animate('zoom', startZoom, targetZoom, 200, currentZoom => {
      viewport.zoom = currentZoom
      const newScreenPos = worldToScreen(worldPos.x, worldPos.y)
      viewport.x += centerX - newScreenPos.x
      viewport.y += centerY - newScreenPos.y
      onViewportChange?.(viewport)
    })
  }

  // 平滑平移动画
  const smoothPan = (targetX: number, targetY: number) => {
    const startX = viewport.x
    const startY = viewport.y

    animationManager.animate('pan', 0, 1, 300, progress => {
      viewport.x = startX + (targetX - startX) * progress
      viewport.y = startY + (targetY - startY) * progress
      onViewportChange?.(viewport)
    })
  }

  // 事件处理器
  const handleWheel = throttle((event: WheelEvent) => {
    event.preventDefault()

    if (!canvasRect.value) return

    const mouseX = event.clientX - canvasRect.value.left
    const mouseY = event.clientY - canvasRect.value.top

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1
    const newZoom = clamp(viewport.zoom * zoomFactor, 0.1, 10)

    if (event.ctrlKey || event.metaKey) {
      // 平滑缩放
      smoothZoom(newZoom, mouseX, mouseY)
    } else {
      // 即时缩放
      const worldPos = screenToWorld(mouseX, mouseY)
      viewport.zoom = newZoom
      const newScreenPos = worldToScreen(worldPos.x, worldPos.y)

      viewport.x += mouseX - newScreenPos.x
      viewport.y += mouseY - newScreenPos.y
      onViewportChange?.(viewport)
    }
  }, 16)

  const handleMouseDown = (event: MouseEvent) => {
    event.preventDefault()

    if (!canvasRect.value) return

    const x = event.clientX - canvasRect.value.left
    const y = event.clientY - canvasRect.value.top

    mousePos.x = x
    mousePos.y = y
    lastMousePos.x = x
    lastMousePos.y = y

    // 检查是否点击了卡片
    const worldPos = screenToWorld(x, y)
    const clickedCard = cards.value.find(card => {
      return (
        worldPos.x >= card.position.x &&
        worldPos.x <= card.position.x + card.size.width &&
        worldPos.y >= card.position.y &&
        worldPos.y <= card.position.y + card.size.height
      )
    })

    if (clickedCard && !isSpacePressed.value) {
      // 开始拖拽卡片
      dragState.value = {
        type: 'card',
        cardId: clickedCard.id,
        startPos: { x: event.clientX, y: event.clientY },
        startCardPos: { ...clickedCard.position },
      }
    } else if (isSpacePressed.value || event.button === 1) {
      // 开始拖拽画布
      dragState.value = {
        type: 'canvas',
        startPos: { x, y },
        startViewport: { ...viewport },
      }
      isDragging.value = true
    } else {
      // 开始选择框
      selectionBox.value = {
        start: { x, y },
        end: { x, y },
        active: true,
      }
    }
  }

  const handleMouseMove = rafThrottle((event: MouseEvent) => {
    if (!canvasRect.value) return

    const x = event.clientX - canvasRect.value.left
    const y = event.clientY - canvasRect.value.top

    mousePos.x = x
    mousePos.y = y

    if (dragState.value) {
      if (dragState.value.type === 'canvas') {
        // 拖拽画布
        const deltaX = x - dragState.value.startPos.x
        const deltaY = y - dragState.value.startPos.y

        viewport.x = dragState.value.startViewport!.x + deltaX
        viewport.y = dragState.value.startViewport!.y + deltaY
        onViewportChange?.(viewport)
      } else if (dragState.value.type === 'card' && dragState.value.cardId) {
        // 拖拽卡片
        const deltaX = (event.clientX - dragState.value.startPos.x) / viewport.zoom
        const deltaY = (event.clientY - dragState.value.startPos.y) / viewport.zoom

        const card = cards.value.find(c => c.id === dragState.value!.cardId)
        if (card) {
          card.position.x = dragState.value.startCardPos!.x + deltaX
          card.position.y = dragState.value.startCardPos!.y + deltaY
          onCardUpdate?.(card)
        }
      }
    } else if (selectionBox.value.active) {
      // 更新选择框
      selectionBox.value.end = { x, y }
    }

    lastMousePos.x = x
    lastMousePos.y = y
  })

  const handleMouseUp = () => {
    isDragging.value = false
    dragState.value = null
    selectionBox.value.active = false
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault()
      isSpacePressed.value = true
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      isSpacePressed.value = false
    }
  }

  // 重置视图
  const resetView = () => {
    smoothPan(0, 0)
    setTimeout(() => {
      smoothZoom(1, canvasSize.width / 2, canvasSize.height / 2)
    }, 150)
  }

  // 适应所有卡片
  const fitToCards = () => {
    if (cards.value.length === 0) return

    let minX = Infinity,
      minY = Infinity
    let maxX = -Infinity,
      maxY = -Infinity

    cards.value.forEach(card => {
      minX = Math.min(minX, card.position.x)
      minY = Math.min(minY, card.position.y)
      maxX = Math.max(maxX, card.position.x + card.size.width)
      maxY = Math.max(maxY, card.position.y + card.size.height)
    })

    const padding = 50
    const contentWidth = maxX - minX + padding * 2
    const contentHeight = maxY - minY + padding * 2

    const scaleX = canvasSize.width / contentWidth
    const scaleY = canvasSize.height / contentHeight
    const targetZoom = Math.min(scaleX, scaleY, 1)

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    viewport.zoom = targetZoom
    viewport.x = canvasSize.width / 2 - centerX * targetZoom
    viewport.y = canvasSize.height / 2 - centerY * targetZoom

    onViewportChange?.(viewport)
  }

  // 生命周期
  onMounted(() => {
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateCanvasSize)
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    animationManager.stopAll()
  })

  return {
    // 状态
    isDragging,
    isSpacePressed,
    mousePos,
    canvasSize,
    selectionBox,
    visibleCards,

    // 方法
    screenToWorld,
    worldToScreen,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    fitToCards,
    smoothZoom,
    smoothPan,
  }
}
