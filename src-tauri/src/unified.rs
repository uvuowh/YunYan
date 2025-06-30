use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================================================
// UNIFIED BLOCK TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedBlock {
    pub id: String,
    pub block_type: String,
    pub content: String,
    pub properties: HashMap<String, serde_json::Value>,
    pub children: Vec<String>,
    pub parent_id: Option<String>,
    pub position: u32,
    pub spatial_properties: Option<SpatialProperties>,
    pub metadata: UnifiedBlockMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialProperties {
    pub canvas_id: String,
    pub position: Position,
    pub size: Size,
    pub style: SpatialNodeStyle,
    pub connections: Vec<SpatialConnection>,
    pub is_visible: bool,
    pub layer: i32,
    pub locked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Size {
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialNodeStyle {
    pub background_color: String,
    pub border_color: String,
    pub border_width: f64,
    pub border_radius: f64,
    pub font_size: f64,
    pub font_color: String,
    pub opacity: f64,
    pub shadow: bool,
    pub shadow_color: String,
    pub shadow_blur: f64,
    pub rotation: f64,
    pub skew_x: f64,
    pub skew_y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialConnection {
    pub id: String,
    pub target_block_id: String,
    pub connection_type: String,
    pub style: ConnectionStyle,
    pub label: Option<String>,
    pub points: Option<Vec<Position>>,
    pub metadata: ConnectionMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionStyle {
    pub color: String,
    pub width: f64,
    pub opacity: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionMetadata {
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub semantic_type: Option<String>,
    pub strength: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedBlockMetadata {
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub tags: Vec<String>,
    pub locked: bool,
    pub word_count: Option<u32>,
    pub reading_time: Option<u32>,
    pub last_canvas_id: Option<String>,
    pub spatial_history: Vec<SpatialHistoryEntry>,
    pub references: Vec<BlockReference>,
    pub backlinks: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpatialHistoryEntry {
    pub canvas_id: String,
    pub position: Position,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockReference {
    pub source_block_id: String,
    pub reference_type: String,
    pub context: Option<String>,
}

// ============================================================================
// CONTAINER TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentContainer {
    pub id: String,
    pub title: String,
    pub root_block_ids: Vec<String>,
    pub metadata: DocumentContainerMetadata,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentContainerMetadata {
    pub tags: Vec<String>,
    pub category: String,
    pub author: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub word_count: u32,
    pub reading_time: u32,
    pub last_modified: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanvasContainer {
    pub id: String,
    pub name: String,
    pub block_ids: Vec<String>,
    pub viewport: Viewport,
    pub settings: CanvasSettings,
    pub metadata: CanvasContainerMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Viewport {
    pub x: f64,
    pub y: f64,
    pub zoom: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanvasSettings {
    pub grid_enabled: bool,
    pub snap_to_grid: bool,
    pub grid_size: f64,
    pub background_color: String,
    pub show_minimap: bool,
    pub allow_overlap: bool,
    pub auto_layout: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanvasContainerMetadata {
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub tags: Vec<String>,
    pub description: Option<String>,
    pub thumbnail: Option<String>,
}

// ============================================================================
// WORKSPACE TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnifiedWorkspace {
    pub id: String,
    pub name: String,
    pub blocks: HashMap<String, UnifiedBlock>,
    pub documents: HashMap<String, DocumentContainer>,
    pub canvases: HashMap<String, CanvasContainer>,
    pub metadata: WorkspaceMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceMetadata {
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub version: String,
    pub last_sync_time: Option<chrono::DateTime<chrono::Utc>>,
    pub total_blocks: u32,
    pub total_documents: u32,
    pub total_canvases: u32,
}

// ============================================================================
// QUERY TYPES
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockQuery {
    // Content filters
    pub content_contains: Option<String>,
    pub content_regex: Option<String>,
    
    // Type filters
    pub types: Option<Vec<String>>,
    pub exclude_types: Option<Vec<String>>,
    
    // Hierarchical filters
    pub has_parent: Option<bool>,
    pub has_children: Option<bool>,
    pub parent_id: Option<String>,
    pub ancestor_id: Option<String>,
    pub depth: Option<u32>,
    
    // Spatial filters
    pub on_canvas: Option<String>,
    pub in_region: Option<Region>,
    pub connected_to: Option<String>,
    
    // Metadata filters
    pub tags: Option<Vec<String>>,
    pub created_after: Option<chrono::DateTime<chrono::Utc>>,
    pub created_before: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_after: Option<chrono::DateTime<chrono::Utc>>,
    pub updated_before: Option<chrono::DateTime<chrono::Utc>>,
    
    // Sorting and pagination
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Region {
    pub top_left: Position,
    pub bottom_right: Position,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResult {
    pub blocks: Vec<UnifiedBlock>,
    pub total_count: u32,
    pub has_more: bool,
}

// ============================================================================
// ERROR TYPES
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct UnifiedError {
    pub code: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

impl std::fmt::Display for UnifiedError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}: {}", self.code, self.message)
    }
}

impl std::error::Error for UnifiedError {}

// ============================================================================
// OPERATION RESULT TYPES
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct BlockOperationResult {
    pub success: bool,
    pub block_id: Option<String>,
    pub error: Option<String>,
    pub affected_blocks: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WorkspaceOperationResult {
    pub success: bool,
    pub workspace_id: Option<String>,
    pub error: Option<String>,
    pub blocks_loaded: Option<u32>,
    pub documents_loaded: Option<u32>,
    pub canvases_loaded: Option<u32>,
}
