import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type {
  UnifiedBlock,
  UnifiedBlockType,
  DocumentContainer,
  CanvasContainer,
  UnifiedWorkspace,
  CreateBlockOptions,
  UpdateBlockOptions,
  BlockQuery,
  QueryResult,
  BlockOperationResult,
  SpatialProperties,
  Position,
  Size,
  UnifiedSyncEvent,
  BlockReference
} from '@/types/unified'

/**
 * Unified Store - Single source of truth for all blocks, documents, and canvases
 * Replaces the separate filesystem and whiteboard stores with a unified block-based approach
 */
export const useUnifiedStore = defineStore('unified', () => {
  // ============================================================================
  // CORE STATE
  // ============================================================================
  
  const workspace = ref<UnifiedWorkspace>({
    id: uuidv4(),
    name: 'Default Workspace',
    blocks: new Map(),
    documents: new Map(),
    canvases: new Map(),
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      totalBlocks: 0,
      totalDocuments: 0,
      totalCanvases: 0
    }
  })

  // Current context
  const currentDocumentId = ref<string>()
  const currentCanvasId = ref<string>()
  const selectedBlockIds = ref<string[]>([])

  // ============================================================================
  // COMPUTED GETTERS
  // ============================================================================

  const blocks = computed(() => workspace.value.blocks)
  const documents = computed(() => workspace.value.documents)
  const canvases = computed(() => workspace.value.canvases)

  // Current document blocks in hierarchical order
  const currentDocumentBlocks = computed(() => {
    if (!currentDocumentId.value) return []
    const doc = documents.value.get(currentDocumentId.value)
    if (!doc) return []
    
    return getDocumentBlockTree(doc.rootBlockIds)
  })

  // Current canvas blocks with spatial properties
  const currentCanvasBlocks = computed(() => {
    if (!currentCanvasId.value) return []
    
    return Array.from(blocks.value.values()).filter(block => 
      block.spatialProperties?.canvasId === currentCanvasId.value &&
      block.spatialProperties?.isVisible
    ).sort((a, b) => (a.spatialProperties?.layer || 0) - (b.spatialProperties?.layer || 0))
  })

  // Selected blocks
  const selectedBlocks = computed(() => 
    selectedBlockIds.value.map(id => blocks.value.get(id)).filter(Boolean) as UnifiedBlock[]
  )

  // Statistics
  const stats = computed(() => ({
    totalBlocks: blocks.value.size,
    totalDocuments: documents.value.size,
    totalCanvases: canvases.value.size,
    blocksWithSpatialProperties: Array.from(blocks.value.values()).filter(b => b.spatialProperties).length
  }))

  // ============================================================================
  // CORE BLOCK OPERATIONS
  // ============================================================================

  /**
   * Create a new unified block
   */
  function createBlock(
    type: UnifiedBlockType,
    content: string = '',
    options: CreateBlockOptions = {}
  ): BlockOperationResult {
    try {
      const now = new Date()
      const blockId = uuidv4()
      
      const block: UnifiedBlock = {
        id: blockId,
        type,
        content,
        properties: options.properties || {},
        children: [],
        parentId: options.parentId,
        position: options.position || 0,
        metadata: {
          createdAt: now,
          updatedAt: now,
          tags: options.tags || [],
          locked: false,
          references: [],
          backlinks: []
        }
      }

      // Add spatial properties if adding to canvas
      if (options.addToCanvas && options.spatialPosition) {
        block.spatialProperties = {
          canvasId: options.addToCanvas,
          position: options.spatialPosition,
          size: options.spatialSize || { width: 200, height: 100 },
          style: getDefaultSpatialStyle(),
          connections: [],
          isVisible: true,
          layer: 0,
          locked: false
        }
      }

      // Add to workspace
      workspace.value.blocks.set(blockId, block)

      // Handle hierarchical placement
      if (options.parentId) {
        const parent = blocks.value.get(options.parentId)
        if (parent) {
          parent.children.push(blockId)
          block.position = parent.children.length - 1
        }
      } else if (currentDocumentId.value) {
        // Add as root block to current document
        const doc = documents.value.get(currentDocumentId.value)
        if (doc) {
          doc.rootBlockIds.push(blockId)
          block.position = doc.rootBlockIds.length - 1
        }
      }

      // Handle canvas placement
      if (options.addToCanvas) {
        const canvas = canvases.value.get(options.addToCanvas)
        if (canvas && !canvas.blockIds.includes(blockId)) {
          canvas.blockIds.push(blockId)
        }
      }

      updateWorkspaceMetadata()
      emitSyncEvent('block_created', blockId, block)

      return { success: true, blockId }
    } catch (error) {
      console.error('Failed to create block:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Update an existing block
   */
  function updateBlock(blockId: string, updates: UpdateBlockOptions): BlockOperationResult {
    try {
      const block = blocks.value.get(blockId)
      if (!block) {
        return { success: false, error: 'Block not found' }
      }

      const now = new Date()
      
      // Update basic properties
      if (updates.content !== undefined) block.content = updates.content
      if (updates.type !== undefined) block.type = updates.type
      if (updates.properties !== undefined) {
        block.properties = { ...block.properties, ...updates.properties }
      }

      // Update spatial properties
      if (updates.spatialProperties) {
        if (block.spatialProperties) {
          block.spatialProperties = { ...block.spatialProperties, ...updates.spatialProperties }
        } else {
          // Create spatial properties if they don't exist
          block.spatialProperties = {
            canvasId: updates.spatialProperties.canvasId || currentCanvasId.value || '',
            position: updates.spatialProperties.position || { x: 0, y: 0 },
            size: updates.spatialProperties.size || { width: 200, height: 100 },
            style: updates.spatialProperties.style || getDefaultSpatialStyle(),
            connections: updates.spatialProperties.connections || [],
            isVisible: updates.spatialProperties.isVisible ?? true,
            layer: updates.spatialProperties.layer || 0,
            locked: updates.spatialProperties.locked || false
          }
        }
      }

      // Update tags
      if (updates.tags !== undefined) block.metadata.tags = updates.tags
      if (updates.addTags) block.metadata.tags.push(...updates.addTags)
      if (updates.removeTags) {
        block.metadata.tags = block.metadata.tags.filter(tag => !updates.removeTags!.includes(tag))
      }

      // Update metadata
      block.metadata.updatedAt = now

      updateWorkspaceMetadata()
      emitSyncEvent('block_updated', blockId, updates)

      return { success: true, blockId }
    } catch (error) {
      console.error('Failed to update block:', error)
      return { success: false, error: String(error) }
    }
  }

  /**
   * Delete a block and handle cleanup
   */
  function deleteBlock(blockId: string): BlockOperationResult {
    try {
      const block = blocks.value.get(blockId)
      if (!block) {
        return { success: false, error: 'Block not found' }
      }

      const affectedBlocks: string[] = []

      // Remove from parent's children
      if (block.parentId) {
        const parent = blocks.value.get(block.parentId)
        if (parent) {
          parent.children = parent.children.filter(id => id !== blockId)
          affectedBlocks.push(parent.id)
        }
      }

      // Remove from document root blocks
      for (const doc of documents.value.values()) {
        if (doc.rootBlockIds.includes(blockId)) {
          doc.rootBlockIds = doc.rootBlockIds.filter(id => id !== blockId)
        }
      }

      // Remove from canvas blocks
      for (const canvas of canvases.value.values()) {
        if (canvas.blockIds.includes(blockId)) {
          canvas.blockIds = canvas.blockIds.filter(id => id !== blockId)
        }
      }

      // Handle children (move them up or delete them)
      for (const childId of block.children) {
        const child = blocks.value.get(childId)
        if (child) {
          if (block.parentId) {
            // Move children to grandparent
            child.parentId = block.parentId
            const grandparent = blocks.value.get(block.parentId)
            if (grandparent) {
              grandparent.children.push(childId)
            }
          } else {
            // Make children root blocks
            child.parentId = undefined
            if (currentDocumentId.value) {
              const doc = documents.value.get(currentDocumentId.value)
              if (doc) {
                doc.rootBlockIds.push(childId)
              }
            }
          }
          affectedBlocks.push(childId)
        }
      }

      // Remove spatial connections
      if (block.spatialProperties) {
        for (const otherBlock of blocks.value.values()) {
          if (otherBlock.spatialProperties) {
            otherBlock.spatialProperties.connections = otherBlock.spatialProperties.connections.filter(
              conn => conn.targetBlockId !== blockId
            )
          }
        }
      }

      // Remove from workspace
      workspace.value.blocks.delete(blockId)

      // Remove from selection
      selectedBlockIds.value = selectedBlockIds.value.filter(id => id !== blockId)

      updateWorkspaceMetadata()
      emitSyncEvent('block_deleted', blockId, { affectedBlocks })

      return { success: true, blockId, affectedBlocks }
    } catch (error) {
      console.error('Failed to delete block:', error)
      return { success: false, error: String(error) }
    }
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function getDocumentBlockTree(rootBlockIds: string[]): UnifiedBlock[] {
    const result: UnifiedBlock[] = []
    
    for (const blockId of rootBlockIds) {
      const block = blocks.value.get(blockId)
      if (block) {
        result.push(block)
        // Recursively add children
        result.push(...getDocumentBlockTree(block.children))
      }
    }
    
    return result
  }

  function getDefaultSpatialStyle() {
    return {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 8,
      fontSize: 14,
      fontColor: '#374151',
      opacity: 1,
      shadow: false,
      shadowColor: '#000000',
      shadowBlur: 4,
      rotation: 0,
      skewX: 0,
      skewY: 0
    }
  }

  function updateWorkspaceMetadata() {
    workspace.value.metadata.updatedAt = new Date()
    workspace.value.metadata.totalBlocks = blocks.value.size
    workspace.value.metadata.totalDocuments = documents.value.size
    workspace.value.metadata.totalCanvases = canvases.value.size
  }

  function emitSyncEvent(type: UnifiedSyncEvent['type'], blockId: string, data: any) {
    // TODO: Implement real-time sync event emission
    console.log('Sync event:', { type, blockId, data })
  }

  // ============================================================================
  // DOCUMENT OPERATIONS
  // ============================================================================

  function createDocument(title: string = 'Untitled Document'): DocumentContainer {
    const now = new Date()
    const documentId = uuidv4()

    const document: DocumentContainer = {
      id: documentId,
      title,
      rootBlockIds: [],
      metadata: {
        tags: [],
        category: 'general',
        author: 'user',
        createdAt: now,
        updatedAt: now,
        wordCount: 0,
        readingTime: 0,
        lastModified: now
      },
      path: `/${title.toLowerCase().replace(/\s+/g, '-')}.md`
    }

    workspace.value.documents.set(documentId, document)
    currentDocumentId.value = documentId
    updateWorkspaceMetadata()

    return document
  }

  function setCurrentDocument(documentId: string) {
    if (documents.value.has(documentId)) {
      currentDocumentId.value = documentId
    }
  }

  // ============================================================================
  // CANVAS OPERATIONS
  // ============================================================================

  function createCanvas(name: string = 'New Canvas'): CanvasContainer {
    const now = new Date()
    const canvasId = uuidv4()

    const canvas: CanvasContainer = {
      id: canvasId,
      name,
      blockIds: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      settings: {
        gridEnabled: true,
        snapToGrid: false,
        gridSize: 20,
        backgroundColor: '#ffffff',
        showMinimap: true,
        allowOverlap: true,
        autoLayout: false
      },
      metadata: {
        createdAt: now,
        updatedAt: now,
        tags: []
      }
    }

    workspace.value.canvases.set(canvasId, canvas)
    currentCanvasId.value = canvasId
    updateWorkspaceMetadata()

    return canvas
  }

  function setCurrentCanvas(canvasId: string) {
    if (canvases.value.has(canvasId)) {
      currentCanvasId.value = canvasId
    }
  }

  // ============================================================================
  // SPATIAL OPERATIONS
  // ============================================================================

  function addBlockToCanvas(blockId: string, canvasId: string, position: Position): BlockOperationResult {
    const block = blocks.value.get(blockId)
    const canvas = canvases.value.get(canvasId)

    if (!block || !canvas) {
      return { success: false, error: 'Block or canvas not found' }
    }

    // Add spatial properties if they don't exist
    if (!block.spatialProperties) {
      block.spatialProperties = {
        canvasId,
        position,
        size: { width: 200, height: 100 },
        style: getDefaultSpatialStyle(),
        connections: [],
        isVisible: true,
        layer: 0,
        locked: false
      }
    } else {
      // Update existing spatial properties
      block.spatialProperties.canvasId = canvasId
      block.spatialProperties.position = position
      block.spatialProperties.isVisible = true
    }

    // Add to canvas if not already there
    if (!canvas.blockIds.includes(blockId)) {
      canvas.blockIds.push(blockId)
    }

    block.metadata.updatedAt = new Date()
    block.metadata.lastCanvasId = canvasId

    emitSyncEvent('spatial_updated', blockId, { canvasId, position })
    return { success: true, blockId }
  }

  function removeBlockFromCanvas(blockId: string, canvasId: string): BlockOperationResult {
    const block = blocks.value.get(blockId)
    const canvas = canvases.value.get(canvasId)

    if (!block || !canvas) {
      return { success: false, error: 'Block or canvas not found' }
    }

    // Hide from canvas
    if (block.spatialProperties && block.spatialProperties.canvasId === canvasId) {
      block.spatialProperties.isVisible = false
    }

    // Remove from canvas block list
    canvas.blockIds = canvas.blockIds.filter(id => id !== blockId)

    block.metadata.updatedAt = new Date()
    emitSyncEvent('spatial_updated', blockId, { canvasId, removed: true })

    return { success: true, blockId }
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

  function selectAll() {
    if (currentDocumentId.value) {
      selectedBlockIds.value = currentDocumentBlocks.value.map(block => block.id)
    } else if (currentCanvasId.value) {
      selectedBlockIds.value = currentCanvasBlocks.value.map(block => block.id)
    }
  }

  // ============================================================================
  // ADVANCED QUERY OPERATIONS
  // ============================================================================

  function queryBlocks(query: BlockQuery): QueryResult {
    let matchingBlocks: UnifiedBlock[] = []

    for (const block of blocks.value.values()) {
      if (matchesQuery(block, query)) {
        matchingBlocks.push(block)
      }
    }

    // Apply sorting
    if (query.sort_by) {
      matchingBlocks.sort((a, b) => {
        switch (query.sort_by) {
          case 'createdAt':
            return query.sort_order === 'desc'
              ? b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime()
              : a.metadata.createdAt.getTime() - b.metadata.createdAt.getTime()
          case 'updatedAt':
            return query.sort_order === 'desc'
              ? b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime()
              : a.metadata.updatedAt.getTime() - b.metadata.updatedAt.getTime()
          case 'position':
            return a.position - b.position
          default:
            return 0
        }
      })
    }

    const totalCount = matchingBlocks.length

    // Apply pagination
    const offset = query.offset || 0
    const limit = query.limit || matchingBlocks.length
    const paginatedBlocks = matchingBlocks.slice(offset, offset + limit)

    return {
      blocks: paginatedBlocks,
      totalCount,
      hasMore: offset + limit < totalCount
    }
  }

  function matchesQuery(block: UnifiedBlock, query: BlockQuery): boolean {
    // Content filters
    if (query.content_contains && !block.content.toLowerCase().includes(query.content_contains.toLowerCase())) {
      return false
    }

    if (query.content_regex) {
      try {
        const regex = new RegExp(query.content_regex, 'i')
        if (!regex.test(block.content)) return false
      } catch {
        return false
      }
    }

    // Type filters
    if (query.types && !query.types.includes(block.type)) {
      return false
    }

    if (query.exclude_types && query.exclude_types.includes(block.type)) {
      return false
    }

    // Hierarchical filters
    if (query.has_parent !== undefined) {
      if (query.has_parent && !block.parentId) return false
      if (!query.has_parent && block.parentId) return false
    }

    if (query.has_children !== undefined) {
      if (query.has_children && block.children.length === 0) return false
      if (!query.has_children && block.children.length > 0) return false
    }

    if (query.parent_id && block.parentId !== query.parent_id) {
      return false
    }

    // Spatial filters
    if (query.on_canvas) {
      if (!block.spatialProperties ||
          block.spatialProperties.canvasId !== query.on_canvas ||
          !block.spatialProperties.isVisible) {
        return false
      }
    }

    if (query.in_region && block.spatialProperties) {
      const { position, size } = block.spatialProperties
      const { top_left, bottom_right } = query.in_region

      if (position.x < top_left.x ||
          position.y < top_left.y ||
          position.x + size.width > bottom_right.x ||
          position.y + size.height > bottom_right.y) {
        return false
      }
    }

    // Metadata filters
    if (query.tags && !query.tags.every(tag => block.metadata.tags.includes(tag))) {
      return false
    }

    if (query.created_after && block.metadata.createdAt <= query.created_after) {
      return false
    }

    if (query.created_before && block.metadata.createdAt >= query.created_before) {
      return false
    }

    return true
  }

  // ============================================================================
  // BLOCK REFERENCE OPERATIONS
  // ============================================================================

  function createBlockReference(
    fromBlockId: string,
    toBlockId: string,
    referenceType: 'embed' | 'link' | 'mention' = 'link',
    context?: string
  ): BlockOperationResult {
    const fromBlock = blocks.value.get(fromBlockId)
    const toBlock = blocks.value.get(toBlockId)

    if (!fromBlock || !toBlock) {
      return { success: false, error: 'Block not found' }
    }

    const reference: BlockReference = {
      sourceBlockId: toBlockId,
      referenceType,
      context
    }

    // Add reference to source block
    fromBlock.metadata.references.push(reference)

    // Add backlink to target block
    if (!toBlock.metadata.backlinks.includes(fromBlockId)) {
      toBlock.metadata.backlinks.push(fromBlockId)
    }

    // Update metadata timestamps
    const now = new Date()
    fromBlock.metadata.updatedAt = now
    toBlock.metadata.updatedAt = now

    updateWorkspaceMetadata()
    emitSyncEvent('block_updated', fromBlockId, { references: fromBlock.metadata.references })

    return { success: true, blockId: fromBlockId, affectedBlocks: [toBlockId] }
  }

  function removeBlockReference(fromBlockId: string, toBlockId: string): BlockOperationResult {
    const fromBlock = blocks.value.get(fromBlockId)
    const toBlock = blocks.value.get(toBlockId)

    if (!fromBlock || !toBlock) {
      return { success: false, error: 'Block not found' }
    }

    // Remove reference from source block
    fromBlock.metadata.references = fromBlock.metadata.references.filter(
      ref => ref.sourceBlockId !== toBlockId
    )

    // Remove backlink from target block
    toBlock.metadata.backlinks = toBlock.metadata.backlinks.filter(
      id => id !== fromBlockId
    )

    // Update metadata timestamps
    const now = new Date()
    fromBlock.metadata.updatedAt = now
    toBlock.metadata.updatedAt = now

    updateWorkspaceMetadata()
    emitSyncEvent('block_updated', fromBlockId, { references: fromBlock.metadata.references })

    return { success: true, blockId: fromBlockId, affectedBlocks: [toBlockId] }
  }

  // ============================================================================
  // RETURN STORE INTERFACE
  // ============================================================================

  return {
    // State
    workspace,
    currentDocumentId,
    currentCanvasId,
    selectedBlockIds,

    // Computed
    blocks,
    documents,
    canvases,
    currentDocumentBlocks,
    currentCanvasBlocks,
    selectedBlocks,
    stats,

    // Block Operations
    createBlock,
    updateBlock,
    deleteBlock,

    // Document Operations
    createDocument,
    setCurrentDocument,

    // Canvas Operations
    createCanvas,
    setCurrentCanvas,

    // Spatial Operations
    addBlockToCanvas,
    removeBlockFromCanvas,

    // Selection Operations
    selectBlock,
    clearSelection,
    selectAll,

    // Advanced Operations
    queryBlocks,
    createBlockReference,
    removeBlockReference
  }
})
