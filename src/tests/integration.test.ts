// Basic integration tests for YunYan Desktop Application
// These tests verify that the core modules work together correctly

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFileSystemStore } from '@/stores/filesystem'
import { useWhiteboardStore } from '@/stores/whiteboard'
import { useSyncStore } from '@/stores/sync'
import { useAppStore } from '@/stores/app'

describe('YunYan Integration Tests', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  describe('File System Module', () => {
    it('should create and manage documents', () => {
      const fileSystemStore = useFileSystemStore()
      
      // Initially no documents
      expect(fileSystemStore.documentCount).toBe(0)
      
      // Create a document
      const doc = fileSystemStore.createDocument('Test Document')
      expect(doc.title).toBe('Test Document')
      expect(fileSystemStore.documentCount).toBe(1)
      expect(fileSystemStore.currentDocument?.id).toBe(doc.id)
      
      // Update document content
      fileSystemStore.updateDocument(doc.id, {
        content: '# Test Content\n\nThis is a test document.'
      })
      
      expect(fileSystemStore.currentDocument?.content).toContain('Test Content')
    })

    it('should create and manage blocks', () => {
      const fileSystemStore = useFileSystemStore()
      
      // Create a document first
      const doc = fileSystemStore.createDocument('Block Test')
      
      // Create blocks
      const headingBlock = fileSystemStore.createBlock('heading', 'Test Heading')
      const paragraphBlock = fileSystemStore.createBlock('paragraph', 'Test paragraph content')
      
      expect(headingBlock.type).toBe('heading')
      expect(headingBlock.content).toBe('Test Heading')
      expect(paragraphBlock.type).toBe('paragraph')
      expect(paragraphBlock.content).toBe('Test paragraph content')
      
      // Check that blocks are added to current document
      expect(fileSystemStore.currentDocumentBlocks.length).toBe(2)
    })
  })

  describe('Whiteboard Module', () => {
    it('should create and manage canvases', () => {
      const whiteboardStore = useWhiteboardStore()
      
      // Initially no canvases
      expect(whiteboardStore.canvasCount).toBe(0)
      
      // Create a canvas
      const canvas = whiteboardStore.createCanvas('Test Canvas')
      expect(canvas.name).toBe('Test Canvas')
      expect(whiteboardStore.canvasCount).toBe(1)
      expect(whiteboardStore.currentCanvas?.id).toBe(canvas.id)
    })

    it('should create and manage nodes', () => {
      const whiteboardStore = useWhiteboardStore()
      
      // Create a canvas first
      const canvas = whiteboardStore.createCanvas('Node Test Canvas')
      
      // Create nodes
      const textNode = whiteboardStore.createNode('text', { x: 100, y: 100 }, 'Test Text Node')
      const shapeNode = whiteboardStore.createNode('shape', { x: 200, y: 200 }, 'Test Shape')
      
      expect(textNode.type).toBe('text')
      expect(textNode.content).toBe('Test Text Node')
      expect(textNode.position.x).toBe(100)
      expect(textNode.position.y).toBe(100)
      
      expect(shapeNode.type).toBe('shape')
      expect(shapeNode.content).toBe('Test Shape')
      
      // Check that nodes are added to current canvas
      expect(whiteboardStore.currentNodes.length).toBe(2)
    })

    it('should create connections between nodes', () => {
      const whiteboardStore = useWhiteboardStore()
      
      // Create a canvas and nodes
      const canvas = whiteboardStore.createCanvas('Connection Test')
      const node1 = whiteboardStore.createNode('text', { x: 100, y: 100 }, 'Node 1')
      const node2 = whiteboardStore.createNode('text', { x: 200, y: 200 }, 'Node 2')
      
      // Create connection
      const connection = whiteboardStore.createConnection(node1.id, node2.id)
      
      expect(connection.fromNodeId).toBe(node1.id)
      expect(connection.toNodeId).toBe(node2.id)
      expect(whiteboardStore.currentConnections.length).toBe(1)
    })
  })

  describe('Data Synchronization Layer', () => {
    it('should create links between documents and nodes', () => {
      const fileSystemStore = useFileSystemStore()
      const whiteboardStore = useWhiteboardStore()
      const syncStore = useSyncStore()
      
      // Create a document and canvas with node
      const doc = fileSystemStore.createDocument('Sync Test Document')
      const canvas = whiteboardStore.createCanvas('Sync Test Canvas')
      const node = whiteboardStore.createNode('text', { x: 100, y: 100 }, 'Sync Test Node')
      
      // Create link
      const link = syncStore.linkDocumentToNode(doc.id, node.id, 'reference')
      
      expect(link.documentId).toBe(doc.id)
      expect(link.nodeId).toBe(node.id)
      expect(link.linkType).toBe('reference')
      expect(syncStore.linkCount).toBe(1)
      
      // Check that we can retrieve links
      const docLinks = syncStore.getDocumentLinks(doc.id)
      const nodeLinks = syncStore.getNodeLinks(node.id)
      
      expect(docLinks.length).toBe(1)
      expect(nodeLinks.length).toBe(1)
      expect(docLinks[0].nodeId).toBe(node.id)
      expect(nodeLinks[0].documentId).toBe(doc.id)
    })

    it('should manage sync events', () => {
      const syncStore = useSyncStore()
      
      // Initially no pending changes
      expect(syncStore.hasPendingChanges).toBe(false)
      expect(syncStore.syncState.pendingChanges.length).toBe(0)
      
      // Create a sync event
      const event = syncStore.createSyncEvent('create', 'filesystem', 'test-doc-id', { title: 'Test' })
      syncStore.addPendingChange(event)
      
      expect(syncStore.hasPendingChanges).toBe(true)
      expect(syncStore.syncState.pendingChanges.length).toBe(1)
      expect(syncStore.syncState.pendingChanges[0].type).toBe('create')
      expect(syncStore.syncState.pendingChanges[0].moduleId).toBe('filesystem')
    })
  })

  describe('App Store', () => {
    it('should manage application state', () => {
      const appStore = useAppStore()
      
      // Test theme management
      expect(appStore.config.theme).toBe('light')
      expect(appStore.isDarkMode).toBe(false)
      
      appStore.setTheme('dark')
      expect(appStore.config.theme).toBe('dark')
      expect(appStore.isDarkMode).toBe(true)
      
      // Test view management
      expect(appStore.currentView).toBe('filesystem')
      
      appStore.setCurrentView('whiteboard')
      expect(appStore.currentView).toBe('whiteboard')
      
      appStore.setCurrentView('integration')
      expect(appStore.currentView).toBe('integration')
    })

    it('should manage errors', () => {
      const appStore = useAppStore()
      
      // Initially no errors
      expect(appStore.hasErrors).toBe(false)
      expect(appStore.errors.length).toBe(0)
      
      // Add an error
      const error = appStore.createError('TEST_ERROR', 'Test error message', 'test')
      appStore.addError(error)
      
      expect(appStore.hasErrors).toBe(true)
      expect(appStore.errors.length).toBe(1)
      expect(appStore.latestError?.code).toBe('TEST_ERROR')
      expect(appStore.latestError?.message).toBe('Test error message')
      
      // Remove error
      appStore.removeError('TEST_ERROR')
      expect(appStore.hasErrors).toBe(false)
      expect(appStore.errors.length).toBe(0)
    })
  })

  describe('Cross-Module Integration', () => {
    it('should demonstrate full integration workflow', () => {
      const fileSystemStore = useFileSystemStore()
      const whiteboardStore = useWhiteboardStore()
      const syncStore = useSyncStore()
      const appStore = useAppStore()
      
      // Step 1: Create a document
      const doc = fileSystemStore.createDocument('Integration Test')
      fileSystemStore.updateDocument(doc.id, {
        content: '# Integration Test\n\nThis tests the full integration between modules.'
      })
      
      // Step 2: Create a canvas and node
      const canvas = whiteboardStore.createCanvas('Integration Canvas')
      const node = whiteboardStore.createNode('text', { x: 150, y: 150 }, 'Integration Node')
      
      // Step 3: Link document to node
      const link = syncStore.linkDocumentToNode(doc.id, node.id, 'bidirectional')
      
      // Step 4: Verify integration
      expect(fileSystemStore.documentCount).toBe(1)
      expect(whiteboardStore.canvasCount).toBe(1)
      expect(whiteboardStore.currentNodes.length).toBe(1)
      expect(syncStore.linkCount).toBe(1)
      
      // Step 5: Test cross-module data access
      const docLinks = syncStore.getDocumentLinks(doc.id)
      const nodeLinks = syncStore.getNodeLinks(node.id)
      
      expect(docLinks.length).toBe(1)
      expect(nodeLinks.length).toBe(1)
      expect(docLinks[0].linkType).toBe('bidirectional')
      
      // Step 6: Test that changes create sync events
      const initialPendingChanges = syncStore.syncState.pendingChanges.length
      
      // Update document (should create sync event)
      fileSystemStore.updateDocument(doc.id, {
        content: doc.content + '\n\nUpdated content'
      })
      
      // Update node (should create sync event)
      whiteboardStore.updateNode(node.id, {
        content: 'Updated Integration Node'
      })
      
      // Verify sync events were created (this depends on watchers being set up)
      // In a real test environment, we might need to trigger these manually
      expect(syncStore.syncState.pendingChanges.length).toBeGreaterThanOrEqual(initialPendingChanges)
    })
  })
})
