use crate::models::SystemInfo;
use crate::error::AppError;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct AppVersion {
    pub version: String,
    pub build: String,
}

/// Get system information
#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, AppError> {
    let os = env::consts::OS;
    let arch = env::consts::ARCH;
    let family = env::consts::FAMILY;
    
    Ok(SystemInfo {
        os: os.to_string(),
        arch: arch.to_string(),
        family: family.to_string(),
        hostname: hostname::get()
            .map_err(|e| AppError::SystemError(format!("Failed to get hostname: {}", e)))?
            .to_string_lossy()
            .to_string(),
    })
}

/// Get application version information
#[tauri::command]
pub async fn get_app_version() -> Result<AppVersion, AppError> {
    Ok(AppVersion {
        version: env!("CARGO_PKG_VERSION").to_string(),
        build: "development".to_string(), // Could be set via build script
    })
}

/// Check if the application is running in development mode
#[tauri::command]
pub async fn is_dev_mode() -> Result<bool, AppError> {
    Ok(cfg!(debug_assertions))
}

/// Get environment variables (filtered for security)
#[tauri::command]
pub async fn get_env_var(key: String) -> Result<Option<String>, AppError> {
    // Only allow specific environment variables for security
    let allowed_vars = vec![
        "NODE_ENV",
        "TAURI_ENV",
        "RUST_LOG",
    ];
    
    if !allowed_vars.contains(&key.as_str()) {
        return Err(AppError::SecurityError(format!("Access to environment variable '{}' is not allowed", key)));
    }
    
    Ok(env::var(&key).ok())
}
