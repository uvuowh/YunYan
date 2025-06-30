<template>
  <div class="whiteboard-canvas h-full flex flex-col">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-group">
        <button 
          class="btn btn-sm btn-ghost"
          :class="{ 'btn-active': selectedTool === 'select' }"
          @click="setTool('select')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
          </svg>
          Select
        </button>
        
        <button 
          class="btn btn-sm btn-ghost"
          :class="{ 'btn-active': selectedTool === 'text' }"
          @click="setTool('text')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Text
        </button>
        
        <button 
          class="btn btn-sm btn-ghost"
          :class="{ 'btn-active': selectedTool === 'shape' }"
          @click="setTool('shape')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Shape
        </button>
        
        <button 
          class="btn btn-sm btn-ghost"
          :class="{ 'btn-active': selectedTool === 'connection' }"
          @click="setTool('connection')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect
        </button>
      </div>
      
      <div class="toolbar-group">
        <button
          class="btn btn-sm btn-ghost"
          @click="whiteboardView.zoomIn()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>

        <span class="text-sm">{{ Math.round(currentZoom * 100) }}%</span>

        <button
          class="btn btn-sm btn-ghost"
          @click="whiteboardView.zoomOut()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>

        <button
          class="btn btn-sm btn-ghost"
          @click="whiteboardView.resetZoom()"
        >
          Reset
        </button>
      </div>

      <div class="toolbar-group">
        <button
          class="btn btn-sm btn-ghost"
          @click="whiteboardView.centerView()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Center
        </button>

        <button
          class="btn btn-sm btn-ghost"
          @click="autoLayoutCanvas()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Auto Layout
        </button>
      </div>

      <div class="toolbar-group">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-sm btn-ghost">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Document
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a @click="addSelectedToDocument">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Selected to Document
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="toolbar-group ml-auto">
        <button 
          class="btn btn-sm btn-ghost"
          @click="saveCanvas"
          :disabled="!hasChanges"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </button>
      </div>
    </div>

    <!-- Canvas Container -->
    <div class="flex-1 relative overflow-hidden bg-base-100">
      <!-- Konva Stage Container -->
      <div 
        ref="canvasContainer" 
        class="w-full h-full"
        @contextmenu.prevent
      >
        <v-stage
          ref="stage"
          :config="stageConfig"
          @mousedown="handleStageMouseDown"
          @mousemove="handleStageMouseMove"
          @mouseup="handleStageMouseUp"
          @wheel="handleWheel"
        >
          <v-layer ref="backgroundLayer">
            <!-- Grid Background -->
            <v-rect
              v-if="showGrid"
              :config="gridConfig"
            />
          </v-layer>
          
          <v-layer ref="nodesLayer">
            <!-- Render Unified Blocks as Spatial Nodes -->
            <WhiteboardNode
              v-for="block in currentNodes"
              :key="block.id"
              :block="block"
              :is-selected="whiteboardView.selectedNodeIds.value.includes(block.id)"
              @select="selectNode"
              @update="updateNode"
              @delete="deleteNode"
              @add-to-document="addNodeToDocument"
            />
          </v-layer>
          
          <v-layer ref="connectionsLayer">
            <!-- Render Connections -->
            <WhiteboardConnection
              v-for="connection in currentConnections"
              :key="connection.id"
              :connection="connection"
              :nodes="currentNodes"
              @delete="deleteConnection"
            />
          </v-layer>
          
          <v-layer ref="overlayLayer">
            <!-- Selection Rectangle -->
            <v-rect
              v-if="selectionRect"
              :config="selectionRectConfig"
            />
          </v-layer>
        </v-stage>
      </div>
      
      <!-- Minimap -->
      <div 
        v-if="showMinimap"
        class="absolute bottom-4 right-4 w-48 h-32 bg-base-200 border border-base-300 rounded-lg overflow-hidden"
      >
        <div class="w-full h-full bg-base-100 relative">
          <!-- Minimap content would go here -->
          <div class="absolute inset-0 flex items-center justify-center text-xs text-base-content/50">
            Minimap
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useWhiteboardView } from '@/composables/useWhiteboardView'
import { useUnifiedIntegration } from '@/composables/useUnifiedIntegration'
import { useUnifiedStore } from '@/stores/unified'
import { useAppStore } from '@/stores/app'
import type { UnifiedBlock, Position } from '@/types/unified'
// import WhiteboardNode from './WhiteboardNode.vue'
// import WhiteboardConnection from './WhiteboardConnection.vue'

const whiteboardView = useWhiteboardView()
const unifiedIntegration = useUnifiedIntegration()
const unifiedStore = useUnifiedStore()
const appStore = useAppStore()

// Temporary placeholder components
const WhiteboardNode = { template: '<g></g>' }
const WhiteboardConnection = { template: '<g></g>' }

// State
const selectedTool = ref<'select' | 'text' | 'shape' | 'connection'>('select')
const canvasContainer = ref<HTMLDivElement>()
const stage = ref()
const hasChanges = ref(false)
const selectionRect = ref<{ x: number; y: number; width: number; height: number } | null>(null)

// Canvas interaction state
const isDrawing = ref(false)
const lastPointerPosition = ref<Position>({ x: 0, y: 0 })

// Computed - using unified whiteboard view
const currentCanvas = computed(() => whiteboardView.currentCanvas.value)
const currentNodes = computed(() => whiteboardView.canvasBlocks.value)
const currentConnections = computed(() => whiteboardView.canvasConnections.value)
const currentZoom = computed(() => whiteboardView.viewport.value.zoom)
const showGrid = computed(() => currentCanvas.value?.settings.gridEnabled || true)
const showMinimap = computed(() => currentCanvas.value?.settings.showMinimap || true)

const stageConfig = computed(() => ({
  width: canvasContainer.value?.clientWidth || 800,
  height: canvasContainer.value?.clientHeight || 600,
  scaleX: currentZoom.value,
  scaleY: currentZoom.value,
  x: whiteboardView.viewport.value.x,
  y: whiteboardView.viewport.value.y,
  draggable: selectedTool.value === 'select'
}))

const gridConfig = computed(() => ({
  x: 0,
  y: 0,
  width: stageConfig.value.width,
  height: stageConfig.value.height,
  fill: 'transparent',
  stroke: '#e5e7eb',
  strokeWidth: 1
}))

const selectionRectConfig = computed(() => {
  if (!selectionRect.value) return {}
  return {
    x: selectionRect.value.x,
    y: selectionRect.value.y,
    width: selectionRect.value.width,
    height: selectionRect.value.height,
    fill: 'rgba(59, 130, 246, 0.1)',
    stroke: '#3b82f6',
    strokeWidth: 1,
    dash: [5, 5]
  }
})

// Methods
function setTool(tool: typeof selectedTool.value) {
  selectedTool.value = tool
  whiteboardView.clearSelection()
}

function selectNode(nodeId: string, addToSelection = false) {
  whiteboardView.selectNode(nodeId, addToSelection)
}

function updateNode(nodeId: string, updates: Partial<UnifiedBlock>) {
  // Update through unified store to ensure all views sync
  unifiedStore.updateBlock(nodeId, updates)
  hasChanges.value = true
}

function deleteNode(nodeId: string) {
  unifiedStore.deleteBlock(nodeId)
  hasChanges.value = true
}

function deleteConnection(fromNodeId: string, connectionId: string) {
  whiteboardView.deleteConnection(fromNodeId, connectionId)
  hasChanges.value = true
}

// New unified feature: Add node to document
function addNodeToDocument(nodeId: string) {
  const result = unifiedIntegration.addWhiteboardNodeToDocument(nodeId)
  if (result) {
    appStore.addError(appStore.createError(
      'DOCUMENT_ADD_SUCCESS',
      'Node added to document',
      'integration'
    ))
  }
}

function handleStageMouseDown(e: any) {
  if (selectedTool.value === 'select') {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      whiteboardView.clearSelection()
      // Start selection rectangle
      const pos = e.target.getStage().getPointerPosition()
      selectionRect.value = { x: pos.x, y: pos.y, width: 0, height: 0 }
      isDrawing.value = true
    }
  } else if (selectedTool.value === 'text') {
    const pos = e.target.getStage().getPointerPosition()
    createTextNode(pos)
  } else if (selectedTool.value === 'shape') {
    const pos = e.target.getStage().getPointerPosition()
    createShapeNode(pos)
  }

  lastPointerPosition.value = e.target.getStage().getPointerPosition()
}

function handleStageMouseMove(e: any) {
  if (!isDrawing.value || !selectionRect.value) return
  
  const pos = e.target.getStage().getPointerPosition()
  selectionRect.value.width = pos.x - selectionRect.value.x
  selectionRect.value.height = pos.y - selectionRect.value.y
}

function handleStageMouseUp() {
  if (isDrawing.value && selectionRect.value) {
    // Select nodes within selection rectangle using unified blocks
    const rect = selectionRect.value
    const selectedNodeIds: string[] = []

    currentNodes.value.forEach(block => {
      if (block.spatialProperties) {
        const pos = block.spatialProperties.position
        const size = block.spatialProperties.size
        if (
          pos.x >= Math.min(rect.x, rect.x + rect.width) &&
          pos.x + size.width <= Math.max(rect.x, rect.x + rect.width) &&
          pos.y >= Math.min(rect.y, rect.y + rect.height) &&
          pos.y + size.height <= Math.max(rect.y, rect.y + rect.height)
        ) {
          selectedNodeIds.push(block.id)
        }
      }
    })

    selectedNodeIds.forEach(nodeId => whiteboardView.selectNode(nodeId, true))
  }

  isDrawing.value = false
  selectionRect.value = null
}

function handleWheel(e: any) {
  e.evt.preventDefault()

  const scaleBy = 1.1
  const stage = e.target.getStage()
  const oldScale = stage.scaleX()
  const pointer = stage.getPointerPosition()

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale
  }

  const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
  const clampedScale = Math.max(0.1, Math.min(3, newScale))

  whiteboardView.updateViewport(
    pointer.x - mousePointTo.x * clampedScale,
    pointer.y - mousePointTo.y * clampedScale,
    clampedScale
  )
}

function createTextNode(position: Position) {
  const result = whiteboardView.createSpatialBlock('whiteboard-text', position, 'New Text Node')
  if (result.success && result.blockId) {
    hasChanges.value = true
    selectNode(result.blockId)
  }
}

function createShapeNode(position: Position) {
  const result = whiteboardView.createSpatialBlock('shape', position, '', { width: 100, height: 100 })
  if (result.success && result.blockId) {
    hasChanges.value = true
    selectNode(result.blockId)
  }
}

// New unified features
function addSelectedToDocument() {
  const selectedBlocks = whiteboardView.selectedNodeIds.value
  if (selectedBlocks.length === 0) {
    appStore.addError(appStore.createError(
      'NO_SELECTION',
      'Please select nodes to add to document',
      'integration'
    ))
    return
  }

  let successCount = 0
  for (const blockId of selectedBlocks) {
    const result = unifiedIntegration.addWhiteboardNodeToDocument(blockId)
    if (result) successCount++
  }

  if (successCount > 0) {
    appStore.addError(appStore.createError(
      'DOCUMENT_ADD_SUCCESS',
      `${successCount} node(s) added to document`,
      'integration'
    ))
  }
}

function autoLayoutCanvas() {
  if (currentCanvas.value) {
    unifiedIntegration.autoLayoutCanvas(currentCanvas.value.id)
    appStore.addError(appStore.createError(
      'LAYOUT_SUCCESS',
      'Canvas auto-layout applied',
      'whiteboard'
    ))
  }
}

async function saveCanvas() {
  if (!currentCanvas.value) return

  try {
    appStore.setLoading(true)
    // The unified store automatically handles persistence
    hasChanges.value = false

    appStore.addError(appStore.createError(
      'SAVE_SUCCESS',
      'Canvas saved successfully',
      'whiteboard'
    ))
  } catch (error) {
    console.error('Failed to save canvas:', error)
    appStore.addError(appStore.createError(
      'SAVE_FAILED',
      'Failed to save canvas',
      'whiteboard',
      error
    ))
  } finally {
    appStore.setLoading(false)
  }
}

function handleResize() {
  nextTick(() => {
    if (stage.value) {
      stage.value.getNode().size({
        width: canvasContainer.value?.clientWidth || 800,
        height: canvasContainer.value?.clientHeight || 600
      })
    }
  })
}

onMounted(() => {
  // Initialize canvas if none exists
  if (!currentCanvas.value) {
    whiteboardView.createCanvas()
  }

  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.whiteboard-canvas {
  @apply bg-base-100;
}
</style>
