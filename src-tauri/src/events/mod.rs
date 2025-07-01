// Events module - 自定义事件处理
use tauri::AppHandle;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemEvent {
    pub event_type: String,
    pub payload: serde_json::Value,
    pub timestamp: i64,
}

/// 发送系统事件到前端
pub fn emit_system_event(app: &AppHandle, event: SystemEvent) -> Result<(), tauri::Error> {
    app.emit("system-event", &event)
}

/// 初始化事件监听器
pub fn setup_event_listeners(app: &AppHandle) {
    // 这里可以设置各种系统级事件监听
    log::info!("Event listeners initialized");
}
