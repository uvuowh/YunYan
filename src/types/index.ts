// Core application types and interfaces

// Export unified types for the integrated SiYuan + Heptabase system
export * from './unified'

export interface AppConfig {
  theme: 'light' | 'dark'
  language: string
  autoSave: boolean
  syncEnabled: boolean
}

// File System Module Types
export interface Document {
  id: string
  title: string
  content: string
  blocks: Block[]
  metadata: DocumentMetadata
  createdAt: Date
  updatedAt: Date
  path: string
}

export interface Block {
  id: string
  type: BlockType
  content: string
  properties: Record<string, any>
  children: Block[]
  parentId?: string
  position: number
}

export type BlockType = 
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'code' 
  | 'quote' 
  | 'image' 
  | 'table'
  | 'embed'

export interface DocumentMetadata {
  tags: string[]
  category: string
  author: string
  wordCount: number
  readingTime: number
  lastModified: Date
}

// Whiteboard Module Types
export interface WhiteboardNode {
  id: string
  type: NodeType
  position: Position
  size: Size
  content: string
  style: NodeStyle
  connections: Connection[]
  metadata: NodeMetadata
}

export type NodeType = 
  | 'text' 
  | 'image' 
  | 'document' 
  | 'group' 
  | 'shape'
  | 'mindmap'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface NodeStyle {
  backgroundColor: string
  borderColor: string
  borderWidth: number
  borderRadius: number
  fontSize: number
  fontColor: string
  opacity: number
}

export interface Connection {
  id: string
  fromNodeId: string
  toNodeId: string
  type: ConnectionType
  style: ConnectionStyle
  label?: string
}

export type ConnectionType = 'line' | 'arrow' | 'curve' | 'dashed'

export interface ConnectionStyle {
  color: string
  width: number
  opacity: number
}

export interface NodeMetadata {
  createdAt: Date
  updatedAt: Date
  tags: string[]
  locked: boolean
}

// Whiteboard Canvas Types
export interface Canvas {
  id: string
  name: string
  nodes: WhiteboardNode[]
  connections: Connection[]
  viewport: Viewport
  settings: CanvasSettings
  createdAt: Date
  updatedAt: Date
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface CanvasSettings {
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number
  backgroundColor: string
  showMinimap: boolean
}

// Data Synchronization Types
export interface SyncEvent {
  id: string
  type: SyncEventType
  moduleId: string
  entityId: string
  data: any
  timestamp: Date
  userId?: string
}

export type SyncEventType = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'move'
  | 'connect'
  | 'disconnect'

export interface SyncState {
  lastSyncTime: Date
  pendingChanges: SyncEvent[]
  conflictResolution: ConflictResolution
}

export type ConflictResolution = 'manual' | 'auto-merge' | 'last-write-wins'

// Cross-module Integration Types
export interface DocumentNodeLink {
  documentId: string
  nodeId: string
  blockId?: string
  linkType: LinkType
  createdAt: Date
}

export type LinkType = 'reference' | 'embed' | 'annotation' | 'bidirectional'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: Date
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  module: string
}

// Event Types
export interface AppEvent {
  type: string
  payload: any
  timestamp: Date
  source: string
}

// Store State Types
export interface RootState {
  app: AppState
  filesystem: FileSystemState
  whiteboard: WhiteboardState
  sync: SyncState
}

export interface AppState {
  config: AppConfig
  currentView: string
  loading: boolean
  errors: AppError[]
}

export interface FileSystemState {
  documents: Document[]
  currentDocument?: Document
  searchResults: Document[]
  recentDocuments: Document[]
}

export interface WhiteboardState {
  canvases: Canvas[]
  currentCanvas?: Canvas
  selectedNodes: string[]
  clipboard: WhiteboardNode[]
  history: CanvasHistory[]
}

export interface CanvasHistory {
  id: string
  action: string
  timestamp: Date
  data: any
}
