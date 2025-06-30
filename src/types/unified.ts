// Unified Data Architecture for SiYuan + Heptabase Integration
// This file defines the core types for a unified block-based system that supports
// both document hierarchy (SiYuan-style) and spatial whiteboard representation (Heptabase-style)

import type { Position, Size, NodeStyle, ConnectionStyle } from './index'

// ============================================================================
// CORE UNIFIED BLOCK TYPES
// ============================================================================

/**
 * Enhanced block type that supports both traditional document blocks
 * and spatial whiteboard elements as a unified entity
 */
export interface UnifiedBlock {
  id: string
  type: UnifiedBlockType
  content: string
  properties: Record<string, any>
  children: string[] // Child block IDs for hierarchical structure
  parentId?: string
  position: number // Position in document hierarchy
  
  // Spatial properties (optional - only for blocks that appear on whiteboard)
  spatialProperties?: SpatialProperties
  
  // Metadata
  metadata: UnifiedBlockMetadata
}

/**
 * Extended block types that support both document and spatial representations
 */
export type UnifiedBlockType = 
  // Traditional document blocks
  | 'paragraph' 
  | 'heading' 
  | 'list' 
  | 'code' 
  | 'quote' 
  | 'image' 
  | 'table'
  | 'embed'
  // Spatial-first blocks (primarily for whiteboard)
  | 'whiteboard-text'
  | 'whiteboard-image' 
  | 'whiteboard-group'
  | 'mindmap-node'
  | 'shape'
  | 'sticky-note'

/**
 * Spatial properties that allow any block to appear on whiteboards
 */
export interface SpatialProperties {
  canvasId: string // Which canvas this block appears on
  position: Position // X,Y coordinates on canvas
  size: Size
  style: SpatialNodeStyle
  connections: SpatialConnection[] // Connections to other blocks
  isVisible: boolean // Whether visible on current canvas
  layer: number // Z-index for layering
  locked: boolean // Whether the spatial position is locked
}

/**
 * Enhanced node style for spatial representation
 */
export interface SpatialNodeStyle extends NodeStyle {
  // Additional spatial-specific styling
  shadow: boolean
  shadowColor: string
  shadowBlur: number
  rotation: number // Rotation angle in degrees
  skewX: number
  skewY: number
}

/**
 * Spatial connections between blocks on whiteboards
 */
export interface SpatialConnection {
  id: string
  targetBlockId: string
  type: SpatialConnectionType
  style: ConnectionStyle
  label?: string
  points?: Position[] // For custom connection paths
  metadata: ConnectionMetadata
}

export type SpatialConnectionType = 
  | 'line' 
  | 'arrow' 
  | 'curve' 
  | 'dashed'
  | 'bidirectional'
  | 'hierarchical' // Represents parent-child relationship
  | 'reference' // Represents block reference/link
  | 'semantic' // User-defined semantic relationship

export interface ConnectionMetadata {
  createdAt: Date
  updatedAt: Date
  semanticType?: string // User-defined connection meaning
  strength?: number // Connection strength (0-1)
}

/**
 * Enhanced metadata for unified blocks
 */
export interface UnifiedBlockMetadata {
  createdAt: Date
  updatedAt: Date
  tags: string[]
  locked: boolean
  
  // Document-specific metadata
  wordCount?: number
  readingTime?: number
  
  // Spatial-specific metadata
  lastCanvasId?: string // Last canvas this block appeared on
  spatialHistory?: SpatialHistoryEntry[] // History of spatial positions
  
  // Cross-reference metadata
  references: BlockReference[] // Other blocks that reference this one
  backlinks: string[] // Block IDs that this block references
}

export interface SpatialHistoryEntry {
  canvasId: string
  position: Position
  timestamp: Date
}

export interface BlockReference {
  sourceBlockId: string
  referenceType: 'embed' | 'link' | 'mention'
  context?: string // Surrounding text context
}

// ============================================================================
// CONTAINER TYPES
// ============================================================================

/**
 * Document container that organizes blocks hierarchically
 */
export interface DocumentContainer {
  id: string
  title: string
  rootBlockIds: string[] // Top-level blocks in this document
  metadata: DocumentContainerMetadata
  path: string
}

export interface DocumentContainerMetadata {
  tags: string[]
  category: string
  author: string
  createdAt: Date
  updatedAt: Date
  wordCount: number
  readingTime: number
  lastModified: Date
}

/**
 * Canvas container that organizes blocks spatially
 */
export interface CanvasContainer {
  id: string
  name: string
  blockIds: string[] // Blocks that appear on this canvas
  viewport: Viewport
  settings: CanvasSettings
  metadata: CanvasContainerMetadata
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
  allowOverlap: boolean
  autoLayout: boolean
}

export interface CanvasContainerMetadata {
  createdAt: Date
  updatedAt: Date
  tags: string[]
  description?: string
  thumbnail?: string
}

// ============================================================================
// WORKSPACE AND QUERY TYPES
// ============================================================================

/**
 * Workspace that contains all unified data
 */
export interface UnifiedWorkspace {
  id: string
  name: string
  blocks: Map<string, UnifiedBlock>
  documents: Map<string, DocumentContainer>
  canvases: Map<string, CanvasContainer>
  metadata: WorkspaceMetadata
}

export interface WorkspaceMetadata {
  createdAt: Date
  updatedAt: Date
  version: string
  lastSyncTime?: Date
  totalBlocks: number
  totalDocuments: number
  totalCanvases: number
}

/**
 * Query interface for advanced block operations
 */
export interface BlockQuery {
  // Content filters
  contentContains?: string
  contentRegex?: string
  
  // Type filters
  types?: UnifiedBlockType[]
  excludeTypes?: UnifiedBlockType[]
  
  // Hierarchical filters
  hasParent?: boolean
  hasChildren?: boolean
  parentId?: string
  ancestorId?: string
  depth?: number
  
  // Spatial filters
  onCanvas?: string
  inRegion?: {
    topLeft: Position
    bottomRight: Position
  }
  connectedTo?: string
  
  // Metadata filters
  tags?: string[]
  createdAfter?: Date
  createdBefore?: Date
  updatedAfter?: Date
  updatedBefore?: Date
  
  // Sorting and pagination
  sortBy?: 'createdAt' | 'updatedAt' | 'position' | 'content'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

/**
 * Options for creating new blocks
 */
export interface CreateBlockOptions {
  parentId?: string
  position?: number
  insertAfter?: string
  
  // Spatial options
  addToCanvas?: string
  spatialPosition?: Position
  spatialSize?: Size
  
  // Initial properties
  properties?: Record<string, any>
  tags?: string[]
}

/**
 * Options for updating blocks
 */
export interface UpdateBlockOptions {
  // Content updates
  content?: string
  type?: UnifiedBlockType
  properties?: Record<string, any>
  
  // Hierarchical updates
  newParentId?: string
  newPosition?: number
  
  // Spatial updates
  spatialProperties?: Partial<SpatialProperties>
  
  // Metadata updates
  tags?: string[]
  addTags?: string[]
  removeTags?: string[]
}

// ============================================================================
// OPERATION RESULT TYPES
// ============================================================================

export interface BlockOperationResult {
  success: boolean
  blockId?: string
  error?: string
  affectedBlocks?: string[]
}

export interface QueryResult {
  blocks: UnifiedBlock[]
  totalCount: number
  hasMore: boolean
}

// ============================================================================
// EVENT TYPES FOR REAL-TIME SYNC
// ============================================================================

export interface UnifiedSyncEvent {
  id: string
  type: UnifiedSyncEventType
  blockId: string
  data: any
  timestamp: Date
  userId?: string
}

export type UnifiedSyncEventType = 
  | 'block_created'
  | 'block_updated' 
  | 'block_deleted'
  | 'block_moved'
  | 'spatial_updated'
  | 'connection_created'
  | 'connection_deleted'
  | 'canvas_updated'
  | 'document_updated'
