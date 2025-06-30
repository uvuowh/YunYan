import { computed, watch } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import { useDocumentView } from './useDocumentView'
import { useWhiteboardView } from './useWhiteboardView'
import type { UnifiedBlock, Position } from '@/types/unified'

/**
 * Unified Integration Composable
 * Provides seamless operations between document and whiteboard views
 * Handles cross-view synchronization and bidirectional operations
 */
export function useUnifiedIntegration() {
  const unifiedStore = useUnifiedStore()
  const documentView = useDocumentView()
  const whiteboardView = useWhiteboardView()
  
  // ============================================================================
  // CROSS-VIEW OPERATIONS
  // ============================================================================
  
  /**
   * Add document block to whiteboard with smart positioning
   */
  function addDocumentBlockToWhiteboard(
    blockId: string, 
    canvasId?: string,
    position?: Position
  ) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    const targetCanvasId = canvasId || unifiedStore.currentCanvasId
    if (!targetCanvasId) {
      // Create new canvas for document blocks
      const canvas = unifiedStore.createCanvas(`${documentView.currentDocument.value?.title || 'Document'} Canvas`)
      return addDocumentBlockToWhiteboard(blockId, canvas.id, position)
    }
    
    // Smart positioning based on block hierarchy
    const smartPosition = position || calculateSmartPosition(block, targetCanvasId)
    
    return unifiedStore.addBlockToCanvas(blockId, targetCanvasId, smartPosition)
  }
  
  /**
   * Add whiteboard node to document with smart hierarchy placement
   */
  function addWhiteboardNodeToDocument(
    blockId: string,
    documentId?: string,
    parentId?: string
  ) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    const targetDocumentId = documentId || unifiedStore.currentDocumentId
    if (!targetDocumentId) {
      // Create new document for whiteboard blocks
      const document = unifiedStore.createDocument(`${whiteboardView.currentCanvas.value?.name || 'Canvas'} Document`)
      return addWhiteboardNodeToDocument(blockId, document.id, parentId)
    }
    
    const document = unifiedStore.documents.get(targetDocumentId)
    if (!document) return false
    
    // Add to document hierarchy
    if (parentId) {
      const parent = unifiedStore.blocks.get(parentId)
      if (parent) {
        parent.children.push(blockId)
        block.parentId = parentId
        block.position = parent.children.length - 1
      }
    } else {
      // Add as root block
      document.rootBlockIds.push(blockId)
      block.parentId = undefined
      block.position = document.rootBlockIds.length - 1
    }
    
    return true
  }
  
  /**
   * Create bidirectional link between document and whiteboard views
   */
  function createBidirectionalLink(blockId: string) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    // Ensure block exists in both views
    if (!block.spatialProperties && unifiedStore.currentCanvasId) {
      addDocumentBlockToWhiteboard(blockId)
    }
    
    if (!block.parentId && !isInAnyDocument(blockId) && unifiedStore.currentDocumentId) {
      addWhiteboardNodeToDocument(blockId)
    }
    
    return true
  }
  
  /**
   * Synchronize block content between views
   */
  function syncBlockContent(blockId: string, content: string) {
    const result = unifiedStore.updateBlock(blockId, { content })
    
    // Content is automatically synchronized due to reactive store
    // Both document and whiteboard views will update automatically
    
    return result
  }
  
  // ============================================================================
  // DRAG & DROP OPERATIONS
  // ============================================================================
  
  /**
   * Handle drag from document to whiteboard
   */
  function handleDocumentToWhiteboardDrag(
    blockId: string,
    dropPosition: Position,
    targetCanvasId: string
  ) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    // If block already has spatial properties, just move it
    if (block.spatialProperties) {
      return unifiedStore.updateBlock(blockId, {
        spatialProperties: {
          ...block.spatialProperties,
          canvasId: targetCanvasId,
          position: dropPosition,
          isVisible: true
        }
      })
    }
    
    // Add spatial properties for first time
    return unifiedStore.addBlockToCanvas(blockId, targetCanvasId, dropPosition)
  }
  
  /**
   * Handle drag from whiteboard to document
   */
  function handleWhiteboardToDocumentDrag(
    blockId: string,
    targetDocumentId: string,
    insertAfterBlockId?: string
  ) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    const document = unifiedStore.documents.get(targetDocumentId)
    if (!document) return false
    
    // Remove from current document position if exists
    if (block.parentId) {
      const oldParent = unifiedStore.blocks.get(block.parentId)
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== blockId)
      }
    } else {
      // Remove from any document root
      for (const doc of unifiedStore.documents.values()) {
        doc.rootBlockIds = doc.rootBlockIds.filter(id => id !== blockId)
      }
    }
    
    // Add to new position
    if (insertAfterBlockId) {
      const afterBlock = unifiedStore.blocks.get(insertAfterBlockId)
      if (afterBlock) {
        if (afterBlock.parentId) {
          // Insert as sibling
          const parent = unifiedStore.blocks.get(afterBlock.parentId)
          if (parent) {
            const insertIndex = parent.children.indexOf(insertAfterBlockId) + 1
            parent.children.splice(insertIndex, 0, blockId)
            block.parentId = afterBlock.parentId
            block.position = insertIndex
          }
        } else {
          // Insert in document root
          const insertIndex = document.rootBlockIds.indexOf(insertAfterBlockId) + 1
          document.rootBlockIds.splice(insertIndex, 0, blockId)
          block.parentId = undefined
          block.position = insertIndex
        }
      }
    } else {
      // Add to end of document
      document.rootBlockIds.push(blockId)
      block.parentId = undefined
      block.position = document.rootBlockIds.length - 1
    }
    
    return true
  }
  
  // ============================================================================
  // SMART POSITIONING & LAYOUT
  // ============================================================================
  
  /**
   * Calculate smart position for block based on hierarchy and existing layout
   */
  function calculateSmartPosition(block: UnifiedBlock, canvasId: string): Position {
    const canvasBlocks = Array.from(unifiedStore.blocks.values()).filter(b => 
      b.spatialProperties?.canvasId === canvasId && b.spatialProperties?.isVisible
    )
    
    // If no blocks on canvas, start at origin
    if (canvasBlocks.length === 0) {
      return { x: 100, y: 100 }
    }
    
    // For hierarchical blocks, position based on parent/sibling relationships
    if (block.parentId) {
      const parent = unifiedStore.blocks.get(block.parentId)
      if (parent?.spatialProperties) {
        // Position child blocks below and to the right of parent
        const childIndex = parent.children.indexOf(block.id)
        return {
          x: parent.spatialProperties.position.x + 50,
          y: parent.spatialProperties.position.y + 150 + (childIndex * 120)
        }
      }
    }
    
    // Find next available position in grid layout
    const gridSize = 250
    const cols = Math.ceil(Math.sqrt(canvasBlocks.length + 1))
    const row = Math.floor(canvasBlocks.length / cols)
    const col = canvasBlocks.length % cols
    
    return {
      x: 100 + (col * gridSize),
      y: 100 + (row * gridSize)
    }
  }
  
  /**
   * Auto-layout blocks on canvas based on hierarchy
   */
  function autoLayoutCanvas(canvasId: string) {
    const canvasBlocks = Array.from(unifiedStore.blocks.values()).filter(b => 
      b.spatialProperties?.canvasId === canvasId && b.spatialProperties?.isVisible
    )
    
    // Group blocks by hierarchy level
    const rootBlocks = canvasBlocks.filter(b => !b.parentId)
    const layoutPositions = new Map<string, Position>()
    
    let currentY = 100
    
    for (const rootBlock of rootBlocks) {
      layoutPositions.set(rootBlock.id, { x: 100, y: currentY })
      currentY += layoutBlockTree(rootBlock, 150, currentY + 150, layoutPositions)
      currentY += 50 // Gap between root block trees
    }
    
    // Apply calculated positions
    for (const [blockId, position] of layoutPositions) {
      unifiedStore.updateBlock(blockId, {
        spatialProperties: { position }
      })
    }
  }
  
  function layoutBlockTree(
    block: UnifiedBlock, 
    x: number, 
    y: number, 
    positions: Map<string, Position>
  ): number {
    let currentY = y
    
    for (const childId of block.children) {
      const child = unifiedStore.blocks.get(childId)
      if (child) {
        positions.set(childId, { x, y: currentY })
        currentY += 120
        
        if (child.children.length > 0) {
          currentY += layoutBlockTree(child, x + 200, currentY, positions)
        }
      }
    }
    
    return currentY - y
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  function isInAnyDocument(blockId: string): boolean {
    for (const document of unifiedStore.documents.values()) {
      if (document.rootBlockIds.includes(blockId)) {
        return true
      }
    }
    
    // Check if it's a child of any block
    const block = unifiedStore.blocks.get(blockId)
    return !!block?.parentId
  }
  
  function isOnAnyCanvas(blockId: string): boolean {
    const block = unifiedStore.blocks.get(blockId)
    return !!(block?.spatialProperties?.isVisible)
  }
  
  // ============================================================================
  // REAL-TIME SYNC WATCHERS
  // ============================================================================
  
  // Watch for changes in document view and sync to whiteboard
  watch(
    () => documentView.selectedBlockIds.value,
    (newSelection) => {
      // Optionally sync selection between views
      // whiteboardView.selectedNodeIds.value = newSelection
    }
  )
  
  // Watch for changes in whiteboard view and sync to document
  watch(
    () => whiteboardView.selectedNodeIds.value,
    (newSelection) => {
      // Optionally sync selection between views
      // documentView.selectedBlockIds.value = newSelection
    }
  )
  
  return {
    // Cross-view Operations
    addDocumentBlockToWhiteboard,
    addWhiteboardNodeToDocument,
    createBidirectionalLink,
    syncBlockContent,
    
    // Drag & Drop
    handleDocumentToWhiteboardDrag,
    handleWhiteboardToDocumentDrag,
    
    // Smart Layout
    calculateSmartPosition,
    autoLayoutCanvas,
    
    // Utilities
    isInAnyDocument,
    isOnAnyCanvas
  }
}
