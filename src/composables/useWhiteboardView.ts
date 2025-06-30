import { computed, ref } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import type { 
  UnifiedBlock, 
  UnifiedBlockType, 
  Position, 
  Size,
  SpatialConnection,
  SpatialConnectionType,
  CreateBlockOptions 
} from '@/types/unified'

/**
 * Whiteboard View Adapter
 * Presents unified blocks in a spatial canvas layout
 * Provides whiteboard-specific operations while working with the unified store
 */
export function useWhiteboardView() {
  const unifiedStore = useUnifiedStore()
  
  // ============================================================================
  // WHITEBOARD-SPECIFIC STATE
  // ============================================================================
  
  const selectedNodeIds = ref<string[]>([])
  const isDragging = ref(false)
  const dragOffset = ref<Position>({ x: 0, y: 0 })
  const viewport = ref<{ x: number; y: number; zoom: number }>({ x: 0, y: 0, zoom: 1 })
  
  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  // Current canvas blocks with spatial properties
  const canvasBlocks = computed(() => unifiedStore.currentCanvasBlocks)
  
  // Current canvas metadata
  const currentCanvas = computed(() => {
    if (!unifiedStore.currentCanvasId) return null
    return unifiedStore.canvases.get(unifiedStore.currentCanvasId)
  })
  
  // Selected blocks
  const selectedBlocks = computed(() => 
    selectedNodeIds.value.map(id => unifiedStore.blocks.get(id)).filter(Boolean) as UnifiedBlock[]
  )
  
  // Canvas statistics
  const canvasStats = computed(() => {
    const blocks = canvasBlocks.value
    const connections = blocks.reduce((total, block) => 
      total + (block.spatialProperties?.connections.length || 0), 0
    )
    
    return {
      blockCount: blocks.length,
      connectionCount: connections,
      lastModified: blocks.reduce((latest, block) => {
        return block.metadata.updatedAt > latest ? block.metadata.updatedAt : latest
      }, new Date(0))
    }
  })
  
  // All connections on current canvas
  const canvasConnections = computed(() => {
    const connections: SpatialConnection[] = []
    
    for (const block of canvasBlocks.value) {
      if (block.spatialProperties?.connections) {
        connections.push(...block.spatialProperties.connections)
      }
    }
    
    return connections
  })
  
  // ============================================================================
  // CANVAS OPERATIONS
  // ============================================================================
  
  /**
   * Create a new canvas
   */
  function createCanvas(name?: string) {
    return unifiedStore.createCanvas(name)
  }
  
  /**
   * Create a new spatial block on the canvas
   */
  function createSpatialBlock(
    type: UnifiedBlockType,
    position: Position,
    content: string = '',
    size: Size = { width: 200, height: 100 }
  ) {
    if (!unifiedStore.currentCanvasId) {
      throw new Error('No active canvas')
    }
    
    const options: CreateBlockOptions = {
      addToCanvas: unifiedStore.currentCanvasId,
      spatialPosition: position,
      spatialSize: size
    }
    
    return unifiedStore.createBlock(type, content, options)
  }
  
  /**
   * Add existing block to current canvas
   */
  function addBlockToCanvas(blockId: string, position: Position) {
    if (!unifiedStore.currentCanvasId) {
      throw new Error('No active canvas')
    }
    
    return unifiedStore.addBlockToCanvas(blockId, unifiedStore.currentCanvasId, position)
  }
  
  /**
   * Remove block from current canvas
   */
  function removeBlockFromCanvas(blockId: string) {
    if (!unifiedStore.currentCanvasId) {
      throw new Error('No active canvas')
    }
    
    return unifiedStore.removeBlockFromCanvas(blockId, unifiedStore.currentCanvasId)
  }
  
  // ============================================================================
  // SPATIAL OPERATIONS
  // ============================================================================
  
  /**
   * Move block to new position
   */
  function moveBlock(blockId: string, newPosition: Position) {
    return unifiedStore.updateBlock(blockId, {
      spatialProperties: { position: newPosition }
    })
  }
  
  /**
   * Resize block
   */
  function resizeBlock(blockId: string, newSize: Size) {
    return unifiedStore.updateBlock(blockId, {
      spatialProperties: { size: newSize }
    })
  }
  
  /**
   * Update block layer (z-index)
   */
  function updateBlockLayer(blockId: string, layer: number) {
    return unifiedStore.updateBlock(blockId, {
      spatialProperties: { layer }
    })
  }
  
  /**
   * Lock/unlock block position
   */
  function toggleBlockLock(blockId: string) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block?.spatialProperties) return false
    
    return unifiedStore.updateBlock(blockId, {
      spatialProperties: { locked: !block.spatialProperties.locked }
    })
  }
  
  // ============================================================================
  // CONNECTION OPERATIONS
  // ============================================================================
  
  /**
   * Create connection between two blocks
   */
  function createConnection(
    fromBlockId: string,
    toBlockId: string,
    type: SpatialConnectionType = 'arrow',
    label?: string
  ) {
    const fromBlock = unifiedStore.blocks.get(fromBlockId)
    if (!fromBlock?.spatialProperties) return false
    
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const connection: SpatialConnection = {
      id: connectionId,
      targetBlockId: toBlockId,
      type,
      style: {
        color: '#374151',
        width: 2,
        opacity: 1
      },
      label,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
    
    fromBlock.spatialProperties.connections.push(connection)
    
    return unifiedStore.updateBlock(fromBlockId, {
      spatialProperties: fromBlock.spatialProperties
    })
  }
  
  /**
   * Delete connection
   */
  function deleteConnection(fromBlockId: string, connectionId: string) {
    const fromBlock = unifiedStore.blocks.get(fromBlockId)
    if (!fromBlock?.spatialProperties) return false
    
    fromBlock.spatialProperties.connections = fromBlock.spatialProperties.connections.filter(
      conn => conn.id !== connectionId
    )
    
    return unifiedStore.updateBlock(fromBlockId, {
      spatialProperties: fromBlock.spatialProperties
    })
  }
  
  // ============================================================================
  // SELECTION OPERATIONS
  // ============================================================================
  
  function selectNode(blockId: string, addToSelection = false) {
    if (addToSelection) {
      if (!selectedNodeIds.value.includes(blockId)) {
        selectedNodeIds.value.push(blockId)
      }
    } else {
      selectedNodeIds.value = [blockId]
    }
  }
  
  function clearSelection() {
    selectedNodeIds.value = []
  }
  
  function selectAll() {
    selectedNodeIds.value = canvasBlocks.value.map(block => block.id)
  }
  
  function deleteSelectedNodes() {
    for (const blockId of selectedNodeIds.value) {
      unifiedStore.deleteBlock(blockId)
    }
    clearSelection()
  }
  
  // ============================================================================
  // VIEWPORT OPERATIONS
  // ============================================================================
  
  function updateViewport(x: number, y: number, zoom: number) {
    viewport.value = { x, y, zoom }
    
    // Update canvas viewport if it exists
    const canvas = currentCanvas.value
    if (canvas) {
      canvas.viewport = { x, y, zoom }
    }
  }
  
  function zoomIn() {
    const newZoom = Math.min(viewport.value.zoom * 1.2, 3)
    updateViewport(viewport.value.x, viewport.value.y, newZoom)
  }
  
  function zoomOut() {
    const newZoom = Math.max(viewport.value.zoom / 1.2, 0.1)
    updateViewport(viewport.value.x, viewport.value.y, newZoom)
  }
  
  function resetZoom() {
    updateViewport(0, 0, 1)
  }
  
  function centerView() {
    if (canvasBlocks.value.length === 0) {
      resetZoom()
      return
    }
    
    // Calculate bounding box of all blocks
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    for (const block of canvasBlocks.value) {
      if (block.spatialProperties) {
        const { position, size } = block.spatialProperties
        minX = Math.min(minX, position.x)
        minY = Math.min(minY, position.y)
        maxX = Math.max(maxX, position.x + size.width)
        maxY = Math.max(maxY, position.y + size.height)
      }
    }
    
    // Center on the bounding box
    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2
    
    updateViewport(-centerX, -centerY, 1)
  }
  
  // ============================================================================
  // CROSS-VIEW OPERATIONS
  // ============================================================================
  
  /**
   * Convert spatial block to document block (add to document hierarchy)
   */
  function addBlockToDocument(blockId: string, documentId?: string) {
    const targetDocumentId = documentId || unifiedStore.currentDocumentId
    if (!targetDocumentId) {
      // Create a new document if none exists
      const document = unifiedStore.createDocument('Whiteboard Document')
      return addBlockToDocumentRoot(blockId, document.id)
    }
    
    return addBlockToDocumentRoot(blockId, targetDocumentId)
  }
  
  function addBlockToDocumentRoot(blockId: string, documentId: string) {
    const document = unifiedStore.documents.get(documentId)
    if (!document) return false
    
    // Add to document root if not already there
    if (!document.rootBlockIds.includes(blockId)) {
      document.rootBlockIds.push(blockId)
      
      // Update block position in hierarchy
      const block = unifiedStore.blocks.get(blockId)
      if (block) {
        block.position = document.rootBlockIds.length - 1
        block.parentId = undefined
      }
    }
    
    return true
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Get blocks within a region
   */
  function getBlocksInRegion(topLeft: Position, bottomRight: Position): UnifiedBlock[] {
    return canvasBlocks.value.filter(block => {
      if (!block.spatialProperties) return false
      
      const { position, size } = block.spatialProperties
      const blockRight = position.x + size.width
      const blockBottom = position.y + size.height
      
      return position.x >= topLeft.x && 
             position.y >= topLeft.y && 
             blockRight <= bottomRight.x && 
             blockBottom <= bottomRight.y
    })
  }
  
  /**
   * Find blocks near a position
   */
  function findBlocksNear(position: Position, radius: number): UnifiedBlock[] {
    return canvasBlocks.value.filter(block => {
      if (!block.spatialProperties) return false
      
      const blockCenter = {
        x: block.spatialProperties.position.x + block.spatialProperties.size.width / 2,
        y: block.spatialProperties.position.y + block.spatialProperties.size.height / 2
      }
      
      const distance = Math.sqrt(
        Math.pow(blockCenter.x - position.x, 2) + 
        Math.pow(blockCenter.y - position.y, 2)
      )
      
      return distance <= radius
    })
  }
  
  return {
    // State
    selectedNodeIds,
    isDragging,
    dragOffset,
    viewport,
    
    // Computed
    canvasBlocks,
    currentCanvas,
    selectedBlocks,
    canvasStats,
    canvasConnections,
    
    // Canvas Operations
    createCanvas,
    createSpatialBlock,
    addBlockToCanvas,
    removeBlockFromCanvas,
    
    // Spatial Operations
    moveBlock,
    resizeBlock,
    updateBlockLayer,
    toggleBlockLock,
    
    // Connection Operations
    createConnection,
    deleteConnection,
    
    // Selection Operations
    selectNode,
    clearSelection,
    selectAll,
    deleteSelectedNodes,
    
    // Viewport Operations
    updateViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    centerView,
    
    // Cross-view Operations
    addBlockToDocument,
    
    // Utilities
    getBlocksInRegion,
    findBlocksNear
  }
}
