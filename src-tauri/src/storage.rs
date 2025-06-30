use crate::unified::*;
use serde_json;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub struct UnifiedStorage {
    workspace_dir: PathBuf,
}

impl UnifiedStorage {
    pub fn new(app_handle: &AppHandle) -> Result<Self, UnifiedError> {
        let app_data_dir = app_handle.path()
            .app_data_dir()
            .map_err(|e| UnifiedError {
                code: "APP_DATA_DIR_ERROR".to_string(),
                message: format!("Failed to get app data directory: {}", e),
                details: None,
            })?;

        let workspace_dir = app_data_dir.join("workspaces");
        
        // Ensure workspace directory exists
        if let Err(e) = fs::create_dir_all(&workspace_dir) {
            return Err(UnifiedError {
                code: "WORKSPACE_DIR_CREATE_ERROR".to_string(),
                message: format!("Failed to create workspace directory: {}", e),
                details: None,
            });
        }

        Ok(UnifiedStorage { workspace_dir })
    }

    // ============================================================================
    // WORKSPACE OPERATIONS
    // ============================================================================

    pub async fn load_workspace(&self, workspace_id: &str) -> Result<UnifiedWorkspace, UnifiedError> {
        let workspace_path = self.workspace_dir.join(format!("{}.json", workspace_id));
        
        if !workspace_path.exists() {
            // Create default workspace
            return self.create_default_workspace(workspace_id).await;
        }

        let content = fs::read_to_string(&workspace_path).map_err(|e| UnifiedError {
            code: "WORKSPACE_READ_ERROR".to_string(),
            message: format!("Failed to read workspace file: {}", e),
            details: None,
        })?;

        let workspace: UnifiedWorkspace = serde_json::from_str(&content).map_err(|e| UnifiedError {
            code: "WORKSPACE_PARSE_ERROR".to_string(),
            message: format!("Failed to parse workspace file: {}", e),
            details: None,
        })?;

        Ok(workspace)
    }

    pub async fn save_workspace(&self, workspace: &UnifiedWorkspace) -> Result<(), UnifiedError> {
        let workspace_path = self.workspace_dir.join(format!("{}.json", workspace.id));
        
        let content = serde_json::to_string_pretty(workspace).map_err(|e| UnifiedError {
            code: "WORKSPACE_SERIALIZE_ERROR".to_string(),
            message: format!("Failed to serialize workspace: {}", e),
            details: None,
        })?;

        fs::write(&workspace_path, content).map_err(|e| UnifiedError {
            code: "WORKSPACE_WRITE_ERROR".to_string(),
            message: format!("Failed to write workspace file: {}", e),
            details: None,
        })?;

        Ok(())
    }

    async fn create_default_workspace(&self, workspace_id: &str) -> Result<UnifiedWorkspace, UnifiedError> {
        let now = chrono::Utc::now();
        
        let workspace = UnifiedWorkspace {
            id: workspace_id.to_string(),
            name: "Default Workspace".to_string(),
            blocks: HashMap::new(),
            documents: HashMap::new(),
            canvases: HashMap::new(),
            metadata: WorkspaceMetadata {
                created_at: now,
                updated_at: now,
                version: "1.0.0".to_string(),
                last_sync_time: None,
                total_blocks: 0,
                total_documents: 0,
                total_canvases: 0,
            },
        };

        self.save_workspace(&workspace).await?;
        Ok(workspace)
    }

    // ============================================================================
    // BLOCK OPERATIONS
    // ============================================================================

    pub async fn save_block(&self, workspace_id: &str, block: &UnifiedBlock) -> Result<(), UnifiedError> {
        let mut workspace = self.load_workspace(workspace_id).await?;
        workspace.blocks.insert(block.id.clone(), block.clone());
        workspace.metadata.updated_at = chrono::Utc::now();
        workspace.metadata.total_blocks = workspace.blocks.len() as u32;
        
        self.save_workspace(&workspace).await
    }

    pub async fn get_block(&self, workspace_id: &str, block_id: &str) -> Result<Option<UnifiedBlock>, UnifiedError> {
        let workspace = self.load_workspace(workspace_id).await?;
        Ok(workspace.blocks.get(block_id).cloned())
    }

    pub async fn delete_block(&self, workspace_id: &str, block_id: &str) -> Result<(), UnifiedError> {
        let mut workspace = self.load_workspace(workspace_id).await?;
        workspace.blocks.remove(block_id);
        workspace.metadata.updated_at = chrono::Utc::now();
        workspace.metadata.total_blocks = workspace.blocks.len() as u32;
        
        self.save_workspace(&workspace).await
    }

    pub async fn query_blocks(&self, workspace_id: &str, query: &BlockQuery) -> Result<QueryResult, UnifiedError> {
        let workspace = self.load_workspace(workspace_id).await?;
        let mut matching_blocks: Vec<UnifiedBlock> = Vec::new();

        for block in workspace.blocks.values() {
            if self.matches_query(block, query) {
                matching_blocks.push(block.clone());
            }
        }

        // Apply sorting
        if let Some(sort_by) = &query.sort_by {
            match sort_by.as_str() {
                "created_at" => {
                    matching_blocks.sort_by(|a, b| {
                        if query.sort_order.as_deref() == Some("desc") {
                            b.metadata.created_at.cmp(&a.metadata.created_at)
                        } else {
                            a.metadata.created_at.cmp(&b.metadata.created_at)
                        }
                    });
                }
                "updated_at" => {
                    matching_blocks.sort_by(|a, b| {
                        if query.sort_order.as_deref() == Some("desc") {
                            b.metadata.updated_at.cmp(&a.metadata.updated_at)
                        } else {
                            a.metadata.updated_at.cmp(&b.metadata.updated_at)
                        }
                    });
                }
                "position" => {
                    matching_blocks.sort_by(|a, b| a.position.cmp(&b.position));
                }
                _ => {} // No sorting for unknown fields
            }
        }

        let total_count = matching_blocks.len() as u32;
        
        // Apply pagination
        let offset = query.offset.unwrap_or(0) as usize;
        let limit = query.limit.unwrap_or(u32::MAX) as usize;
        
        let end_index = std::cmp::min(offset + limit, matching_blocks.len());
        let paginated_blocks = if offset < matching_blocks.len() {
            matching_blocks[offset..end_index].to_vec()
        } else {
            Vec::new()
        };

        let has_more = end_index < matching_blocks.len();

        Ok(QueryResult {
            blocks: paginated_blocks,
            total_count,
            has_more,
        })
    }

    fn matches_query(&self, block: &UnifiedBlock, query: &BlockQuery) -> bool {
        // Content filters
        if let Some(content_contains) = &query.content_contains {
            if !block.content.to_lowercase().contains(&content_contains.to_lowercase()) {
                return false;
            }
        }

        // Type filters
        if let Some(types) = &query.types {
            if !types.contains(&block.block_type) {
                return false;
            }
        }

        if let Some(exclude_types) = &query.exclude_types {
            if exclude_types.contains(&block.block_type) {
                return false;
            }
        }

        // Hierarchical filters
        if let Some(has_parent) = query.has_parent {
            if has_parent && block.parent_id.is_none() {
                return false;
            }
            if !has_parent && block.parent_id.is_some() {
                return false;
            }
        }

        if let Some(has_children) = query.has_children {
            if has_children && block.children.is_empty() {
                return false;
            }
            if !has_children && !block.children.is_empty() {
                return false;
            }
        }

        if let Some(parent_id) = &query.parent_id {
            if block.parent_id.as_ref() != Some(parent_id) {
                return false;
            }
        }

        // Spatial filters
        if let Some(canvas_id) = &query.on_canvas {
            if let Some(spatial) = &block.spatial_properties {
                if spatial.canvas_id != *canvas_id || !spatial.is_visible {
                    return false;
                }
            } else {
                return false;
            }
        }

        // Metadata filters
        if let Some(tags) = &query.tags {
            if !tags.iter().all(|tag| block.metadata.tags.contains(tag)) {
                return false;
            }
        }

        if let Some(created_after) = query.created_after {
            if block.metadata.created_at <= created_after {
                return false;
            }
        }

        if let Some(created_before) = query.created_before {
            if block.metadata.created_at >= created_before {
                return false;
            }
        }

        true
    }

    // ============================================================================
    // DOCUMENT OPERATIONS
    // ============================================================================

    pub async fn save_document(&self, workspace_id: &str, document: &DocumentContainer) -> Result<(), UnifiedError> {
        let mut workspace = self.load_workspace(workspace_id).await?;
        workspace.documents.insert(document.id.clone(), document.clone());
        workspace.metadata.updated_at = chrono::Utc::now();
        workspace.metadata.total_documents = workspace.documents.len() as u32;
        
        self.save_workspace(&workspace).await
    }

    pub async fn get_document(&self, workspace_id: &str, document_id: &str) -> Result<Option<DocumentContainer>, UnifiedError> {
        let workspace = self.load_workspace(workspace_id).await?;
        Ok(workspace.documents.get(document_id).cloned())
    }

    // ============================================================================
    // CANVAS OPERATIONS
    // ============================================================================

    pub async fn save_canvas(&self, workspace_id: &str, canvas: &CanvasContainer) -> Result<(), UnifiedError> {
        let mut workspace = self.load_workspace(workspace_id).await?;
        workspace.canvases.insert(canvas.id.clone(), canvas.clone());
        workspace.metadata.updated_at = chrono::Utc::now();
        workspace.metadata.total_canvases = workspace.canvases.len() as u32;
        
        self.save_workspace(&workspace).await
    }

    pub async fn get_canvas(&self, workspace_id: &str, canvas_id: &str) -> Result<Option<CanvasContainer>, UnifiedError> {
        let workspace = self.load_workspace(workspace_id).await?;
        Ok(workspace.canvases.get(canvas_id).cloned())
    }
}
