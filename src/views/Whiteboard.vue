<template>
  <div class="whiteboard-view">
    <div class="whiteboard-header">
      <h1>白板</h1>
      <div class="toolbar">
        <div class="tool-group">
          <Button 
            v-for="tool in tools" 
            :key="tool.key"
            :variant="currentTool === tool.key ? 'primary' : 'ghost'"
            size="sm"
            @click="setCurrentTool(tool.key)"
            :title="tool.label"
          >
            {{ tool.icon }}
          </Button>
        </div>
        <div class="zoom-controls">
          <Button variant="ghost" size="sm" @click="zoomOut">-</Button>
          <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
          <Button variant="ghost" size="sm" @click="zoomIn">+</Button>
        </div>
      </div>
    </div>

    <div class="whiteboard-content">
      <div class="canvas-container" ref="canvasContainer">
        <svg 
          class="whiteboard-canvas"
          :style="canvasStyle"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @wheel="handleCanvasWheel"
        >
          <!-- Grid Background -->
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border-color)" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          <!-- Connections -->
          <g class="connections-layer">
            <line
              v-for="connection in connections"
              :key="connection.id"
              :x1="getNodeCenter(connection.fromNodeId).x"
              :y1="getNodeCenter(connection.fromNodeId).y"
              :x2="getNodeCenter(connection.toNodeId).x"
              :y2="getNodeCenter(connection.toNodeId).y"
              :stroke="connection.style.color"
              :stroke-width="connection.style.width"
              :stroke-dasharray="connection.style.dashArray"
            />
          </g>

          <!-- Nodes -->
          <g class="nodes-layer">
            <g
              v-for="node in visibleNodes"
              :key="node.id"
              :transform="`translate(${node.x}, ${node.y})`"
              :class="['node', { selected: selectedNodeIds.includes(node.id) }]"
              @mousedown="handleNodeMouseDown(node.id, $event)"
            >
              <rect
                :width="node.width"
                :height="node.height"
                :fill="node.style.backgroundColor"
                :stroke="node.style.borderColor"
                stroke-width="2"
                rx="8"
              />
              <foreignObject
                :width="node.width - 16"
                :height="node.height - 16"
                x="8"
                y="8"
              >
                <div 
                  class="node-content"
                  :style="{ 
                    color: node.style.textColor,
                    fontSize: node.style.fontSize + 'px'
                  }"
                >
                  {{ node.content }}
                </div>
              </foreignObject>
            </g>
          </g>
        </svg>
      </div>
    </div>

    <!-- Node Properties Panel -->
    <div v-if="selectedNodes.length > 0" class="properties-panel">
      <h3>节点属性</h3>
      <div class="property-group">
        <label>内容</label>
        <textarea 
          :value="selectedNodes[0].content"
          @input="updateSelectedNodeContent($event)"
          class="content-input"
        ></textarea>
      </div>
      <div class="property-group">
        <label>背景色</label>
        <input 
          type="color" 
          :value="selectedNodes[0].style.backgroundColor"
          @input="updateSelectedNodeStyle('backgroundColor', $event.target.value)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useWhiteboardStore } from '@/stores/whiteboard'
import Button from '@/components/ui/Button.vue'

const whiteboardStore = useWhiteboardStore()
const canvasContainer = ref<HTMLElement>()

// Computed properties
const nodes = computed(() => whiteboardStore.nodes)
const connections = computed(() => whiteboardStore.connections)
const selectedNodes = computed(() => whiteboardStore.selectedNodes)
const selectedNodeIds = computed(() => whiteboardStore.selectedNodeIds)
const visibleNodes = computed(() => whiteboardStore.visibleNodes)
const currentTool = computed(() => whiteboardStore.currentTool)
const zoom = computed(() => whiteboardStore.zoom)
const viewportX = computed(() => whiteboardStore.viewportX)
const viewportY = computed(() => whiteboardStore.viewportY)

// Actions
const { 
  createNode, 
  updateNode, 
  setCurrentTool, 
  setZoom, 
  setViewport,
  selectNodes,
  clearSelection
} = whiteboardStore

const tools = [
  { key: 'select', icon: '👆', label: '选择' },
  { key: 'draw', icon: '✏️', label: '绘制' },
  { key: 'text', icon: '📝', label: '文本' },
  { key: 'shape', icon: '⬜', label: '形状' },
  { key: 'connect', icon: '🔗', label: '连接' }
] as const

const canvasStyle = computed(() => ({
  transform: `translate(${viewportX.value}px, ${viewportY.value}px) scale(${zoom.value})`,
  transformOrigin: '0 0'
}))

let isDragging = false
let dragStartX = 0
let dragStartY = 0
let dragStartViewportX = 0
let dragStartViewportY = 0

function handleCanvasMouseDown(event: MouseEvent) {
  if (currentTool.value === 'select') {
    isDragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    dragStartViewportX = viewportX.value
    dragStartViewportY = viewportY.value
    clearSelection()
  } else if (currentTool.value === 'text') {
    createTextNode(event)
  }
}

function handleCanvasMouseMove(event: MouseEvent) {
  if (isDragging && currentTool.value === 'select') {
    const deltaX = event.clientX - dragStartX
    const deltaY = event.clientY - dragStartY
    setViewport(
      dragStartViewportX + deltaX,
      dragStartViewportY + deltaY
    )
  }
}

function handleCanvasMouseUp() {
  isDragging = false
}

function handleCanvasWheel(event: WheelEvent) {
  event.preventDefault()
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  setZoom(zoom.value * delta)
}

function handleNodeMouseDown(nodeId: string, event: MouseEvent) {
  event.stopPropagation()
  selectNodes([nodeId])
}

function createTextNode(event: MouseEvent) {
  const rect = canvasContainer.value?.getBoundingClientRect()
  if (!rect) return

  const x = (event.clientX - rect.left - viewportX.value) / zoom.value
  const y = (event.clientY - rect.top - viewportY.value) / zoom.value

  createNode({
    type: 'text',
    x,
    y,
    width: 200,
    height: 100,
    content: '新建文本',
    style: {
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      textColor: '#1e293b',
      fontSize: 14
    },
    connections: []
  })
}

function getNodeCenter(nodeId: string) {
  const node = nodes.value.find(n => n.id === nodeId)
  if (!node) return { x: 0, y: 0 }
  return {
    x: node.x + node.width / 2,
    y: node.y + node.height / 2
  }
}

function updateSelectedNodeContent(event: Event) {
  const target = event.target as HTMLTextAreaElement
  if (selectedNodes.value.length > 0) {
    updateNode(selectedNodes.value[0].id, { content: target.value })
  }
}

function updateSelectedNodeStyle(property: string, value: string) {
  if (selectedNodes.value.length > 0) {
    const currentStyle = selectedNodes.value[0].style
    updateNode(selectedNodes.value[0].id, {
      style: { ...currentStyle, [property]: value }
    })
  }
}

function zoomIn() {
  setZoom(zoom.value * 1.2)
}

function zoomOut() {
  setZoom(zoom.value * 0.8)
}

onMounted(() => {
  // Initialize with a sample node
  if (nodes.value.length === 0) {
    createNode({
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      content: '欢迎使用白板！\n点击工具栏中的文本工具来创建新节点。',
      style: {
        backgroundColor: '#dbeafe',
        borderColor: '#3b82f6',
        textColor: '#1e40af',
        fontSize: 14
      },
      connections: []
    })
  }
})
</script>

<style scoped>
.whiteboard-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.whiteboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.whiteboard-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.tool-group {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.zoom-level {
  font-size: 0.875rem;
  color: var(--text-secondary);
  min-width: 3rem;
  text-align: center;
}

.whiteboard-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.whiteboard-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.whiteboard-canvas:active {
  cursor: grabbing;
}

.node {
  cursor: pointer;
}

.node.selected rect {
  stroke: var(--accent-color);
  stroke-width: 3;
}

.node-content {
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-family: inherit;
}

.properties-panel {
  position: absolute;
  top: 80px;
  right: 1rem;
  width: 250px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-lg);
}

.properties-panel h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.property-group {
  margin-bottom: 1rem;
}

.property-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.content-input {
  width: 100%;
  min-height: 80px;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.content-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

input[type="color"] {
  width: 100%;
  height: 2rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
}
</style>
