// YunYan - 基于 Tauri 的现代化桌面应用
mod commands;
mod events;
mod libs;

use commands::*;
use events::*;
use libs::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化日志
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // 设置事件监听器
            setup_event_listeners(app.handle());

            // 加载应用配置
            let _config = AppConfig::load().unwrap_or_default();

            log::info!("YunYan application initialized successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            create_whiteboard,
            get_whiteboard,
            list_whiteboards,
            update_whiteboard,
            delete_whiteboard,
            create_card,
            update_card,
            delete_card
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
