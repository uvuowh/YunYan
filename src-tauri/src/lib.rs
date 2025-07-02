// Modules
pub mod commands;
pub mod models;
pub mod error;

// Re-exports
pub use error::{AppError, AppResult};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Legacy command
            greet,
            // System commands
            commands::get_system_info,
            commands::get_app_version,
            commands::is_dev_mode,
            commands::get_env_var,
            // File commands
            commands::read_text_file,
            commands::write_text_file,
            commands::list_directory,
            commands::file_exists,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
