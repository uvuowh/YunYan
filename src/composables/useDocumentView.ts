import { computed, ref } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import type { 
  UnifiedBlock, 
  UnifiedBlockType, 
  CreateBlockOptions,
  UpdateBlockOptions 
} from '@/types/unified'

/**
 * Document View Adapter
 * Presents unified blocks in a hierarchical document structure
 * Provides document-specific operations while working with the unified store
 */
export function useDocumentView() {
  const unifiedStore = useUnifiedStore()
  
  // ============================================================================
  // DOCUMENT-SPECIFIC STATE
  // ============================================================================
  
  const showPreview = ref(false)
  const selectedBlockIds = ref<string[]>([])
  
  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  // Current document blocks in hierarchical order
  const documentBlocks = computed(() => unifiedStore.currentDocumentBlocks)
  
  // Current document metadata
  const currentDocument = computed(() => {
    if (!unifiedStore.currentDocumentId) return null
    return unifiedStore.documents.get(unifiedStore.currentDocumentId)
  })
  
  // Document statistics
  const documentStats = computed(() => {
    const blocks = documentBlocks.value
    const wordCount = blocks.reduce((count, block) => {
      return count + (block.content.split(/\s+/).length || 0)
    }, 0)
    
    return {
      blockCount: blocks.length,
      wordCount,
      readingTime: Math.ceil(wordCount / 200), // Assuming 200 words per minute
      lastModified: blocks.reduce((latest, block) => {
        return block.metadata.updatedAt > latest ? block.metadata.updatedAt : latest
      }, new Date(0))
    }
  })
  
  // Hierarchical block tree for outline view
  const blockTree = computed(() => {
    const buildTree = (blockIds: string[], level = 0): BlockTreeNode[] => {
      return blockIds.map(blockId => {
        const block = unifiedStore.blocks.get(blockId)
        if (!block) return null
        
        return {
          block,
          level,
          children: buildTree(block.children, level + 1),
          hasChildren: block.children.length > 0,
          isExpanded: true // TODO: Make this configurable
        }
      }).filter(Boolean) as BlockTreeNode[]
    }
    
    const doc = currentDocument.value
    return doc ? buildTree(doc.rootBlockIds) : []
  })
  
  // ============================================================================
  // DOCUMENT OPERATIONS
  // ============================================================================
  
  /**
   * Create a new document
   */
  function createDocument(title?: string) {
    const document = unifiedStore.createDocument(title)
    
    // Create initial paragraph block
    unifiedStore.createBlock('paragraph', '', {
      parentId: undefined // Root level block
    })
    
    return document
  }
  
  /**
   * Create a new block in the document
   */
  function createBlock(
    type: UnifiedBlockType, 
    content: string = '', 
    options: Partial<CreateBlockOptions> = {}
  ) {
    return unifiedStore.createBlock(type, content, {
      ...options,
      // Ensure it's added to current document if no parent specified
      parentId: options.parentId
    })
  }
  
  /**
   * Create a block after another block
   */
  function createBlockAfter(afterBlockId: string, type: UnifiedBlockType = 'paragraph') {
    const afterBlock = unifiedStore.blocks.get(afterBlockId)
    if (!afterBlock) return null
    
    const options: CreateBlockOptions = {
      parentId: afterBlock.parentId,
      position: afterBlock.position + 1
    }
    
    // If the after block has a parent, insert into parent's children
    if (afterBlock.parentId) {
      const parent = unifiedStore.blocks.get(afterBlock.parentId)
      if (parent) {
        const insertIndex = parent.children.indexOf(afterBlockId) + 1
        options.position = insertIndex
      }
    } else {
      // Insert into document root blocks
      const doc = currentDocument.value
      if (doc) {
        const insertIndex = doc.rootBlockIds.indexOf(afterBlockId) + 1
        options.position = insertIndex
      }
    }
    
    return unifiedStore.createBlock(type, '', options)
  }
  
  /**
   * Update block content
   */
  function updateBlockContent(blockId: string, content: string) {
    return unifiedStore.updateBlock(blockId, { content })
  }
  
  /**
   * Move block to different position in hierarchy
   */
  function moveBlock(blockId: string, newParentId?: string, newPosition?: number) {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return false
    
    // Remove from current position
    if (block.parentId) {
      const oldParent = unifiedStore.blocks.get(block.parentId)
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== blockId)
      }
    } else {
      // Remove from document root
      const doc = currentDocument.value
      if (doc) {
        doc.rootBlockIds = doc.rootBlockIds.filter(id => id !== blockId)
      }
    }
    
    // Add to new position
    if (newParentId) {
      const newParent = unifiedStore.blocks.get(newParentId)
      if (newParent) {
        const insertPos = newPosition ?? newParent.children.length
        newParent.children.splice(insertPos, 0, blockId)
        block.parentId = newParentId
        block.position = insertPos
      }
    } else {
      // Add to document root
      const doc = currentDocument.value
      if (doc) {
        const insertPos = newPosition ?? doc.rootBlockIds.length
        doc.rootBlockIds.splice(insertPos, 0, blockId)
        block.parentId = undefined
        block.position = insertPos
      }
    }
    
    return true
  }
  
  /**
   * Convert block to different type
   */
  function convertBlockType(blockId: string, newType: UnifiedBlockType) {
    return unifiedStore.updateBlock(blockId, { type: newType })
  }
  
  /**
   * Add block to whiteboard (cross-view operation)
   */
  function addBlockToWhiteboard(blockId: string, canvasId?: string) {
    const targetCanvasId = canvasId || unifiedStore.currentCanvasId
    if (!targetCanvasId) {
      // Create a new canvas if none exists
      const canvas = unifiedStore.createCanvas('Document Canvas')
      return unifiedStore.addBlockToCanvas(blockId, canvas.id, { x: 100, y: 100 })
    }
    
    return unifiedStore.addBlockToCanvas(blockId, targetCanvasId, { x: 100, y: 100 })
  }
  
  // ============================================================================
  // SELECTION OPERATIONS
  // ============================================================================
  
  function selectBlock(blockId: string, addToSelection = false) {
    if (addToSelection) {
      if (!selectedBlockIds.value.includes(blockId)) {
        selectedBlockIds.value.push(blockId)
      }
    } else {
      selectedBlockIds.value = [blockId]
    }
  }
  
  function clearSelection() {
    selectedBlockIds.value = []
  }
  
  function deleteSelectedBlocks() {
    for (const blockId of selectedBlockIds.value) {
      unifiedStore.deleteBlock(blockId)
    }
    clearSelection()
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Get block depth in hierarchy
   */
  function getBlockDepth(blockId: string): number {
    let depth = 0
    let currentBlock = unifiedStore.blocks.get(blockId)
    
    while (currentBlock?.parentId) {
      depth++
      currentBlock = unifiedStore.blocks.get(currentBlock.parentId)
    }
    
    return depth
  }
  
  /**
   * Get all ancestor blocks
   */
  function getAncestors(blockId: string): UnifiedBlock[] {
    const ancestors: UnifiedBlock[] = []
    let currentBlock = unifiedStore.blocks.get(blockId)
    
    while (currentBlock?.parentId) {
      const parent = unifiedStore.blocks.get(currentBlock.parentId)
      if (parent) {
        ancestors.unshift(parent)
        currentBlock = parent
      } else {
        break
      }
    }
    
    return ancestors
  }
  
  return {
    // State
    showPreview,
    selectedBlockIds,
    
    // Computed
    documentBlocks,
    currentDocument,
    documentStats,
    blockTree,
    
    // Document Operations
    createDocument,
    createBlock,
    createBlockAfter,
    updateBlockContent,
    moveBlock,
    convertBlockType,
    addBlockToWhiteboard,
    
    // Selection Operations
    selectBlock,
    clearSelection,
    deleteSelectedBlocks,
    
    // Utilities
    getBlockDepth,
    getAncestors
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface BlockTreeNode {
  block: UnifiedBlock
  level: number
  children: BlockTreeNode[]
  hasChildren: boolean
  isExpanded: boolean
}
