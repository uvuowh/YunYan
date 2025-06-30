import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface WhiteboardNode {
  id: string
  type: 'note' | 'image' | 'text' | 'shape'
  x: number
  y: number
  width: number
  height: number
  content: string
  style: {
    backgroundColor: string
    borderColor: string
    textColor: string
    fontSize: number
  }
  connections: string[] // IDs of connected nodes
  createdAt: Date
  updatedAt: Date
}

export interface WhiteboardConnection {
  id: string
  fromNodeId: string
  toNodeId: string
  type: 'line' | 'arrow' | 'curve'
  style: {
    color: string
    width: number
    dashArray?: string
  }
}

export interface WhiteboardState {
  nodes: WhiteboardNode[]
  connections: WhiteboardConnection[]
  selectedNodeIds: string[]
  viewportX: number
  viewportY: number
  zoom: number
  isDrawing: boolean
  currentTool: 'select' | 'draw' | 'text' | 'shape' | 'connect'
}

export const useWhiteboardStore = defineStore('whiteboard', () => {
  // State
  const nodes = ref<WhiteboardNode[]>([])
  const connections = ref<WhiteboardConnection[]>([])
  const selectedNodeIds = ref<string[]>([])
  const viewportX = ref(0)
  const viewportY = ref(0)
  const zoom = ref(1)
  const isDrawing = ref(false)
  const currentTool = ref<'select' | 'draw' | 'text' | 'shape' | 'connect'>('select')

  // Getters
  const selectedNodes = computed(() => {
    return nodes.value.filter(node => selectedNodeIds.value.includes(node.id))
  })

  const visibleNodes = computed(() => {
    // TODO: Implement viewport culling for performance
    return nodes.value
  })

  const nodeConnections = computed(() => {
    return (nodeId: string) => {
      return connections.value.filter(conn => 
        conn.fromNodeId === nodeId || conn.toNodeId === nodeId
      )
    }
  })

  // Actions
  function createNode(nodeData: Omit<WhiteboardNode, 'id' | 'createdAt' | 'updatedAt'>) {
    const node: WhiteboardNode = {
      ...nodeData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    nodes.value.push(node)
    return node
  }

  function updateNode(id: string, updates: Partial<WhiteboardNode>) {
    const index = nodes.value.findIndex(node => node.id === id)
    if (index !== -1) {
      nodes.value[index] = {
        ...nodes.value[index],
        ...updates,
        updatedAt: new Date()
      }
    }
  }

  function deleteNode(id: string) {
    // Remove node
    const nodeIndex = nodes.value.findIndex(node => node.id === id)
    if (nodeIndex !== -1) {
      nodes.value.splice(nodeIndex, 1)
    }

    // Remove connections to/from this node
    connections.value = connections.value.filter(conn => 
      conn.fromNodeId !== id && conn.toNodeId !== id
    )

    // Remove from selection
    selectedNodeIds.value = selectedNodeIds.value.filter(nodeId => nodeId !== id)
  }

  function createConnection(connectionData: Omit<WhiteboardConnection, 'id'>) {
    const connection: WhiteboardConnection = {
      ...connectionData,
      id: generateId()
    }
    connections.value.push(connection)
    return connection
  }

  function deleteConnection(id: string) {
    const index = connections.value.findIndex(conn => conn.id === id)
    if (index !== -1) {
      connections.value.splice(index, 1)
    }
  }

  function selectNodes(nodeIds: string[]) {
    selectedNodeIds.value = nodeIds
  }

  function addToSelection(nodeId: string) {
    if (!selectedNodeIds.value.includes(nodeId)) {
      selectedNodeIds.value.push(nodeId)
    }
  }

  function removeFromSelection(nodeId: string) {
    selectedNodeIds.value = selectedNodeIds.value.filter(id => id !== nodeId)
  }

  function clearSelection() {
    selectedNodeIds.value = []
  }

  function setViewport(x: number, y: number) {
    viewportX.value = x
    viewportY.value = y
  }

  function setZoom(newZoom: number) {
    zoom.value = Math.max(0.1, Math.min(5, newZoom))
  }

  function setCurrentTool(tool: 'select' | 'draw' | 'text' | 'shape' | 'connect') {
    currentTool.value = tool
  }

  function setDrawing(drawing: boolean) {
    isDrawing.value = drawing
  }

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  return {
    // State
    nodes,
    connections,
    selectedNodeIds,
    viewportX,
    viewportY,
    zoom,
    isDrawing,
    currentTool,
    // Getters
    selectedNodes,
    visibleNodes,
    nodeConnections,
    // Actions
    createNode,
    updateNode,
    deleteNode,
    createConnection,
    deleteConnection,
    selectNodes,
    addToSelection,
    removeFromSelection,
    clearSelection,
    setViewport,
    setZoom,
    setCurrentTool,
    setDrawing
  }
})
