import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { SyncEvent, SyncState, DocumentNodeLink } from '@/types'
import { useFileSystemStore } from './filesystem'
import { useWhiteboardStore } from './whiteboard'
import { useAppStore } from './app'

export const useSyncStore = defineStore('sync', () => {
  // State
  const syncState = ref<SyncState>({
    lastSyncTime: new Date(),
    pendingChanges: [],
    conflictResolution: 'auto-merge'
  })
  
  const documentNodeLinks = ref<DocumentNodeLink[]>([])
  const isOnline = ref<boolean>(true)
  const syncInProgress = ref<boolean>(false)

  // Store references
  const fileSystemStore = useFileSystemStore()
  const whiteboardStore = useWhiteboardStore()
  const appStore = useAppStore()

  // Getters
  const hasPendingChanges = computed(() => syncState.value.pendingChanges.length > 0)
  const linkCount = computed(() => documentNodeLinks.value.length)
  
  const documentLinks = computed(() => 
    documentNodeLinks.value.filter(link => link.linkType === 'reference' || link.linkType === 'embed')
  )

  // Actions
  function createSyncEvent(
    type: SyncEvent['type'],
    moduleId: string,
    entityId: string,
    data: any
  ): SyncEvent {
    return {
      id: uuidv4(),
      type,
      moduleId,
      entityId,
      data,
      timestamp: new Date(),
      userId: 'current-user' // TODO: Get from auth
    }
  }

  function addPendingChange(event: SyncEvent) {
    syncState.value.pendingChanges.push(event)
    
    // Auto-sync if online
    if (isOnline.value && !syncInProgress.value) {
      processPendingChanges()
    }
  }

  async function processPendingChanges() {
    if (syncInProgress.value || syncState.value.pendingChanges.length === 0) {
      return
    }

    syncInProgress.value = true

    try {
      // Process each pending change
      for (const change of syncState.value.pendingChanges) {
        await processSyncEvent(change)
      }

      // Clear processed changes
      syncState.value.pendingChanges = []
      syncState.value.lastSyncTime = new Date()

    } catch (error) {
      console.error('Sync failed:', error)
      appStore.addError(appStore.createError(
        'SYNC_FAILED',
        'Failed to synchronize changes',
        'sync',
        error
      ))
    } finally {
      syncInProgress.value = false
    }
  }

  async function processSyncEvent(event: SyncEvent) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100))

    switch (event.moduleId) {
      case 'filesystem':
        await processFileSystemEvent(event)
        break
      case 'whiteboard':
        await processWhiteboardEvent(event)
        break
      default:
        console.warn('Unknown module in sync event:', event.moduleId)
    }
  }

  async function processFileSystemEvent(event: SyncEvent) {
    // Handle filesystem sync events
    switch (event.type) {
      case 'create':
        // Document created
        break
      case 'update':
        // Document updated
        syncDocumentToWhiteboard(event.entityId)
        break
      case 'delete':
        // Document deleted
        removeDocumentLinks(event.entityId)
        break
    }
  }

  async function processWhiteboardEvent(event: SyncEvent) {
    // Handle whiteboard sync events
    switch (event.type) {
      case 'create':
        // Node created
        break
      case 'update':
        // Node updated
        syncNodeToDocument(event.entityId)
        break
      case 'delete':
        // Node deleted
        removeNodeLinks(event.entityId)
        break
    }
  }

  function createDocumentNodeLink(
    documentId: string,
    nodeId: string,
    linkType: DocumentNodeLink['linkType'],
    blockId?: string
  ): DocumentNodeLink {
    const link: DocumentNodeLink = {
      documentId,
      nodeId,
      blockId,
      linkType,
      createdAt: new Date()
    }

    documentNodeLinks.value.push(link)
    
    // Create sync event
    addPendingChange(createSyncEvent(
      'create',
      'sync',
      link.documentId + '-' + link.nodeId,
      link
    ))

    return link
  }

  function removeDocumentNodeLink(documentId: string, nodeId: string) {
    const index = documentNodeLinks.value.findIndex(
      link => link.documentId === documentId && link.nodeId === nodeId
    )
    
    if (index > -1) {
      const link = documentNodeLinks.value[index]
      documentNodeLinks.value.splice(index, 1)
      
      // Create sync event
      addPendingChange(createSyncEvent(
        'delete',
        'sync',
        link.documentId + '-' + link.nodeId,
        link
      ))
    }
  }

  function getDocumentLinks(documentId: string): DocumentNodeLink[] {
    return documentNodeLinks.value.filter(link => link.documentId === documentId)
  }

  function getNodeLinks(nodeId: string): DocumentNodeLink[] {
    return documentNodeLinks.value.filter(link => link.nodeId === nodeId)
  }

  function syncDocumentToWhiteboard(documentId: string) {
    const document = fileSystemStore.documents.find(doc => doc.id === documentId)
    if (!document) return

    const links = getDocumentLinks(documentId)
    
    // Update linked nodes with document content
    links.forEach(link => {
      const node = whiteboardStore.currentNodes.find(n => n.id === link.nodeId)
      if (node && link.linkType === 'reference') {
        whiteboardStore.updateNode(link.nodeId, {
          content: `📄 ${document.title}\n${document.content.substring(0, 100)}...`
        })
      }
    })
  }

  function syncNodeToDocument(nodeId: string) {
    const node = whiteboardStore.currentNodes.find(n => n.id === nodeId)
    if (!node) return

    const links = getNodeLinks(nodeId)
    
    // Update linked documents with node content
    links.forEach(link => {
      if (link.linkType === 'bidirectional') {
        const document = fileSystemStore.documents.find(doc => doc.id === link.documentId)
        if (document) {
          // Add node reference to document
          const nodeRef = `\n\n[Whiteboard Node: ${node.content}]`
          fileSystemStore.updateDocument(link.documentId, {
            content: document.content + nodeRef
          })
        }
      }
    })
  }

  function removeDocumentLinks(documentId: string) {
    documentNodeLinks.value = documentNodeLinks.value.filter(
      link => link.documentId !== documentId
    )
  }

  function removeNodeLinks(nodeId: string) {
    documentNodeLinks.value = documentNodeLinks.value.filter(
      link => link.nodeId !== nodeId
    )
  }

  function linkDocumentToNode(documentId: string, nodeId: string, linkType: DocumentNodeLink['linkType'] = 'reference') {
    // Check if link already exists
    const existingLink = documentNodeLinks.value.find(
      link => link.documentId === documentId && link.nodeId === nodeId
    )
    
    if (existingLink) {
      return existingLink
    }

    return createDocumentNodeLink(documentId, nodeId, linkType)
  }

  function unlinkDocumentFromNode(documentId: string, nodeId: string) {
    removeDocumentNodeLink(documentId, nodeId)
  }

  function setOnlineStatus(online: boolean) {
    isOnline.value = online
    
    if (online && hasPendingChanges.value) {
      processPendingChanges()
    }
  }

  function forceSync() {
    if (isOnline.value) {
      processPendingChanges()
    }
  }

  function clearPendingChanges() {
    syncState.value.pendingChanges = []
  }

  // Watch for changes in stores and create sync events
  watch(
    () => fileSystemStore.documents,
    (newDocs, oldDocs) => {
      // Detect changes and create sync events
      // This is a simplified implementation
      if (oldDocs && newDocs.length !== oldDocs.length) {
        const lastDoc = newDocs[newDocs.length - 1]
        if (lastDoc) {
          addPendingChange(createSyncEvent(
            'create',
            'filesystem',
            lastDoc.id,
            lastDoc
          ))
        }
      }
    },
    { deep: true }
  )

  watch(
    () => whiteboardStore.currentNodes,
    (newNodes, oldNodes) => {
      // Detect changes and create sync events
      if (oldNodes && newNodes.length !== oldNodes.length) {
        const lastNode = newNodes[newNodes.length - 1]
        if (lastNode) {
          addPendingChange(createSyncEvent(
            'create',
            'whiteboard',
            lastNode.id,
            lastNode
          ))
        }
      }
    },
    { deep: true }
  )

  return {
    // State
    syncState,
    documentNodeLinks,
    isOnline,
    syncInProgress,
    
    // Getters
    hasPendingChanges,
    linkCount,
    documentLinks,
    
    // Actions
    createSyncEvent,
    addPendingChange,
    processPendingChanges,
    createDocumentNodeLink,
    removeDocumentNodeLink,
    getDocumentLinks,
    getNodeLinks,
    linkDocumentToNode,
    unlinkDocumentFromNode,
    setOnlineStatus,
    forceSync,
    clearPendingChanges
  }
})
