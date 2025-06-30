import { ref, computed } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import { useUnifiedIntegration } from './useUnifiedIntegration'
import type { UnifiedBlock, Position } from '@/types/unified'

/**
 * Drag and Drop Composable
 * Handles seamless drag and drop operations between document and whiteboard views
 */
export function useDragAndDrop() {
  const unifiedStore = useUnifiedStore()
  const unifiedIntegration = useUnifiedIntegration()
  
  // ============================================================================
  // DRAG STATE
  // ============================================================================
  
  const isDragging = ref(false)
  const draggedBlock = ref<UnifiedBlock | null>(null)
  const draggedBlockId = ref<string | null>(null)
  const dragStartPosition = ref<Position>({ x: 0, y: 0 })
  const dragCurrentPosition = ref<Position>({ x: 0, y: 0 })
  const dragOffset = ref<Position>({ x: 0, y: 0 })
  const dragSource = ref<'document' | 'whiteboard' | null>(null)
  const dropTarget = ref<'document' | 'whiteboard' | null>(null)
  const dropZone = ref<string | null>(null) // Specific drop zone identifier
  
  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  const canDrop = computed(() => {
    if (!isDragging.value || !draggedBlock.value || !dropTarget.value) return false
    
    // Allow dropping between different views
    if (dragSource.value !== dropTarget.value) return true
    
    // Allow reordering within the same view
    return true
  })
  
  const dragPreview = computed(() => {
    if (!draggedBlock.value) return null
    
    return {
      content: draggedBlock.value.content || `${draggedBlock.value.type} block`,
      type: draggedBlock.value.type,
      position: dragCurrentPosition.value
    }
  })
  
  // ============================================================================
  // DRAG OPERATIONS
  // ============================================================================
  
  /**
   * Start dragging a block
   */
  function startDrag(
    blockId: string, 
    startPos: Position, 
    source: 'document' | 'whiteboard',
    event?: MouseEvent | TouchEvent
  ) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    isDragging.value = true
    draggedBlock.value = block
    draggedBlockId.value = blockId
    dragStartPosition.value = startPos
    dragCurrentPosition.value = startPos
    dragSource.value = source
    
    // Calculate offset for smooth dragging
    if (event) {
      const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
      const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
      
      dragOffset.value = {
        x: clientX - startPos.x,
        y: clientY - startPos.y
      }
    }
    
    // Add global event listeners
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchmove', handleDragMove)
    document.addEventListener('touchend', handleDragEnd)
    
    // Prevent default drag behavior
    if (event) {
      event.preventDefault()
    }
    
    return true
  }
  
  /**
   * Handle drag movement
   */
  function handleDragMove(event: MouseEvent | TouchEvent) {
    if (!isDragging.value) return
    
    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
    
    dragCurrentPosition.value = {
      x: clientX - dragOffset.value.x,
      y: clientY - dragOffset.value.y
    }
    
    // Update drop target based on current position
    updateDropTarget(clientX, clientY)
  }
  
  /**
   * Handle drag end
   */
  function handleDragEnd(event: MouseEvent | TouchEvent) {
    if (!isDragging.value) return
    
    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY
    
    // Perform drop operation
    if (canDrop.value && dropTarget.value && draggedBlockId.value) {
      performDrop(draggedBlockId.value, { x: clientX, y: clientY })
    }
    
    // Clean up
    endDrag()
  }
  
  /**
   * End drag operation
   */
  function endDrag() {
    isDragging.value = false
    draggedBlock.value = null
    draggedBlockId.value = null
    dragSource.value = null
    dropTarget.value = null
    dropZone.value = null
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('touchend', handleDragEnd)
  }
  
  // ============================================================================
  // DROP OPERATIONS
  // ============================================================================
  
  /**
   * Set drop target
   */
  function setDropTarget(target: 'document' | 'whiteboard', zone?: string) {
    dropTarget.value = target
    dropZone.value = zone || null
  }
  
  /**
   * Clear drop target
   */
  function clearDropTarget() {
    dropTarget.value = null
    dropZone.value = null
  }
  
  /**
   * Update drop target based on mouse position
   */
  function updateDropTarget(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY)
    if (!element) return
    
    // Check for document drop zones
    const documentZone = element.closest('[data-drop-zone="document"]')
    if (documentZone) {
      setDropTarget('document', documentZone.getAttribute('data-drop-id') || undefined)
      return
    }
    
    // Check for whiteboard drop zones
    const whiteboardZone = element.closest('[data-drop-zone="whiteboard"]')
    if (whiteboardZone) {
      setDropTarget('whiteboard', whiteboardZone.getAttribute('data-drop-id') || undefined)
      return
    }
    
    // Clear drop target if not over a valid zone
    clearDropTarget()
  }
  
  /**
   * Perform drop operation
   */
  function performDrop(blockId: string, dropPosition: Position) {
    if (!dropTarget.value || !dragSource.value) return false
    
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    try {
      if (dragSource.value === 'document' && dropTarget.value === 'whiteboard') {
        // Document to whiteboard
        return handleDocumentToWhiteboardDrop(blockId, dropPosition)
      } else if (dragSource.value === 'whiteboard' && dropTarget.value === 'document') {
        // Whiteboard to document
        return handleWhiteboardToDocumentDrop(blockId, dropPosition)
      } else if (dragSource.value === dropTarget.value) {
        // Same view reordering
        return handleSameViewDrop(blockId, dropPosition)
      }
    } catch (error) {
      console.error('Drop operation failed:', error)
      return false
    }
    
    return false
  }
  
  /**
   * Handle document to whiteboard drop
   */
  function handleDocumentToWhiteboardDrop(blockId: string, dropPosition: Position): boolean {
    const canvasId = unifiedStore.currentCanvasId
    if (!canvasId) {
      // Create new canvas if none exists
      const canvas = unifiedStore.createCanvas('Document Canvas')
      return unifiedIntegration.handleDocumentToWhiteboardDrag(blockId, dropPosition, canvas.id)
    }
    
    return unifiedIntegration.handleDocumentToWhiteboardDrag(blockId, dropPosition, canvasId)
  }
  
  /**
   * Handle whiteboard to document drop
   */
  function handleWhiteboardToDocumentDrop(blockId: string, dropPosition: Position): boolean {
    const documentId = unifiedStore.currentDocumentId
    if (!documentId) {
      // Create new document if none exists
      const document = unifiedStore.createDocument('Whiteboard Document')
      return unifiedIntegration.handleWhiteboardToDocumentDrag(blockId, document.id, dropZone.value || undefined)
    }
    
    return unifiedIntegration.handleWhiteboardToDocumentDrag(blockId, documentId, dropZone.value || undefined)
  }
  
  /**
   * Handle same view drop (reordering)
   */
  function handleSameViewDrop(blockId: string, dropPosition: Position): boolean {
    if (dropTarget.value === 'document') {
      // Handle document reordering
      return handleDocumentReorder(blockId, dropZone.value)
    } else if (dropTarget.value === 'whiteboard') {
      // Handle whiteboard repositioning
      return handleWhiteboardReposition(blockId, dropPosition)
    }
    
    return false
  }
  
  /**
   * Handle document reordering
   */
  function handleDocumentReorder(blockId: string, insertAfterBlockId?: string | null): boolean {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    // Remove from current position
    if (block.parentId) {
      const parent = unifiedStore.blocks.get(block.parentId)
      if (parent) {
        parent.children = parent.children.filter(id => id !== blockId)
      }
    } else {
      // Remove from document root
      const currentDoc = unifiedStore.documents.get(unifiedStore.currentDocumentId || '')
      if (currentDoc) {
        currentDoc.rootBlockIds = currentDoc.rootBlockIds.filter(id => id !== blockId)
      }
    }
    
    // Insert at new position
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
          const currentDoc = unifiedStore.documents.get(unifiedStore.currentDocumentId || '')
          if (currentDoc) {
            const insertIndex = currentDoc.rootBlockIds.indexOf(insertAfterBlockId) + 1
            currentDoc.rootBlockIds.splice(insertIndex, 0, blockId)
            block.parentId = undefined
            block.position = insertIndex
          }
        }
      }
    } else {
      // Insert at end
      const currentDoc = unifiedStore.documents.get(unifiedStore.currentDocumentId || '')
      if (currentDoc) {
        currentDoc.rootBlockIds.push(blockId)
        block.parentId = undefined
        block.position = currentDoc.rootBlockIds.length - 1
      }
    }
    
    return true
  }
  
  /**
   * Handle whiteboard repositioning
   */
  function handleWhiteboardReposition(blockId: string, newPosition: Position): boolean {
    const result = unifiedStore.updateBlock(blockId, {
      spatialProperties: { position: newPosition }
    })
    
    return result.success
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Check if a position is within a drop zone
   */
  function isInDropZone(position: Position, zone: DOMRect): boolean {
    return position.x >= zone.left && 
           position.x <= zone.right && 
           position.y >= zone.top && 
           position.y <= zone.bottom
  }
  
  /**
   * Get drop zone at position
   */
  function getDropZoneAtPosition(position: Position): Element | null {
    return document.elementFromPoint(position.x, position.y)?.closest('[data-drop-zone]') || null
  }
  
  return {
    // State
    isDragging,
    draggedBlock,
    draggedBlockId,
    dragStartPosition,
    dragCurrentPosition,
    dragSource,
    dropTarget,
    dropZone,
    
    // Computed
    canDrop,
    dragPreview,
    
    // Actions
    startDrag,
    endDrag,
    setDropTarget,
    clearDropTarget,
    performDrop,
    
    // Utilities
    isInDropZone,
    getDropZoneAtPosition
  }
}
