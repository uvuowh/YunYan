import { ref, computed } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import type { UnifiedBlock, BlockReference } from '@/types/unified'

/**
 * Block References Composable
 * Handles block references, transclusion, and semantic relationships
 */
export function useBlockReferences() {
  const unifiedStore = useUnifiedStore()
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const isCreatingReference = ref(false)
  const referenceType = ref<'embed' | 'link' | 'mention'>('link')
  const sourceBlockId = ref<string | null>(null)
  const targetBlockId = ref<string | null>(null)
  
  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================
  
  // Get all blocks that reference a specific block
  const getBlockReferences = computed(() => (blockId: string) => {
    const references: { block: UnifiedBlock; reference: BlockReference }[] = []
    
    for (const block of unifiedStore.blocks.values()) {
      for (const ref of block.metadata.references) {
        if (ref.sourceBlockId === blockId) {
          references.push({ block, reference: ref })
        }
      }
    }
    
    return references
  })
  
  // Get all blocks that a specific block references
  const getBlockBacklinks = computed(() => (blockId: string) => {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return []
    
    return block.metadata.backlinks
      .map(id => unifiedStore.blocks.get(id))
      .filter(Boolean) as UnifiedBlock[]
  })
  
  // Get reference graph for visualization
  const referenceGraph = computed(() => {
    const nodes: { id: string; label: string; type: string }[] = []
    const edges: { from: string; to: string; type: string }[] = []
    
    for (const block of unifiedStore.blocks.values()) {
      nodes.push({
        id: block.id,
        label: block.content.slice(0, 50) + (block.content.length > 50 ? '...' : ''),
        type: block.type
      })
      
      for (const ref of block.metadata.references) {
        edges.push({
          from: block.id,
          to: ref.sourceBlockId,
          type: ref.referenceType
        })
      }
    }
    
    return { nodes, edges }
  })
  
  // ============================================================================
  // REFERENCE OPERATIONS
  // ============================================================================
  
  /**
   * Create a reference between two blocks
   */
  function createReference(
    fromBlockId: string,
    toBlockId: string,
    type: 'embed' | 'link' | 'mention' = 'link',
    context?: string
  ): boolean {
    const fromBlock = unifiedStore.blocks.get(fromBlockId)
    const toBlock = unifiedStore.blocks.get(toBlockId)
    
    if (!fromBlock || !toBlock) return false
    
    // Create reference
    const reference: BlockReference = {
      sourceBlockId: toBlockId,
      referenceType: type,
      context
    }
    
    // Add reference to source block
    fromBlock.metadata.references.push(reference)
    
    // Add backlink to target block
    if (!toBlock.metadata.backlinks.includes(fromBlockId)) {
      toBlock.metadata.backlinks.push(fromBlockId)
    }
    
    // Update blocks
    unifiedStore.updateBlock(fromBlockId, { metadata: fromBlock.metadata })
    unifiedStore.updateBlock(toBlockId, { metadata: toBlock.metadata })
    
    return true
  }
  
  /**
   * Remove a reference between two blocks
   */
  function removeReference(fromBlockId: string, toBlockId: string): boolean {
    const fromBlock = unifiedStore.blocks.get(fromBlockId)
    const toBlock = unifiedStore.blocks.get(toBlockId)
    
    if (!fromBlock || !toBlock) return false
    
    // Remove reference from source block
    fromBlock.metadata.references = fromBlock.metadata.references.filter(
      ref => ref.sourceBlockId !== toBlockId
    )
    
    // Remove backlink from target block
    toBlock.metadata.backlinks = toBlock.metadata.backlinks.filter(
      id => id !== fromBlockId
    )
    
    // Update blocks
    unifiedStore.updateBlock(fromBlockId, { metadata: fromBlock.metadata })
    unifiedStore.updateBlock(toBlockId, { metadata: toBlock.metadata })
    
    return true
  }
  
  /**
   * Create bidirectional reference (both blocks reference each other)
   */
  function createBidirectionalReference(
    blockId1: string,
    blockId2: string,
    type: 'embed' | 'link' | 'mention' = 'link'
  ): boolean {
    const success1 = createReference(blockId1, blockId2, type)
    const success2 = createReference(blockId2, blockId1, type)
    
    return success1 && success2
  }
  
  /**
   * Auto-detect and create references based on content
   */
  function autoDetectReferences(blockId: string): number {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return 0
    
    let referencesCreated = 0
    const content = block.content.toLowerCase()
    
    // Look for block references in content (e.g., [[Block Title]] or @BlockId)
    const blockRefRegex = /\[\[([^\]]+)\]\]/g
    const idRefRegex = /@([a-zA-Z0-9-]+)/g
    
    let match
    
    // Handle [[Block Title]] references
    while ((match = blockRefRegex.exec(content)) !== null) {
      const title = match[1]
      const referencedBlock = findBlockByTitle(title)
      
      if (referencedBlock && referencedBlock.id !== blockId) {
        if (createReference(blockId, referencedBlock.id, 'link', match[0])) {
          referencesCreated++
        }
      }
    }
    
    // Handle @BlockId references
    while ((match = idRefRegex.exec(content)) !== null) {
      const referencedId = match[1]
      const referencedBlock = unifiedStore.blocks.get(referencedId)
      
      if (referencedBlock && referencedId !== blockId) {
        if (createReference(blockId, referencedId, 'mention', match[0])) {
          referencesCreated++
        }
      }
    }
    
    return referencesCreated
  }
  
  /**
   * Find block by title or content
   */
  function findBlockByTitle(title: string): UnifiedBlock | null {
    const normalizedTitle = title.toLowerCase().trim()
    
    for (const block of unifiedStore.blocks.values()) {
      // Check if content starts with the title (for headings)
      if (block.content.toLowerCase().startsWith(normalizedTitle)) {
        return block
      }
      
      // Check if content contains the title
      if (block.content.toLowerCase().includes(normalizedTitle)) {
        return block
      }
    }
    
    return null
  }
  
  /**
   * Get transclusion content for embedding
   */
  function getTransclusionContent(blockId: string): string {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return ''
    
    // For transclusion, we might want to include children as well
    let content = block.content
    
    if (block.children.length > 0) {
      const childrenContent = block.children
        .map(childId => {
          const child = unifiedStore.blocks.get(childId)
          return child ? `  ${child.content}` : ''
        })
        .filter(Boolean)
        .join('\n')
      
      if (childrenContent) {
        content += '\n' + childrenContent
      }
    }
    
    return content
  }
  
  /**
   * Update all references when a block's content changes
   */
  function updateReferencesOnContentChange(blockId: string): void {
    // Remove existing auto-detected references
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return
    
    // Remove references that were auto-detected (have context)
    block.metadata.references = block.metadata.references.filter(
      ref => !ref.context || (!ref.context.includes('[[') && !ref.context.includes('@'))
    )
    
    // Re-detect references
    autoDetectReferences(blockId)
  }
  
  /**
   * Get reference suggestions for a block
   */
  function getReferenceSuggestions(blockId: string, query: string): UnifiedBlock[] {
    const block = unifiedStore.blocks.get(blockId)
    if (!block) return []
    
    const normalizedQuery = query.toLowerCase()
    const suggestions: UnifiedBlock[] = []
    
    for (const otherBlock of unifiedStore.blocks.values()) {
      if (otherBlock.id === blockId) continue
      
      // Check if already referenced
      const alreadyReferenced = block.metadata.references.some(
        ref => ref.sourceBlockId === otherBlock.id
      )
      if (alreadyReferenced) continue
      
      // Score based on content similarity
      const content = otherBlock.content.toLowerCase()
      if (content.includes(normalizedQuery)) {
        suggestions.push(otherBlock)
      }
    }
    
    // Sort by relevance (simple scoring)
    return suggestions.sort((a, b) => {
      const aScore = a.content.toLowerCase().indexOf(normalizedQuery)
      const bScore = b.content.toLowerCase().indexOf(normalizedQuery)
      return aScore - bScore
    }).slice(0, 10) // Limit to top 10 suggestions
  }
  
  // ============================================================================
  // REFERENCE UI HELPERS
  // ============================================================================
  
  function startReferenceCreation(fromBlockId: string) {
    isCreatingReference.value = true
    sourceBlockId.value = fromBlockId
    targetBlockId.value = null
  }
  
  function selectReferenceTarget(toBlockId: string) {
    targetBlockId.value = toBlockId
  }
  
  function completeReferenceCreation() {
    if (sourceBlockId.value && targetBlockId.value) {
      createReference(
        sourceBlockId.value,
        targetBlockId.value,
        referenceType.value
      )
    }
    
    cancelReferenceCreation()
  }
  
  function cancelReferenceCreation() {
    isCreatingReference.value = false
    sourceBlockId.value = null
    targetBlockId.value = null
  }
  
  return {
    // State
    isCreatingReference,
    referenceType,
    sourceBlockId,
    targetBlockId,
    
    // Computed
    getBlockReferences,
    getBlockBacklinks,
    referenceGraph,
    
    // Operations
    createReference,
    removeReference,
    createBidirectionalReference,
    autoDetectReferences,
    findBlockByTitle,
    getTransclusionContent,
    updateReferencesOnContentChange,
    getReferenceSuggestions,
    
    // UI Helpers
    startReferenceCreation,
    selectReferenceTarget,
    completeReferenceCreation,
    cancelReferenceCreation
  }
}
