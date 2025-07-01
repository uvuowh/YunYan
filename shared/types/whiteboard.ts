// 白板相关的类型定义

/**
 * 基础几何类型
 */
export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 视口信息
 */
export interface Viewport {
  x: number
  y: number
  zoom: number
}

/**
 * 颜色定义
 */
export type Color = string // 支持 hex, rgb, rgba 等格式

/**
 * 块内容类型 - 复用现有的block系统
 */
export interface BlockContent {
  type: 'text' | 'markdown' | 'image' | 'video' | 'audio' | 'pdf' | 'code' | 'table'
  data: any
  metadata?: Record<string, any>
}

/**
 * 卡片定义
 */
export interface WhiteboardCard {
  id: string
  title: string
  content: string // 简化版本，后续可扩展为BlockContent[]
  position: Point
  size: Size
  style: CardStyle
  metadata: CardMetadata
  createdAt: number
  updatedAt: number
}

export interface CardStyle {
  backgroundColor: Color
  borderColor: Color
  borderWidth: number
  borderRadius: number
  textColor: Color
  fontSize: number
  fontFamily: string
  opacity: number
  shadow: boolean
}

export interface CardMetadata {
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'review' | 'done'
  assignee?: string
  dueDate?: number
  attachments: string[]
}

/**
 * 连接线定义
 */
export interface Connection {
  id: string
  sourceId: string // 源卡片ID
  targetId: string // 目标卡片ID
  sourceAnchor: AnchorPoint
  targetAnchor: AnchorPoint
  style: ConnectionStyle
  label?: string
  metadata: ConnectionMetadata
  createdAt: number
  updatedAt: number
}

export interface AnchorPoint {
  side: 'top' | 'right' | 'bottom' | 'left'
  offset: number // 0-1 之间的比例
}

export interface ConnectionStyle {
  lineType: 'straight' | 'curved' | 'orthogonal'
  lineWidth: number
  lineColor: Color
  lineDash: number[]
  arrowType: 'none' | 'arrow' | 'diamond' | 'circle'
  arrowSize: number
  opacity: number
}

export interface ConnectionMetadata {
  label: string
  description: string
  weight: number
  bidirectional: boolean
}

/**
 * 分组/区域定义
 */
export interface Section {
  id: string
  title: string
  description: string
  bounds: Rect
  style: SectionStyle
  cardIds: string[] // 包含的卡片ID
  metadata: SectionMetadata
  createdAt: number
  updatedAt: number
}

export interface SectionStyle {
  backgroundColor: Color
  borderColor: Color
  borderWidth: number
  borderRadius: number
  opacity: number
  titleColor: Color
  titleSize: number
}

export interface SectionMetadata {
  collapsed: boolean
  locked: boolean
  tags: string[]
}

/**
 * 白板定义
 */
export interface Whiteboard {
  id: string
  name: string
  description: string
  viewport: Viewport
  cards: WhiteboardCard[]
  connections: Connection[]
  sections: Section[]
  settings: WhiteboardSettings
  metadata: WhiteboardMetadata
  createdAt: number
  updatedAt: number
}

export interface WhiteboardSettings {
  gridEnabled: boolean
  gridSize: number
  gridColor: Color
  snapToGrid: boolean
  backgroundColor: Color
  showMinimap: boolean
  autoSave: boolean
  collaborationEnabled: boolean
}

export interface WhiteboardMetadata {
  tags: string[]
  category: string
  isPublic: boolean
  shareUrl?: string
  collaborators: Collaborator[]
  version: number
  thumbnail?: string
}

export interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  avatar?: string
  lastSeen: number
}

/**
 * 操作历史
 */
export interface HistoryEntry {
  id: string
  type: 'create' | 'update' | 'delete' | 'move' | 'resize'
  targetType: 'card' | 'connection' | 'section' | 'whiteboard'
  targetId: string
  before: any
  after: any
  timestamp: number
  userId: string
}

/**
 * 选择状态
 */
export interface SelectionState {
  selectedCards: string[]
  selectedConnections: string[]
  selectedSections: string[]
  selectionBounds?: Rect
}

/**
 * 工具状态
 */
export type ToolType = 'select' | 'pan' | 'card' | 'connect' | 'section' | 'text' | 'draw'

export interface ToolState {
  currentTool: ToolType
  toolOptions: Record<string, any>
}

/**
 * 拖拽状态
 */
export interface DragState {
  isDragging: boolean
  dragType: 'card' | 'connection' | 'section' | 'selection'
  targetIds: string[]
  startPosition: Point
  currentPosition: Point
  offset: Point
}

/**
 * 调整大小状态
 */
export interface ResizeState {
  isResizing: boolean
  targetId: string
  targetType: 'card' | 'section'
  direction: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
  startPosition: Point
  startSize: Size
  aspectRatio?: number
}

/**
 * 白板状态
 */
export interface WhiteboardState {
  currentWhiteboard: Whiteboard | null
  viewport: Viewport
  selection: SelectionState
  tool: ToolState
  drag: DragState | null
  resize: ResizeState | null
  history: HistoryEntry[]
  historyIndex: number
  isLoading: boolean
  error: string | null
}

/**
 * 默认样式
 */
export const DEFAULT_CARD_STYLE: CardStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#e0e0e0',
  borderWidth: 2,
  borderRadius: 8,
  textColor: '#333333',
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  opacity: 1,
  shadow: true,
}

export const DEFAULT_CONNECTION_STYLE: ConnectionStyle = {
  lineType: 'curved',
  lineWidth: 2,
  lineColor: '#666666',
  lineDash: [],
  arrowType: 'arrow',
  arrowSize: 8,
  opacity: 1,
}

export const DEFAULT_SECTION_STYLE: SectionStyle = {
  backgroundColor: 'rgba(0, 123, 255, 0.1)',
  borderColor: '#007bff',
  borderWidth: 2,
  borderRadius: 8,
  opacity: 0.8,
  titleColor: '#007bff',
  titleSize: 16,
}
