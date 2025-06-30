import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { 
  Canvas, 
  WhiteboardNode, 
  Connection, 
  Position, 
  Size, 
  NodeStyle,
  ConnectionStyle,
  Viewport,
  CanvasSettings,
  CanvasHistory
} from '@/types'

export const useWhiteboardStore = defineStore('whiteboard', () => {
  // State
  const canvases = ref<Canvas[]>([])
  const currentCanvas = ref<Canvas | undefined>()
  const selectedNodes = ref<string[]>([])
  const clipboard = ref<WhiteboardNode[]>([])
  const history = ref<CanvasHistory[]>([])
  const isDragging = ref<boolean>(false)
  const dragOffset = ref<Position>({ x: 0, y: 0 })

  // Getters
  const canvasCount = computed(() => canvases.value.length)
  const hasCurrentCanvas = computed(() => !!currentCanvas.value)
  const currentNodes = computed(() => currentCanvas.value?.nodes || [])
  const currentConnections = computed(() => currentCanvas.value?.connections || [])
  const selectedNodesData = computed(() => 
    currentNodes.value.filter(node => selectedNodes.value.includes(node.id))
  )
  const hasSelection = computed(() => selectedNodes.value.length > 0)

  // Actions
  function createCanvas(name: string = 'New Canvas'): Canvas {
    const now = new Date()
    const canvas: Canvas = {
      id: uuidv4(),
      name,
      nodes: [],
      connections: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      settings: {
        gridEnabled: true,
        snapToGrid: false,
        gridSize: 20,
        backgroundColor: '#ffffff',
        showMinimap: true
      },
      createdAt: now,
      updatedAt: now
    }

    canvases.value.push(canvas)
    setCurrentCanvas(canvas.id)
    
    return canvas
  }

  function setCurrentCanvas(canvasId: string) {
    const canvas = canvases.value.find(c => c.id === canvasId)
    if (canvas) {
      currentCanvas.value = canvas
      clearSelection()
    }
  }

  function updateCanvas(canvasId: string, updates: Partial<Canvas>) {
    const index = canvases.value.findIndex(c => c.id === canvasId)
    if (index > -1) {
      const updatedCanvas = {
        ...canvases.value[index],
        ...updates,
        updatedAt: new Date()
      }
      
      canvases.value[index] = updatedCanvas
      
      if (currentCanvas.value?.id === canvasId) {
        currentCanvas.value = updatedCanvas
      }
    }
  }

  function deleteCanvas(canvasId: string) {
    const index = canvases.value.findIndex(c => c.id === canvasId)
    if (index > -1) {
      canvases.value.splice(index, 1)
      
      if (currentCanvas.value?.id === canvasId) {
        currentCanvas.value = canvases.value[0] || undefined
      }
    }
  }

  function createNode(
    type: WhiteboardNode['type'],
    position: Position,
    content: string = '',
    size: Size = { width: 200, height: 100 }
  ): WhiteboardNode {
    const now = new Date()
    const node: WhiteboardNode = {
      id: uuidv4(),
      type,
      position: { ...position },
      size: { ...size },
      content,
      style: getDefaultNodeStyle(),
      connections: [],
      metadata: {
        createdAt: now,
        updatedAt: now,
        tags: [],
        locked: false
      }
    }

    if (currentCanvas.value) {
      currentCanvas.value.nodes.push(node)
      updateCanvas(currentCanvas.value.id, { nodes: currentCanvas.value.nodes })
      addToHistory('create_node', { nodeId: node.id })
    }

    return node
  }

  function updateNode(nodeId: string, updates: Partial<WhiteboardNode>) {
    if (!currentCanvas.value) return

    const index = currentCanvas.value.nodes.findIndex(n => n.id === nodeId)
    if (index > -1) {
      const updatedNode = {
        ...currentCanvas.value.nodes[index],
        ...updates,
        metadata: {
          ...currentCanvas.value.nodes[index].metadata,
          updatedAt: new Date()
        }
      }
      
      currentCanvas.value.nodes[index] = updatedNode
      updateCanvas(currentCanvas.value.id, { nodes: currentCanvas.value.nodes })
      addToHistory('update_node', { nodeId, updates })
    }
  }

  function deleteNode(nodeId: string) {
    if (!currentCanvas.value) return

    // Remove node
    const nodeIndex = currentCanvas.value.nodes.findIndex(n => n.id === nodeId)
    if (nodeIndex > -1) {
      currentCanvas.value.nodes.splice(nodeIndex, 1)
    }

    // Remove connections involving this node
    currentCanvas.value.connections = currentCanvas.value.connections.filter(
      conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
    )

    // Remove from selection
    removeFromSelection(nodeId)

    updateCanvas(currentCanvas.value.id, { 
      nodes: currentCanvas.value.nodes,
      connections: currentCanvas.value.connections
    })
    addToHistory('delete_node', { nodeId })
  }

  function moveNode(nodeId: string, newPosition: Position) {
    updateNode(nodeId, { position: newPosition })
  }

  function resizeNode(nodeId: string, newSize: Size) {
    updateNode(nodeId, { size: newSize })
  }

  function createConnection(fromNodeId: string, toNodeId: string): Connection {
    const connection: Connection = {
      id: uuidv4(),
      fromNodeId,
      toNodeId,
      type: 'arrow',
      style: getDefaultConnectionStyle()
    }

    if (currentCanvas.value) {
      currentCanvas.value.connections.push(connection)
      updateCanvas(currentCanvas.value.id, { connections: currentCanvas.value.connections })
      addToHistory('create_connection', { connectionId: connection.id })
    }

    return connection
  }

  function deleteConnection(connectionId: string) {
    if (!currentCanvas.value) return

    const index = currentCanvas.value.connections.findIndex(c => c.id === connectionId)
    if (index > -1) {
      currentCanvas.value.connections.splice(index, 1)
      updateCanvas(currentCanvas.value.id, { connections: currentCanvas.value.connections })
      addToHistory('delete_connection', { connectionId })
    }
  }

  function selectNode(nodeId: string, addToSelection: boolean = false) {
    if (addToSelection) {
      if (!selectedNodes.value.includes(nodeId)) {
        selectedNodes.value.push(nodeId)
      }
    } else {
      selectedNodes.value = [nodeId]
    }
  }

  function removeFromSelection(nodeId: string) {
    const index = selectedNodes.value.indexOf(nodeId)
    if (index > -1) {
      selectedNodes.value.splice(index, 1)
    }
  }

  function clearSelection() {
    selectedNodes.value = []
  }

  function selectAll() {
    selectedNodes.value = currentNodes.value.map(node => node.id)
  }

  function copySelection() {
    clipboard.value = selectedNodesData.value.map(node => ({ ...node }))
  }

  function pasteNodes(offset: Position = { x: 20, y: 20 }) {
    if (clipboard.value.length === 0) return

    const newNodes = clipboard.value.map(node => ({
      ...node,
      id: uuidv4(),
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y
      },
      metadata: {
        ...node.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }))

    if (currentCanvas.value) {
      currentCanvas.value.nodes.push(...newNodes)
      updateCanvas(currentCanvas.value.id, { nodes: currentCanvas.value.nodes })
      
      // Select pasted nodes
      selectedNodes.value = newNodes.map(node => node.id)
      addToHistory('paste_nodes', { nodeIds: selectedNodes.value })
    }
  }

  function deleteSelection() {
    selectedNodes.value.forEach(nodeId => deleteNode(nodeId))
    clearSelection()
  }

  function updateViewport(viewport: Partial<Viewport>) {
    if (!currentCanvas.value) return

    currentCanvas.value.viewport = {
      ...currentCanvas.value.viewport,
      ...viewport
    }
    updateCanvas(currentCanvas.value.id, { viewport: currentCanvas.value.viewport })
  }

  function zoomIn() {
    if (!currentCanvas.value) return
    const newZoom = Math.min(currentCanvas.value.viewport.zoom * 1.2, 3)
    updateViewport({ zoom: newZoom })
  }

  function zoomOut() {
    if (!currentCanvas.value) return
    const newZoom = Math.max(currentCanvas.value.viewport.zoom / 1.2, 0.1)
    updateViewport({ zoom: newZoom })
  }

  function resetZoom() {
    updateViewport({ zoom: 1 })
  }

  function centerView() {
    if (!currentCanvas.value || currentCanvas.value.nodes.length === 0) return

    // Calculate bounding box of all nodes
    const nodes = currentCanvas.value.nodes
    const minX = Math.min(...nodes.map(n => n.position.x))
    const minY = Math.min(...nodes.map(n => n.position.y))
    const maxX = Math.max(...nodes.map(n => n.position.x + n.size.width))
    const maxY = Math.max(...nodes.map(n => n.position.y + n.size.height))

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    updateViewport({ x: -centerX, y: -centerY })
  }

  function addToHistory(action: string, data: any) {
    const historyEntry: CanvasHistory = {
      id: uuidv4(),
      action,
      timestamp: new Date(),
      data
    }

    history.value.push(historyEntry)

    // Keep only last 50 entries
    if (history.value.length > 50) {
      history.value = history.value.slice(-50)
    }
  }

  // Helper functions
  function getDefaultNodeStyle(): NodeStyle {
    return {
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 8,
      fontSize: 14,
      fontColor: '#374151',
      opacity: 1
    }
  }

  function getDefaultConnectionStyle(): ConnectionStyle {
    return {
      color: '#6b7280',
      width: 2,
      opacity: 1
    }
  }

  return {
    // State
    canvases,
    currentCanvas,
    selectedNodes,
    clipboard,
    history,
    isDragging,
    dragOffset,
    
    // Getters
    canvasCount,
    hasCurrentCanvas,
    currentNodes,
    currentConnections,
    selectedNodesData,
    hasSelection,
    
    // Actions
    createCanvas,
    setCurrentCanvas,
    updateCanvas,
    deleteCanvas,
    createNode,
    updateNode,
    deleteNode,
    moveNode,
    resizeNode,
    createConnection,
    deleteConnection,
    selectNode,
    removeFromSelection,
    clearSelection,
    selectAll,
    copySelection,
    pasteNodes,
    deleteSelection,
    updateViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    centerView,
    addToHistory
  }
})
