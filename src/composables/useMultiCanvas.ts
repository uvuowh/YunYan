import { ref, computed } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import { useUnifiedIntegration } from './useUnifiedIntegration'
import type { UnifiedBlock, CanvasContainer, Position } from '@/types/unified'

/**
 * Multi-Canvas Support Composable
 * Handles operations across multiple canvases and canvas management
 */
export function useMultiCanvas() {
  const unifiedStore = useUnifiedStore()
  const unifiedIntegration = useUnifiedIntegration()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const activeCanvases = ref<string[]>([])
  const canvasViewports = ref<Map<string, { x: number; y: number; zoom: number }>>(new Map())
  
  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  const allCanvases = computed(() => Array.from(unifiedStore.canvases.values()))
  
  const canvasesWithBlocks = computed(() => {
    return allCanvases.value.map(canvas => ({
      canvas,
      blockCount: canvas.blockIds.length,
      blocks: canvas.blockIds.map(id => unifiedStore.blocks.get(id)).filter(Boolean) as UnifiedBlock[]
    }))
  })
  
  const canvasStatistics = computed(() => {
    return allCanvases.value.map(canvas => {
      const blocks = canvas.blockIds.map(id => unifiedStore.blocks.get(id)).filter(Boolean) as UnifiedBlock[]
      const connections = blocks.reduce((total, block) => 
        total + (block.spatialProperties?.connections.length || 0), 0
      )
      
      return {
        canvasId: canvas.id,
        name: canvas.name,
        blockCount: blocks.length,
        connectionCount: connections,
        lastModified: canvas.metadata.updatedAt,
        tags: canvas.metadata.tags
      }
    })
  })
  
  // ============================================================================
  // CANVAS MANAGEMENT
  // ============================================================================
  
  /**
   * Create a new canvas with optional template
   */
  function createCanvas(
    name: string,
    template?: 'blank' | 'mindmap' | 'flowchart' | 'grid'
  ): CanvasContainer {
    const canvas = unifiedStore.createCanvas(name)
    
    if (template && template !== 'blank') {
      applyCanvasTemplate(canvas.id, template)
    }
    
    return canvas
  }
  
  /**
   * Duplicate a canvas with all its blocks
   */
  function duplicateCanvas(canvasId: string, newName?: string): CanvasContainer | null {
    const originalCanvas = unifiedStore.canvases.get(canvasId)
    if (!originalCanvas) return null
    
    const newCanvas = unifiedStore.createCanvas(newName || `${originalCanvas.name} (Copy)`)
    
    // Copy all blocks from original canvas
    const blockMapping = new Map<string, string>() // original ID -> new ID
    
    for (const blockId of originalCanvas.blockIds) {
      const originalBlock = unifiedStore.blocks.get(blockId)
      if (!originalBlock) continue
      
      // Create a copy of the block
      const newBlockResult = unifiedStore.createBlock(
        originalBlock.type,
        originalBlock.content,
        {
          properties: { ...originalBlock.properties },
          tags: [...originalBlock.metadata.tags]
        }
      )
      
      if (newBlockResult.success && newBlockResult.blockId) {
        blockMapping.set(blockId, newBlockResult.blockId)
        
        // Copy spatial properties
        if (originalBlock.spatialProperties) {
          unifiedStore.updateBlock(newBlockResult.blockId, {
            spatialProperties: {
              ...originalBlock.spatialProperties,
              canvasId: newCanvas.id,
              connections: [] // Will be updated below
            }
          })
        }
      }
    }
    
    // Copy connections with updated block IDs
    for (const [originalId, newId] of blockMapping) {
      const originalBlock = unifiedStore.blocks.get(originalId)
      const newBlock = unifiedStore.blocks.get(newId)
      
      if (originalBlock?.spatialProperties && newBlock?.spatialProperties) {
        const newConnections = originalBlock.spatialProperties.connections
          .map(conn => {
            const newTargetId = blockMapping.get(conn.targetBlockId)
            if (newTargetId) {
              return { ...conn, targetBlockId: newTargetId }
            }
            return null
          })
          .filter(Boolean)
        
        if (newConnections.length > 0) {
          unifiedStore.updateBlock(newId, {
            spatialProperties: {
              ...newBlock.spatialProperties,
              connections: newConnections as any[]
            }
          })
        }
      }
    }
    
    return newCanvas
  }
  
  /**
   * Merge multiple canvases into one
   */
  function mergeCanvases(
    targetCanvasId: string,
    sourceCanvasIds: string[],
    layout: 'preserve' | 'grid' | 'stack' = 'preserve'
  ): boolean {
    const targetCanvas = unifiedStore.canvases.get(targetCanvasId)
    if (!targetCanvas) return false
    
    let offsetX = 0
    let offsetY = 0
    
    if (layout === 'grid' || layout === 'stack') {
      // Calculate current bounds of target canvas
      const targetBlocks = targetCanvas.blockIds
        .map(id => unifiedStore.blocks.get(id))
        .filter(block => block?.spatialProperties) as UnifiedBlock[]
      
      if (targetBlocks.length > 0) {
        const maxX = Math.max(...targetBlocks.map(block => 
          block.spatialProperties!.position.x + block.spatialProperties!.size.width
        ))
        const maxY = Math.max(...targetBlocks.map(block => 
          block.spatialProperties!.position.y + block.spatialProperties!.size.height
        ))
        
        offsetX = maxX + 100
        offsetY = layout === 'stack' ? maxY + 100 : 0
      }
    }
    
    for (const sourceCanvasId of sourceCanvasIds) {
      const sourceCanvas = unifiedStore.canvases.get(sourceCanvasId)
      if (!sourceCanvas) continue
      
      // Move all blocks from source to target canvas
      for (const blockId of sourceCanvas.blockIds) {
        const block = unifiedStore.blocks.get(blockId)
        if (!block?.spatialProperties) continue
        
        let newPosition = block.spatialProperties.position
        
        if (layout !== 'preserve') {
          newPosition = {
            x: block.spatialProperties.position.x + offsetX,
            y: block.spatialProperties.position.y + offsetY
          }
        }
        
        unifiedStore.updateBlock(blockId, {
          spatialProperties: {
            ...block.spatialProperties,
            canvasId: targetCanvasId,
            position: newPosition
          }
        })
        
        // Add to target canvas
        if (!targetCanvas.blockIds.includes(blockId)) {
          targetCanvas.blockIds.push(blockId)
        }
      }
      
      if (layout === 'stack') {
        offsetY += 300 // Stack vertically
      } else if (layout === 'grid') {
        offsetX += 400 // Grid horizontally
      }
    }
    
    return true
  }
  
  /**
   * Apply a template to a canvas
   */
  function applyCanvasTemplate(
    canvasId: string,
    template: 'mindmap' | 'flowchart' | 'grid'
  ): void {
    const canvas = unifiedStore.canvases.get(canvasId)
    if (!canvas) return
    
    switch (template) {
      case 'mindmap':
        canvas.settings.gridEnabled = false
        canvas.settings.autoLayout = true
        canvas.settings.backgroundColor = '#f8fafc'
        break
      case 'flowchart':
        canvas.settings.gridEnabled = true
        canvas.settings.snapToGrid = true
        canvas.settings.gridSize = 20
        canvas.settings.backgroundColor = '#ffffff'
        break
      case 'grid':
        canvas.settings.gridEnabled = true
        canvas.settings.snapToGrid = true
        canvas.settings.gridSize = 50
        canvas.settings.backgroundColor = '#fafafa'
        break
    }
  }
  
  // ============================================================================
  // MULTI-CANVAS OPERATIONS
  // ============================================================================
  
  /**
   * Copy blocks between canvases
   */
  function copyBlocksBetweenCanvases(
    blockIds: string[],
    sourceCanvasId: string,
    targetCanvasId: string,
    targetPosition?: Position
  ): string[] {
    const newBlockIds: string[] = []
    const blockMapping = new Map<string, string>()
    
    // First pass: create copies of all blocks
    for (const blockId of blockIds) {
      const originalBlock = unifiedStore.blocks.get(blockId)
      if (!originalBlock?.spatialProperties || 
          originalBlock.spatialProperties.canvasId !== sourceCanvasId) continue
      
      const newBlockResult = unifiedStore.createBlock(
        originalBlock.type,
        originalBlock.content,
        {
          properties: { ...originalBlock.properties },
          tags: [...originalBlock.metadata.tags]
        }
      )
      
      if (newBlockResult.success && newBlockResult.blockId) {
        blockMapping.set(blockId, newBlockResult.blockId)
        newBlockIds.push(newBlockResult.blockId)
        
        // Calculate new position
        let newPosition = originalBlock.spatialProperties.position
        if (targetPosition) {
          const offset = blockIds.indexOf(blockId)
          newPosition = {
            x: targetPosition.x + (offset * 20),
            y: targetPosition.y + (offset * 20)
          }
        }
        
        // Add to target canvas with spatial properties
        unifiedStore.updateBlock(newBlockResult.blockId, {
          spatialProperties: {
            ...originalBlock.spatialProperties,
            canvasId: targetCanvasId,
            position: newPosition,
            connections: [] // Will be updated in second pass
          }
        })
      }
    }
    
    // Second pass: recreate connections between copied blocks
    for (const [originalId, newId] of blockMapping) {
      const originalBlock = unifiedStore.blocks.get(originalId)
      if (!originalBlock?.spatialProperties) continue
      
      const newConnections = originalBlock.spatialProperties.connections
        .map(conn => {
          const newTargetId = blockMapping.get(conn.targetBlockId)
          if (newTargetId) {
            return { ...conn, targetBlockId: newTargetId }
          }
          return null
        })
        .filter(Boolean)
      
      if (newConnections.length > 0) {
        const newBlock = unifiedStore.blocks.get(newId)
        if (newBlock?.spatialProperties) {
          unifiedStore.updateBlock(newId, {
            spatialProperties: {
              ...newBlock.spatialProperties,
              connections: newConnections as any[]
            }
          })
        }
      }
    }
    
    return newBlockIds
  }
  
  /**
   * Move blocks between canvases
   */
  function moveBlocksBetweenCanvases(
    blockIds: string[],
    sourceCanvasId: string,
    targetCanvasId: string,
    targetPosition?: Position
  ): boolean {
    const sourceCanvas = unifiedStore.canvases.get(sourceCanvasId)
    const targetCanvas = unifiedStore.canvases.get(targetCanvasId)
    
    if (!sourceCanvas || !targetCanvas) return false
    
    for (const blockId of blockIds) {
      const block = unifiedStore.blocks.get(blockId)
      if (!block?.spatialProperties || 
          block.spatialProperties.canvasId !== sourceCanvasId) continue
      
      // Calculate new position
      let newPosition = block.spatialProperties.position
      if (targetPosition) {
        const offset = blockIds.indexOf(blockId)
        newPosition = {
          x: targetPosition.x + (offset * 20),
          y: targetPosition.y + (offset * 20)
        }
      }
      
      // Update block's canvas and position
      unifiedStore.updateBlock(blockId, {
        spatialProperties: {
          ...block.spatialProperties,
          canvasId: targetCanvasId,
          position: newPosition
        }
      })
      
      // Update canvas block lists
      sourceCanvas.blockIds = sourceCanvas.blockIds.filter(id => id !== blockId)
      if (!targetCanvas.blockIds.includes(blockId)) {
        targetCanvas.blockIds.push(blockId)
      }
    }
    
    return true
  }
  
  /**
   * Create a portal/link between canvases
   */
  function createCanvasPortal(
    fromCanvasId: string,
    toCanvasId: string,
    position: Position,
    label?: string
  ): string | null {
    const portalResult = unifiedStore.createBlock(
      'whiteboard-group',
      label || `Portal to ${unifiedStore.canvases.get(toCanvasId)?.name || 'Canvas'}`,
      {
        addToCanvas: fromCanvasId,
        spatialPosition: position,
        spatialSize: { width: 150, height: 80 },
        properties: {
          portalType: 'canvas-link',
          targetCanvasId: toCanvasId,
          isPortal: true
        }
      }
    )
    
    return portalResult.success ? portalResult.blockId || null : null
  }
  
  // ============================================================================
  // CANVAS NAVIGATION
  // ============================================================================
  
  /**
   * Navigate to a specific canvas
   */
  function navigateToCanvas(canvasId: string): boolean {
    const canvas = unifiedStore.canvases.get(canvasId)
    if (!canvas) return false
    
    unifiedStore.setCurrentCanvas(canvasId)
    
    // Restore viewport if saved
    const savedViewport = canvasViewports.value.get(canvasId)
    if (savedViewport) {
      canvas.viewport = savedViewport
    }
    
    return true
  }
  
  /**
   * Save current viewport for a canvas
   */
  function saveCanvasViewport(canvasId: string, viewport: { x: number; y: number; zoom: number }): void {
    canvasViewports.value.set(canvasId, viewport)
    
    const canvas = unifiedStore.canvases.get(canvasId)
    if (canvas) {
      canvas.viewport = viewport
    }
  }
  
  /**
   * Get canvas overview (thumbnail data)
   */
  function getCanvasOverview(canvasId: string) {
    const canvas = unifiedStore.canvases.get(canvasId)
    if (!canvas) return null
    
    const blocks = canvas.blockIds
      .map(id => unifiedStore.blocks.get(id))
      .filter(block => block?.spatialProperties) as UnifiedBlock[]
    
    if (blocks.length === 0) {
      return {
        canvasId,
        name: canvas.name,
        isEmpty: true,
        boundingBox: null,
        blockCount: 0
      }
    }
    
    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    for (const block of blocks) {
      const { position, size } = block.spatialProperties!
      minX = Math.min(minX, position.x)
      minY = Math.min(minY, position.y)
      maxX = Math.max(maxX, position.x + size.width)
      maxY = Math.max(maxY, position.y + size.height)
    }
    
    return {
      canvasId,
      name: canvas.name,
      isEmpty: false,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      },
      blockCount: blocks.length,
      lastModified: canvas.metadata.updatedAt
    }
  }
  
  return {
    // State
    activeCanvases,
    canvasViewports,
    
    // Computed
    allCanvases,
    canvasesWithBlocks,
    canvasStatistics,
    
    // Canvas Management
    createCanvas,
    duplicateCanvas,
    mergeCanvases,
    applyCanvasTemplate,
    
    // Multi-Canvas Operations
    copyBlocksBetweenCanvases,
    moveBlocksBetweenCanvases,
    createCanvasPortal,
    
    // Navigation
    navigateToCanvas,
    saveCanvasViewport,
    getCanvasOverview
  }
}
