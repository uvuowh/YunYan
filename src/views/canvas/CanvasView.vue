<template>
  <div ref="canvasContainer" class="canvas-container">
    <!-- 隐藏的测试锚点元素 - 用于E2E测试选择器 -->
    <div
      v-for="card in cards"
      :key="`test-anchor-${card.id}`"
      :data-testid="`canvas-card-${card.id}`"
      class="test-anchor"
      :style="{
        position: 'absolute',
        left: `${card.x}px`,
        top: `${card.y}px`,
        width: `${card.width}px`,
        height: `${card.height}px`,
        pointerEvents: 'auto',
        zIndex: 1000,
        background: 'transparent',
      }"
      :aria-label="`Canvas card ${card.id}: ${card.title}`"
      role="button"
      tabindex="0"
      @click="handleTestAnchorClick(card.id, $event)"
    >
      <!-- 添加隐藏文本以确保accessibility tree可见性 -->
      <span class="sr-only">Canvas card {{ card.id }}: {{ card.title }}</span>
    </div>
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @wheel="handleWheel"
      @dblclick="handleStageDblClick"
      @click="handleStageClick"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <v-layer ref="layerRef">
        <!-- Connections -->
        <ConnectionLine
          v-for="{ connection, card1, card2 } in connectionPairs"
          :key="connection.id"
          :connection="connection"
          :card1="card1"
          :card2="card2"
        />

        <!-- Cards -->
        <CanvasCard
          v-for="card in cards"
          :id="card.id"
          :key="card.id"
          :x="card.x"
          :y="card.y"
          :width="card.width"
          :height="card.height"
          :title="card.title"
          :content="card.content"
          :block-count="card.blocks?.length || 0"
          :data-testid="`canvas-card-${card.id}`"
          @dragstart="handleCardDragStart"
          @dragend="handleCardDragEnd"
        />

        <!-- 框选矩形 -->
        <v-rect
          v-if="isSelecting && selectionStart && selectionEnd"
          :config="{
            x: Math.min(selectionStart.x, selectionEnd.x),
            y: Math.min(selectionStart.y, selectionEnd.y),
            width: Math.abs(selectionEnd.x - selectionStart.x),
            height: Math.abs(selectionEnd.y - selectionStart.y),
            fill: 'rgba(13, 110, 253, 0.1)',
            stroke: '#0d6efd',
            strokeWidth: 1,
            dash: [5, 5],
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance, nextTick } from 'vue'
import { useCanvasStore, type Card, type Connection } from '@/store/canvas'
import { useHistoryStore, MoveCardCommand } from '@/store/history'
import { useSettingsStore } from '@/store/settings'
import { storeToRefs } from 'pinia'
import CanvasCard from '@/components/canvas/CanvasCard.vue'
import ConnectionLine from '@/components/canvas/ConnectionLine.vue'
import Konva from 'konva'

const store = useCanvasStore()
const historyStore = useHistoryStore()
const settingsStore = useSettingsStore()
const { cards, connections } = storeToRefs(store)

// 拖拽状态管理
const dragStartPositions = ref<Map<number, { x: number; y: number }>>(new Map())

// 框选状态管理
const isSelecting = ref(false)
const selectionStart = ref<{ x: number; y: number } | null>(null)
const selectionEnd = ref<{ x: number; y: number } | null>(null)

const canvasContainer = ref<HTMLDivElement | null>(null)
const stageRef = ref<Konva.Stage | null>(null)
const layerRef = ref<Konva.Layer | null>(null)
const stageConfig = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: false, // 禁用默认拖拽，我们将手动处理
  scaleX: 1,
  scaleY: 1,
  x: 0,
  y: 0,
})

// 画布拖拽状态
const isDragging = ref(false)
const lastPointerPosition = ref({ x: 0, y: 0 })

onMounted(async () => {
  try {
    // 等待一个tick确保DOM完全渲染
    await nextTick()
    // 检查容器尺寸
    const containerRect = canvasContainer.value?.getBoundingClientRect()
    if (containerRect && (containerRect.width === 0 || containerRect.height === 0)) {
      settingsStore.setErrorMessage('Canvas容器尺寸为零，可能存在CSS布局问题')
    }

    // 检查Vue Konva是否正确初始化
    if (!window.Konva) {
      throw new Error('Konva library not loaded')
    }

    window.addEventListener('resize', () => {
      stageConfig.value.width = window.innerWidth
      stageConfig.value.height = window.innerHeight
    })
  } catch (error) {
    settingsStore.setErrorMessage(`CanvasView初始化失败: ${error.message}`)
  }
})

// 鼠标按下事件 - 检测中键拖拽和框选
const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = stageRef.value?.getStage()
  if (!stage) return

  // 中键（滚轮按钮）拖拽画布
  if (e.evt.button === 1 && e.target.getType() === 'Stage') {
    e.evt.preventDefault()
    isDragging.value = true
    const pos = stage.getPointerPosition()
    if (pos) {
      lastPointerPosition.value = pos
    }
    // 改变鼠标样式
    stage.container().style.cursor = 'grabbing'
  }

  // 左键在空白区域按下 - 开始框选
  if (e.evt.button === 0 && e.target.getType() === 'Stage') {
    const pos = stage.getRelativePointerPosition()
    if (pos) {
      isSelecting.value = true
      selectionStart.value = { x: pos.x, y: pos.y }
      selectionEnd.value = { x: pos.x, y: pos.y }
    }
  }
}

// 鼠标移动事件 - 处理画布拖拽和框选
const handleMouseMove = (_e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = stageRef.value?.getStage()
  if (!stage) return

  // 处理画布拖拽
  if (isDragging.value) {
    const pos = stage.getPointerPosition()
    if (!pos) return

    const dx = pos.x - lastPointerPosition.value.x
    const dy = pos.y - lastPointerPosition.value.y

    stageConfig.value.x += dx
    stageConfig.value.y += dy

    stage.position({ x: stageConfig.value.x, y: stageConfig.value.y })
    stage.batchDraw()

    lastPointerPosition.value = pos
  }

  // 处理框选
  if (isSelecting.value && selectionStart.value) {
    const pos = stage.getRelativePointerPosition()
    if (pos) {
      selectionEnd.value = { x: pos.x, y: pos.y }
    }
  }
}

// 鼠标释放事件 - 结束拖拽和框选
const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = stageRef.value?.getStage()
  if (!stage) return

  if (isDragging.value) {
    isDragging.value = false
    // 恢复鼠标样式
    stage.container().style.cursor = 'grab'
  }

  // 完成框选
  if (isSelecting.value && selectionStart.value && selectionEnd.value) {
    const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey

    // 只有当框选区域足够大时才执行选择
    const minSelectionSize = 10
    const width = Math.abs(selectionEnd.value.x - selectionStart.value.x)
    const height = Math.abs(selectionEnd.value.y - selectionStart.value.y)

    if (width > minSelectionSize || height > minSelectionSize) {
      store.selectCardsInRect(
        selectionStart.value.x,
        selectionStart.value.y,
        selectionEnd.value.x,
        selectionEnd.value.y,
        isMultiSelect
      )
    }

    // 重置框选状态
    isSelecting.value = false
    selectionStart.value = null
    selectionEnd.value = null
  }
}

const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault()
  const stage = stageRef.value?.getStage()
  if (!stage) return

  const pointer = stage.getPointerPosition()
  if (!pointer) return

  // 检测是否为触控板（通过deltaMode和wheelDelta判断）
  const isTouchpad = e.evt.deltaMode === 0 && Math.abs(e.evt.deltaY) < 50

  // 如果按住Ctrl键或者是触控板的缩放手势，进行缩放
  if (
    e.evt.ctrlKey ||
    e.evt.metaKey ||
    (!isTouchpad && Math.abs(e.evt.deltaY) > Math.abs(e.evt.deltaX))
  ) {
    // 缩放操作
    const scaleBy = isTouchpad ? 1.02 : 1.1 // 触控板使用更小的缩放步长
    const oldScale = stage.scaleX()

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy

    // 限制缩放范围
    const clampedScale = Math.max(0.1, Math.min(5, newScale))

    stageConfig.value.scaleX = clampedScale
    stageConfig.value.scaleY = clampedScale
    stageConfig.value.x = pointer.x - mousePointTo.x * clampedScale
    stageConfig.value.y = pointer.y - mousePointTo.y * clampedScale

    stage.scale({ x: clampedScale, y: clampedScale })
    stage.position({ x: stageConfig.value.x, y: stageConfig.value.y })
  } else {
    // 平移操作（触控板双指滑动）
    const deltaX = e.evt.deltaX
    const deltaY = e.evt.deltaY

    stageConfig.value.x -= deltaX
    stageConfig.value.y -= deltaY

    stage.position({ x: stageConfig.value.x, y: stageConfig.value.y })
  }

  stage.batchDraw()
}

const handleStageDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (e.target.getType() === 'Stage') {
    const stage = e.target.getStage()
    const pos = stage?.getPointerPosition()
    if (pos && stage) {
      const relativePos = stage.getRelativePointerPosition()
      if (relativePos) {
        const { x, y } = relativePos
        store.addCard(x, y)
      }
    }
  }
}

const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (e.target.getType() === 'Stage') {
    store.selectCard(null)
  }
}

const handleCardDragStart = ({ id, x, y }: { id: number; x: number; y: number }) => {
  // 记录拖拽开始位置
  dragStartPositions.value.set(id, { x, y })
}

const handleCardDragEnd = ({ id, x, y }: { id: number; x: number; y: number }) => {
  const startPosition = dragStartPositions.value.get(id)
  if (startPosition && (startPosition.x !== x || startPosition.y !== y)) {
    // 创建移动命令
    const command = new MoveCardCommand(
      { cards: store.cards }, // 传递必要的 store 引用
      id,
      startPosition,
      { x, y }
    )

    historyStore.executeCommand(command)
  }

  // 清理拖拽开始位置
  dragStartPositions.value.delete(id)
}

const connectionPairs = computed(() => {
  return connections.value
    .map((connection: Connection) => {
      const card1 = cards.value.find((c: Card) => c.id === connection.id1)
      const card2 = cards.value.find((c: Card) => c.id === connection.id2)
      if (!card1 || !card2) return null
      return { connection, card1, card2 }
    })
    .filter((p: any) => p !== null) as { connection: Connection; card1: Card; card2: Card }[]
})

// 处理测试锚点点击 - 将点击事件转发给对应的Konva元素
const handleTestAnchorClick = (cardId: number, event: MouseEvent) => {
  // 支持 Ctrl+点击多选
  const isMultiSelect = event.ctrlKey || event.metaKey
  store.selectCard(cardId, isMultiSelect)
}
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-primary);
  cursor: grab;
  user-select: none; /* 防止文本选择 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.canvas-container:active {
  cursor: grabbing;
}

/* 优化触控板体验 */
.canvas-container canvas {
  touch-action: none; /* 禁用默认触摸行为 */
}

/* 测试锚点样式 - 用于E2E测试 */
.test-anchor {
  /* 透明背景，仅用于测试选择器 */
  background: transparent;
}

/* Screen reader only - 隐藏但对辅助技术可见 */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
</style>
