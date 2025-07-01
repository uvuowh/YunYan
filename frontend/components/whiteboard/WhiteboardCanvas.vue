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
        @update:card="updateCard"
        @select="selectCard"
        @delete="deleteCard"
        @drag-start="handleCardDragStart"
        @resize-start="handleCardResizeStart"
      />
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <button
        v-for="tool in tools"
        :key="tool.id"
        :class="['tool-btn', { active: currentTool === tool.id }]"
        @click="setTool(tool.id)"
      >
        {{ tool.name }}
      </button>
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
import { computed, onMounted, onUnmounted, reactive, ref, toRefs, watch } from 'vue'
import WhiteboardCard from './WhiteboardCard.vue'

// 本地类型定义
interface CanvasSize {
  width: number
  height: number
}

interface Tool {
  id: string
  name: string
}

// Props
interface Props {
  showDebug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDebug: false,
})

// 使用props来避免未使用警告
const { showDebug } = toRefs(props)

// TODO: 集成 whiteboardStore
// const whiteboardStore = useWhiteboardStore()

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

const canvasSize = reactive<CanvasSize>({
  width: 800,
  height: 600,
})

const currentTool = ref('select')

// 卡片相关状态
const cards = ref<Card[]>([
  {
    id: '1',
    title: '示例卡片 1',
    content:
      '这是一个**示例卡片**，支持*Markdown*格式。\n\n你可以:\n- 拖拽移动\n- 双击编辑\n- 调整大小',
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
      shadow: true,
    },
    metadata: {
      tags: ['示例'],
      priority: 'medium',
      status: 'draft',
      attachments: [],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
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
      shadow: true,
    },
    metadata: {
      tags: ['示例'],
      priority: 'low',
      status: 'draft',
      attachments: [],
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
])

const selectedCards = ref<string[]>([])
const dragState = ref<{
  isDragging: boolean
  cardId: string | null
  startPos: Point
  startCardPos: Point
} | null>(null)

const resizeState = ref<{
  isResizing: boolean
  cardId: string | null
  direction: string
  startPos: Point
  startSize: { width: number; height: number }
} | null>(null)

// 工具定义
const tools: Tool[] = [
  { id: 'select', name: '选择' },
  { id: 'pan', name: '平移' },
  { id: 'card', name: '卡片' },
  { id: 'connect', name: '连接' },
]

// 计算属性
const ctx = computed(() => canvasRef.value?.getContext('2d'))

const cardsLayerStyle = computed(() => ({
  transform: `translate(${viewport.x}px, ${viewport.y}px)`,
  transformOrigin: 'top left',
}))

// 方法
const setTool = (toolId: string) => {
  currentTool.value = toolId
}

const updateCanvasSize = () => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  canvasSize.width = rect.width
  canvasSize.height = rect.height
}

// 坐标转换：屏幕坐标 -> 世界坐标
const screenToWorld = (screenX: number, screenY: number): Point => {
  return {
    x: (screenX - viewport.x) / viewport.zoom,
    y: (screenY - viewport.y) / viewport.zoom,
  }
}

// 坐标转换：世界坐标 -> 屏幕坐标
const worldToScreen = (worldX: number, worldY: number): Point => {
  return {
    x: worldX * viewport.zoom + viewport.x,
    y: worldY * viewport.zoom + viewport.y,
  }
}

// 将卡片的世界坐标转换为屏幕坐标
const cardWithScreenPosition = (card: Card): Card => {
  const screenPos = worldToScreen(card.position.x, card.position.y)
  return {
    ...card,
    position: screenPos,
    size: {
      width: card.size.width * viewport.zoom,
      height: card.size.height * viewport.zoom,
    },
  }
}

// 事件处理
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  const rect = canvasRef.value!.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  // 缩放因子 - 更平滑的缩放
  const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05
  const newZoom = Math.max(0.1, Math.min(10, viewport.zoom * zoomFactor))

  // 以鼠标位置为中心缩放
  const worldPos = screenToWorld(mouseX, mouseY)
  viewport.zoom = newZoom
  const newScreenPos = worldToScreen(worldPos.x, worldPos.y)

  viewport.x += mouseX - newScreenPos.x
  viewport.y += mouseY - newScreenPos.y

  render()
}

const handleMouseDown = (event: MouseEvent) => {
  // 防止文本选择
  event.preventDefault()

  const rect = canvasRef.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  mousePos.x = x
  mousePos.y = y
  lastMousePos.x = x
  lastMousePos.y = y

  if (currentTool.value === 'pan' || event.button === 1) {
    // 中键或平移工具
    isDragging.value = true
  }
}

const handleMouseMove = (event: MouseEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  mousePos.x = x
  mousePos.y = y

  // 处理卡片拖拽
  if (dragState.value?.isDragging) {
    const deltaX = event.clientX - dragState.value.startPos.x
    const deltaY = event.clientY - dragState.value.startPos.y

    const card = cards.value.find(c => c.id === dragState.value!.cardId)
    if (card) {
      // 将屏幕坐标的偏移转换为世界坐标
      card.position.x = dragState.value.startCardPos.x + deltaX / viewport.zoom
      card.position.y = dragState.value.startCardPos.y + deltaY / viewport.zoom
    }
  }

  // 处理卡片调整大小
  if (resizeState.value?.isResizing) {
    const deltaX = (event.clientX - resizeState.value.startPos.x) / viewport.zoom
    const deltaY = (event.clientY - resizeState.value.startPos.y) / viewport.zoom

    const card = cards.value.find(c => c.id === resizeState.value!.cardId)
    if (card) {
      const direction = resizeState.value.direction
      const startSize = resizeState.value.startSize

      if (direction.includes('e')) {
        card.size.width = Math.max(100, startSize.width + deltaX)
      }
      if (direction.includes('w')) {
        const newWidth = Math.max(100, startSize.width - deltaX)
        const widthDiff = newWidth - card.size.width
        card.size.width = newWidth
        card.position.x -= widthDiff
      }
      if (direction.includes('s')) {
        card.size.height = Math.max(80, startSize.height + deltaY)
      }
      if (direction.includes('n')) {
        const newHeight = Math.max(80, startSize.height - deltaY)
        const heightDiff = newHeight - card.size.height
        card.size.height = newHeight
        card.position.y -= heightDiff
      }
    }
  }

  // 处理画布平移
  if (isDragging.value && !dragState.value?.isDragging && !resizeState.value?.isResizing) {
    const deltaX = x - lastMousePos.x
    const deltaY = y - lastMousePos.y

    viewport.x += deltaX
    viewport.y += deltaY

    render()
  }

  lastMousePos.x = x
  lastMousePos.y = y
}

const handleMouseUp = () => {
  isDragging.value = false
  dragState.value = null
  resizeState.value = null
}

const handleKeyDown = (event: KeyboardEvent) => {
  // 空格键 + 拖拽 = 平移
  if (event.code === 'Space' && !isDragging.value) {
    event.preventDefault()
    setTool('pan')
  }

  // 重置视图 (R键)
  if (event.code === 'KeyR') {
    resetView()
  }

  // 工具切换
  if (event.code === 'Digit1') setTool('select')
  if (event.code === 'Digit2') setTool('pan')
  if (event.code === 'Digit3') setTool('card')
  if (event.code === 'Digit4') setTool('connect')
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.code === 'Space') {
    setTool('select')
  }
}

const resetView = () => {
  viewport.x = 0
  viewport.y = 0
  viewport.zoom = 1
  render()
}

// 卡片相关方法
const selectCard = (cardId: string) => {
  selectedCards.value = [cardId]
}

const updateCard = (updatedCard: Card) => {
  const index = cards.value.findIndex(c => c.id === updatedCard.id)
  if (index !== -1) {
    cards.value[index] = updatedCard
  }
}

const deleteCard = (cardId: string) => {
  cards.value = cards.value.filter(c => c.id !== cardId)
  selectedCards.value = selectedCards.value.filter(id => id !== cardId)
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
      shadow: true,
    },
    metadata: {
      tags: [],
      priority: 'medium',
      status: 'draft',
      attachments: [],
    },
    createdAt: now,
    updatedAt: now,
  }
  cards.value.push(newCard)
  selectedCards.value = [newCard.id]
}

const handleCanvasClick = (event: MouseEvent) => {
  if (currentTool.value === 'card') {
    const rect = canvasRef.value!.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const worldPos = screenToWorld(x, y)
    createCard(worldPos)
  } else {
    // 清除选择
    selectedCards.value = []
  }
}

const handleCardDragStart = (event: MouseEvent, cardId: string) => {
  const card = cards.value.find(c => c.id === cardId)
  if (!card) return

  dragState.value = {
    isDragging: true,
    cardId,
    startPos: { x: event.clientX, y: event.clientY },
    startCardPos: { ...card.position },
  }
}

const handleCardResizeStart = (event: MouseEvent, cardId: string, direction: string) => {
  const card = cards.value.find(c => c.id === cardId)
  if (!card) return

  resizeState.value = {
    isResizing: true,
    cardId,
    direction,
    startPos: { x: event.clientX, y: event.clientY },
    startSize: { ...card.size },
  }
}

// 渲染函数
const render = () => {
  if (!ctx.value) return

  const canvas = canvasRef.value!
  ctx.value.clearRect(0, 0, canvas.width, canvas.height)

  // 保存当前变换状态
  ctx.value.save()

  // 应用视口变换
  ctx.value.translate(viewport.x, viewport.y)
  ctx.value.scale(viewport.zoom, viewport.zoom)

  // 绘制网格
  drawGrid()

  // 恢复变换状态
  ctx.value.restore()
}

const drawGrid = () => {
  if (!ctx.value) return

  const gridSize = 50
  const canvas = canvasRef.value!

  // 计算网格范围
  const startX = Math.floor(-viewport.x / viewport.zoom / gridSize) * gridSize
  const endX = Math.ceil((canvas.width - viewport.x) / viewport.zoom / gridSize) * gridSize
  const startY = Math.floor(-viewport.y / viewport.zoom / gridSize) * gridSize
  const endY = Math.ceil((canvas.height - viewport.y) / viewport.zoom / gridSize) * gridSize

  ctx.value.strokeStyle = '#e0e0e0'
  ctx.value.lineWidth = 1 / viewport.zoom
  ctx.value.beginPath()

  // 绘制垂直线
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.value.moveTo(x, startY)
    ctx.value.lineTo(x, endY)
  }

  // 绘制水平线
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.value.moveTo(startX, y)
    ctx.value.lineTo(endX, y)
  }

  ctx.value.stroke()
}

// 生命周期
onMounted(() => {
  updateCanvasSize()
  render()

  // 监听窗口大小变化
  window.addEventListener('resize', updateCanvasSize)

  // 监听键盘事件
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

// 监听视口变化
watch(() => [viewport.x, viewport.y, viewport.zoom], render)
watch(() => [canvasSize.width, canvasSize.height], render)

// 暴露方法给父组件
defineExpose({
  resetView,
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
  gap: 8px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tool-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #f0f0f0;
}

.tool-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.debug-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
}
</style>
