use crate::error::AppError;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub is_dir: bool,
    pub modified: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectoryListing {
    pub path: String,
    pub files: Vec<FileInfo>,
}

/// Read a text file from the app data directory
#[tauri::command]
pub async fn read_text_file(
    app_handle: AppHandle,
    file_path: String,
) -> Result<String, AppError> {
    // Resolve path relative to app data directory for security
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| AppError::FileError(format!("Failed to get app data directory: {}", e)))?;
    
    let full_path = app_data_dir.join(&file_path);
    
    // Ensure the path is within the app data directory (prevent path traversal)
    if !full_path.starts_with(&app_data_dir) {
        return Err(AppError::SecurityError("Path traversal attempt detected".to_string()));
    }
    
    fs::read_to_string(&full_path)
        .map_err(|e| AppError::FileError(format!("Failed to read file '{}': {}", file_path, e)))
}

/// Write a text file to the app data directory
#[tauri::command]
pub async fn write_text_file(
    app_handle: AppHandle,
    file_path: String,
    content: String,
) -> Result<(), AppError> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| AppError::FileError(format!("Failed to get app data directory: {}", e)))?;
    
    let full_path = app_data_dir.join(&file_path);
    
    // Ensure the path is within the app data directory
    if !full_path.starts_with(&app_data_dir) {
        return Err(AppError::SecurityError("Path traversal attempt detected".to_string()));
    }
    
    // Create parent directories if they don't exist
    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| AppError::FileError(format!("Failed to create directories: {}", e)))?;
    }
    
    fs::write(&full_path, content)
        .map_err(|e| AppError::FileError(format!("Failed to write file '{}': {}", file_path, e)))
}

/// List files in a directory within the app data directory
#[tauri::command]
pub async fn list_directory(
    app_handle: AppHandle,
    dir_path: String,
) -> Result<DirectoryListing, AppError> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| AppError::FileError(format!("Failed to get app data directory: {}", e)))?;
    
    let full_path = app_data_dir.join(&dir_path);
    
    // Ensure the path is within the app data directory
    if !full_path.starts_with(&app_data_dir) {
        return Err(AppError::SecurityError("Path traversal attempt detected".to_string()));
    }
    
    let entries = fs::read_dir(&full_path)
        .map_err(|e| AppError::FileError(format!("Failed to read directory '{}': {}", dir_path, e)))?;
    
    let mut files = Vec::new();
    
    for entry in entries {
        let entry = entry
            .map_err(|e| AppError::FileError(format!("Failed to read directory entry: {}", e)))?;
        
        let metadata = entry.metadata()
            .map_err(|e| AppError::FileError(format!("Failed to read file metadata: {}", e)))?;
        
        let file_name = entry.file_name().to_string_lossy().to_string();
        let relative_path = entry.path().strip_prefix(&app_data_dir)
            .unwrap_or(&entry.path())
            .to_string_lossy()
            .to_string();
        
        let modified = metadata.modified()
            .ok()
            .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
            .map(|duration| duration.as_secs());
        
        files.push(FileInfo {
            name: file_name,
            path: relative_path,
            size: metadata.len(),
            is_dir: metadata.is_dir(),
            modified,
        });
    }
    
    Ok(DirectoryListing {
        path: dir_path,
        files,
    })
}

/// Check if a file exists in the app data directory
#[tauri::command]
pub async fn file_exists(
    app_handle: AppHandle,
    file_path: String,
) -> Result<bool, AppError> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| AppError::FileError(format!("Failed to get app data directory: {}", e)))?;
    
    let full_path = app_data_dir.join(&file_path);
    
    // Ensure the path is within the app data directory
    if !full_path.starts_with(&app_data_dir) {
        return Err(AppError::SecurityError("Path traversal attempt detected".to_string()));
    }
    
    Ok(full_path.exists())
}
