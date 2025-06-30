use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::Manager;

mod unified;
mod storage;

use unified::*;
use storage::UnifiedStorage;
use std::sync::Mutex;
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub path: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileSystemError {
    pub code: String,
    pub message: String,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, FileSystemError> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(FileSystemError {
            code: "READ_ERROR".to_string(),
            message: format!("Failed to read file {}: {}", path, e),
        }),
    }
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), FileSystemError> {
    // Ensure directory exists
    if let Some(parent) = Path::new(&path).parent() {
        if let Err(e) = fs::create_dir_all(parent) {
            return Err(FileSystemError {
                code: "DIR_CREATE_ERROR".to_string(),
                message: format!("Failed to create directory: {}", e),
            });
        }
    }

    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileSystemError {
            code: "WRITE_ERROR".to_string(),
            message: format!("Failed to write file {}: {}", path, e),
        }),
    }
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), FileSystemError> {
    match fs::remove_file(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileSystemError {
            code: "DELETE_ERROR".to_string(),
            message: format!("Failed to delete file {}: {}", path, e),
        }),
    }
}

#[tauri::command]
async fn list_files(dir_path: String) -> Result<Vec<String>, FileSystemError> {
    match fs::read_dir(&dir_path) {
        Ok(entries) => {
            let mut files = Vec::new();
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Some(file_name) = entry.file_name().to_str() {
                        files.push(file_name.to_string());
                    }
                }
            }
            Ok(files)
        }
        Err(e) => Err(FileSystemError {
            code: "LIST_ERROR".to_string(),
            message: format!("Failed to list files in {}: {}", dir_path, e),
        }),
    }
}

#[tauri::command]
async fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[tauri::command]
async fn create_directory(path: String) -> Result<(), FileSystemError> {
    match fs::create_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(FileSystemError {
            code: "DIR_CREATE_ERROR".to_string(),
            message: format!("Failed to create directory {}: {}", path, e),
        }),
    }
}

#[tauri::command]
async fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, FileSystemError> {
    match app.path().app_data_dir() {
        Ok(path) => {
            let path_str = path.to_string_lossy().to_string();
            // Ensure the directory exists
            if let Err(e) = fs::create_dir_all(&path) {
                return Err(FileSystemError {
                    code: "DIR_CREATE_ERROR".to_string(),
                    message: format!("Failed to create app data directory: {}", e),
                });
            }
            Ok(path_str)
        }
        Err(e) => Err(FileSystemError {
            code: "PATH_ERROR".to_string(),
            message: format!("Failed to get app data directory: {}", e),
        }),
    }
}

// ============================================================================
// UNIFIED SYSTEM COMMANDS
// ============================================================================

#[tauri::command]
async fn load_workspace(app_handle: tauri::AppHandle, workspace_id: String) -> Result<UnifiedWorkspace, UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.load_workspace(&workspace_id).await
}

#[tauri::command]
async fn save_workspace(app_handle: tauri::AppHandle, workspace: UnifiedWorkspace) -> Result<(), UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.save_workspace(&workspace).await
}

#[tauri::command]
async fn save_block(app_handle: tauri::AppHandle, workspace_id: String, block: UnifiedBlock) -> Result<(), UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.save_block(&workspace_id, &block).await
}

#[tauri::command]
async fn get_block(app_handle: tauri::AppHandle, workspace_id: String, block_id: String) -> Result<Option<UnifiedBlock>, UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.get_block(&workspace_id, &block_id).await
}

#[tauri::command]
async fn delete_block(app_handle: tauri::AppHandle, workspace_id: String, block_id: String) -> Result<(), UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.delete_block(&workspace_id, &block_id).await
}

#[tauri::command]
async fn query_blocks(app_handle: tauri::AppHandle, workspace_id: String, query: BlockQuery) -> Result<QueryResult, UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.query_blocks(&workspace_id, &query).await
}

#[tauri::command]
async fn save_document(app_handle: tauri::AppHandle, workspace_id: String, document: DocumentContainer) -> Result<(), UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.save_document(&workspace_id, &document).await
}

#[tauri::command]
async fn get_document(app_handle: tauri::AppHandle, workspace_id: String, document_id: String) -> Result<Option<DocumentContainer>, UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.get_document(&workspace_id, &document_id).await
}

#[tauri::command]
async fn save_canvas(app_handle: tauri::AppHandle, workspace_id: String, canvas: CanvasContainer) -> Result<(), UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.save_canvas(&workspace_id, &canvas).await
}

#[tauri::command]
async fn get_canvas(app_handle: tauri::AppHandle, workspace_id: String, canvas_id: String) -> Result<Option<CanvasContainer>, UnifiedError> {
    let storage = UnifiedStorage::new(&app_handle)?;
    storage.get_canvas(&workspace_id, &canvas_id).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            read_file,
            write_file,
            delete_file,
            list_files,
            file_exists,
            create_directory,
            get_app_data_dir,
            // Unified system commands
            load_workspace,
            save_workspace,
            save_block,
            get_block,
            delete_block,
            query_blocks,
            save_document,
            get_document,
            save_canvas,
            get_canvas
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
