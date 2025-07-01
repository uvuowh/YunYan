<template>
  <div class="whiteboard-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      class="whiteboard-canvas"
      :width="canvasSize.width"
      :height="canvasSize.height"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @click="handleCanvasClick"
    />

    <!-- 卡片层 -->
    <div class="cards-layer" :style="cardsLayerStyle">
      <WhiteboardCard
        v-for="card in cards"
        :key="card.id"
        :card="cardWithScreenPosition(card)"
        :is-selected="selectedCards.includes(card.id)"
        :zoom="1"
        @update:card="handleCardUpdate"
        @select="handleCardSelect"
        @delete="handleCardDelete"
        @drag-start="handleCardDragStart"
        @resize-start="handleCardResizeStart"
      />
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="tool-group">
        <button
          v-for="tool in tools"
          :key="tool.id"
          :class="['tool-btn', { active: currentTool === tool.id }]"
          @click="setTool(tool.id)"
          :title="tool.tooltip"
        >
          <span class="tool-icon">{{ tool.icon }}</span>
          <span class="tool-label">{{ tool.name }}</span>
        </button>
      </div>

      <div class="tool-group">
        <button
          class="tool-btn"
          @click="resetView"
          title="重置视图 (R)"
        >
          <span class="tool-icon">⌂</span>
        </button>
      </div>
    </div>

    <!-- 调试信息 -->
    <div v-if="showDebug" class="debug-info">
      <div>Zoom: {{ viewport.zoom.toFixed(2) }}</div>
      <div>Pan: ({{ viewport.x.toFixed(0) }}, {{ viewport.y.toFixed(0) }})</div>
      <div>Mouse: ({{ mousePos.x.toFixed(0) }}, {{ mousePos.y.toFixed(0) }})</div>
      <div>Tool: {{ currentTool }}</div>
      <div>Cards: {{ cards.length }}</div>
      <div>Selected: {{ selectedCards.length }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WhiteboardCard as Card, Point, Viewport } from '@shared/types'
import { computed, onMounted, onUnmounted, reactive, ref, toRefs } from 'vue'
import WhiteboardCard from './WhiteboardCard.vue'

// 本地类型定义
interface Tool {
  id: string
  name: string
  icon: string
  tooltip: string
}

// Props
interface Props {
  showDebug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDebug: false,
})

const { showDebug } = toRefs(props)

// Refs
const containerRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

// 状态
const viewport = reactive<Viewport>({
  x: 0,
  y: 0,
  zoom: 1,
})

const mousePos = reactive<Point>({ x: 0, y: 0 })
const isDragging = ref(false)
const lastMousePos = reactive<Point>({ x: 0, y: 0 })
const canvasSize = reactive({ width: 800, height: 600 })
const currentTool = ref('select')
const selectedCards = ref<string[]>([])

// 工具定义
const tools: Tool[] = [
  { id: 'select', name: '选择', icon: '⌖', tooltip: '选择和移动对象 (V)' },
  { id: 'pan', name: '平移', icon: '✋', tooltip: '平移画布 (H)' },
  { id: 'card', name: '卡片', icon: '📄', tooltip: '创建新卡片 (C)' },
  { id: 'connect', name: '连接', icon: '🔗', tooltip: '连接卡片 (L)' }
]

// 卡片数据
const cards = ref<Card[]>([
  {
    id: '1',
    title: '示例卡片 1',
    content: '这是一个**示例卡片**，支持*Markdown*格式。\n\n你可以:\n- 拖拽移动\n- 双击编辑\n- 调整大小',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 150 },
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      borderWidth: 2,
      borderRadius: 8,
      textColor: '#333333',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      opacity: 1,
      shadow: true
    },
    metadata: {
      tags: ['示例'],
      priority: 'medium',
      status: 'draft',
      attachments: []
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    title: '示例卡片 2',
    content: '另一个卡片示例。\n\n`代码块`也支持。',
    position: { x: 400, y: 200 },
    size: { width: 200, height: 150 },
    style: {
      backgroundColor: '#f8f9fa',
      borderColor: '#e0e0e0',
      borderWidth: 2,
      borderRadius: 8,
      textColor: '#333333',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      opacity: 1,
      shadow: true
    },
    metadata: {
      tags: ['示例'],
      priority: 'low',
      status: 'draft',
      attachments: []
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
])

// 拖拽状态
const dragState = ref<{
  isDragging: boolean
  cardId: string | null
  startPos: Point
  startCardPos: Point
} | null>(null)

// 计算属性
const cardsLayerStyle = computed(() => ({
  transform: `translate(${viewport.x}px, ${viewport.y}px)`,
  transformOrigin: 'top left'
}))

// 坐标转换
const screenToWorld = (screenX: number, screenY: number): Point => {
  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom
  }
}

const worldToScreen = (worldX: number, worldY: number): Point => {
  return {
    x: worldX * viewport.zoom + viewport.x,
    y: worldY * viewport.zoom + viewport.y
  }
}

const cardWithScreenPosition = (card: Card): Card => {
  const screenPos = worldToScreen(card.position.x, card.position.y)
  return {
    ...card,
    position: screenPos,
    size: {
      width: card.size.width * viewport.zoom,
      height: card.size.height * viewport.zoom
    }
  }
}

// 基础方法
const setTool = (toolId: string) => {
  currentTool.value = toolId
}

const updateCanvasSize = () => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  canvasSize.width = rect.width
  canvasSize.height = rect.height
}

const resetView = () => {
  viewport.x = 0
  viewport.y = 0
  viewport.zoom = 1
}

// 事件处理
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  const rect = canvasRef.value!.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05
  const newZoom = Math.max(0.1, Math.min(10, viewport.zoom * zoomFactor))

  const worldPos = screenToWorld(mouseX, mouseY)
  viewport.zoom = newZoom
  const newScreenPos = worldToScreen(worldPos.x, worldPos.y)

  viewport.x += mouseX - newScreenPos.x
  viewport.y += mouseY - newScreenPos.y
}

const handleMouseDown = (event: MouseEvent) => {
  event.preventDefault()

  const rect = canvasRef.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  mousePos.x = x
  mousePos.y = y
  lastMousePos.x = x
  lastMousePos.y = y

  if (currentTool.value === 'pan' || event.button === 1) {
    isDragging.value = true
  }
}

const handleMouseMove = (event: MouseEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  mousePos.x = x
  mousePos.y = y

  if (isDragging.value) {
    const deltaX = x - lastMousePos.x
    const deltaY = y - lastMousePos.y

    viewport.x += deltaX
    viewport.y += deltaY
  }

  lastMousePos.x = x
  lastMousePos.y = y
}

const handleMouseUp = () => {
  isDragging.value = false
  dragState.value = null
}

const handleCanvasClick = (event: MouseEvent) => {
  if (currentTool.value === 'card') {
    const rect = canvasRef.value!.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const worldPos = screenToWorld(x, y)
    createCard(worldPos)
  } else {
    selectedCards.value = []
  }
}

const createCard = (position: Point) => {
  const now = Date.now()
  const newCard: Card = {
    id: now.toString(),
    title: '新卡片',
    content: '',
    position: { x: position.x, y: position.y },
    size: { width: 200, height: 150 },
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#e0e0e0',
      borderWidth: 2,
      borderRadius: 8,
      textColor: '#333333',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      opacity: 1,
      shadow: true
    },
    metadata: {
      tags: [],
      priority: 'medium',
      status: 'draft',
      attachments: []
    },
    createdAt: now,
    updatedAt: now
  }
  cards.value.push(newCard)
  selectedCards.value = [newCard.id]
}

// 卡片事件处理
const handleCardSelect = (cardId: string) => {
  selectedCards.value = [cardId]
}

const handleCardUpdate = (updatedCard: Card) => {
  const index = cards.value.findIndex(c => c.id === updatedCard.id)
  if (index !== -1) {
    cards.value[index] = updatedCard
  }
}

const handleCardDelete = (cardId: string) => {
  cards.value = cards.value.filter(c => c.id !== cardId)
  selectedCards.value = selectedCards.value.filter(id => id !== cardId)
}

const handleCardDragStart = (event: MouseEvent, cardId: string) => {
  const card = cards.value.find(c => c.id === cardId)
  if (!card) return

  dragState.value = {
    isDragging: true,
    cardId,
    startPos: { x: event.clientX, y: event.clientY },
    startCardPos: { ...card.position }
  }
}

const handleCardResizeStart = (_event: MouseEvent, cardId: string, direction: string) => {
  // 基础实现
  console.log('Resize start:', cardId, direction)
}

// 生命周期
onMounted(() => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
})

// 暴露方法给父组件
defineExpose({
  resetView
})
</script>

<style scoped>
.whiteboard-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f8f9fa;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.whiteboard-canvas {
  display: block;
  cursor: crosshair;
}

.cards-layer {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

.cards-layer > * {
  pointer-events: all;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.tool-group {
  display: flex;
  gap: 4px;
  padding: 0 8px;
  border-right: 1px solid #e0e0e0;
}

.tool-group:last-child {
  border-right: none;
  padding-right: 0;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
}

.tool-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  transform: translateY(-1px);
}

.tool-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.tool-icon {
  font-size: 16px;
  line-height: 1;
}

.tool-label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}

.debug-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  backdrop-filter: blur(8px);
}
</style>
