<template>
  <div class="canvas-page">
    <div class="canvas-header">
      <div class="header-left">
        <h1>Canvas</h1>
        <p>Infinite grid canvas for visual thinking</p>
      </div>

      <div class="header-actions">
        <div class="grid-controls">
          <label class="grid-snap-toggle">
            <input type="checkbox" v-model="gridSnapEnabled" class="sr-only" />
            <span class="toggle-switch" :class="{ active: gridSnapEnabled }">
              <span class="toggle-thumb"></span>
            </span>
            <span class="toggle-label">Grid Snap</span>
          </label>
        </div>

        <Button @click="clearCanvas" variant="outline">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Clear
        </Button>
      </div>
    </div>

    <div class="canvas-container">
      <InfiniteGrid
        ref="gridRef"
        :grid-size="20"
        background-color="#fafafa"
        grid-color="#e5e7eb"
        major-grid-color="#d1d5db"
        @click="handleCanvasClick"
      >
        <!-- Render connections -->
        <CanvasConnection
          v-for="connection in connections"
          :key="connection.id"
          :connection="connection"
          :selected="selectedConnectionId === connection.id"
          :show-label="selectedConnectionId === connection.id"
          @select="selectedConnectionId = $event"
          @delete="deleteConnection"
        />
      </InfiniteGrid>
    </div>

    <!-- Connection context menu -->
    <ConnectionContextMenu
      :visible="showConnectionMenu"
      :position="connectionMenuPosition"
      @select="handleConnectionTypeSelect"
      @close="hideConnectionMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui'
import InfiniteGrid from '@/components/canvas/InfiniteGrid.vue'
import CanvasConnection from '@/components/canvas/CanvasConnection.vue'
import ConnectionContextMenu from '@/components/canvas/ConnectionContextMenu.vue'
import type { Connection } from '../types/canvas'

// State
const gridRef = ref<InstanceType<typeof InfiniteGrid>>()
const connections = ref<Connection[]>([])
const selectedConnectionId = ref<string | null>(null)
const connectionCounter = ref(0)
const gridSnapEnabled = ref(true)
const showConnectionMenu = ref(false)
const connectionMenuPosition = ref({ x: 0, y: 0 })
const pendingConnection = ref<{ sourceId: string; targetId: string } | null>(
  null
)

// Methods
const generateConnectionId = () => {
  return `connection-${++connectionCounter.value}`
}

const clearCanvas = () => {
  connections.value = []
  selectedConnectionId.value = null
}

const handleCanvasClick = (_event: MouseEvent) => {
  // 点击空白区域时取消所有选中状态
  selectedConnectionId.value = null
  hideConnectionMenu()
}

// Connection management methods
const createConnection = (
  sourceId: string,
  targetId: string,
  type: Connection['type']
) => {
  // Don't allow self-connections
  if (sourceId === targetId) return

  // Remove existing connection between these nodes
  const existingIndex = connections.value.findIndex(
    conn => conn.sourceNodeId === sourceId && conn.targetNodeId === targetId
  )
  if (existingIndex !== -1) {
    connections.value.splice(existingIndex, 1)
  }

  // Create new connection
  const newConnection: Connection = {
    id: generateConnectionId(),
    sourceNodeId: sourceId,
    targetNodeId: targetId,
    type,
    created: Date.now(),
  }

  connections.value.push(newConnection)
}

const deleteConnection = (connectionId: string) => {
  const index = connections.value.findIndex(conn => conn.id === connectionId)
  if (index !== -1) {
    connections.value.splice(index, 1)
    if (selectedConnectionId.value === connectionId) {
      selectedConnectionId.value = null
    }
  }
}

const handleConnectionTypeSelect = (type: Connection['type']) => {
  if (pendingConnection.value) {
    createConnection(
      pendingConnection.value.sourceId,
      pendingConnection.value.targetId,
      type
    )
  }
  hideConnectionMenu()
}

const hideConnectionMenu = () => {
  showConnectionMenu.value = false
  pendingConnection.value = null
}

// Keyboard event handling
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedConnectionId.value) {
      deleteConnection(selectedConnectionId.value)
    }
  } else if (event.key === 'Escape') {
    selectedConnectionId.value = null
    hideConnectionMenu()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.canvas-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 64px);
  background: var(--color-background);
  overflow: hidden;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;

  @media (max-width: 768px) {
    padding: var(--spacing-3) var(--spacing-4);
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.header-left p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
}

.header-actions .btn {
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-actions .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.grid-controls {
  display: flex;
  align-items: center;
}

.grid-snap-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.grid-snap-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch:hover {
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.15),
    0 0 0 3px rgba(16, 185, 129, 0.1);
}

.toggle-switch.active {
  background: #10b981;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active:hover {
  background: #059669;
  box-shadow:
    inset 0 1px 3px rgba(0, 0, 0, 0.15),
    0 0 0 3px rgba(16, 185, 129, 0.2);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.toggle-switch:hover .toggle-thumb {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.canvas-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Dark mode styles */
[data-theme='dark'] .canvas-page {
  background: #111827;
}

[data-theme='dark'] .canvas-header {
  background: #1f2937;
  border-bottom-color: #374151;
}

[data-theme='dark'] .header-left h1 {
  color: #f9fafb;
}

[data-theme='dark'] .header-left p {
  color: #9ca3af;
}

[data-theme='dark'] .toggle-switch {
  background: #4b5563;
}

[data-theme='dark'] .toggle-switch.active {
  background: #10b981;
}

[data-theme='dark'] .toggle-label {
  color: #e5e7eb;
}
</style>
