// 问候命令实现
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GreetRequest {
    pub name: String,
}

#[derive(Debug, Serialize)]
pub struct GreetResponse {
    pub message: String,
    pub timestamp: i64,
}

/// 问候命令 - 展示前后端通信的基础示例
#[tauri::command]
pub fn greet(name: String) -> Result<GreetResponse, String> {
    if name.trim().is_empty() {
        return Err("Name cannot be empty".to_string());
    }

    let response = GreetResponse {
        message: format!("Hello, {}! You've been greeted from Rust!", name),
        timestamp: chrono::Utc::now().timestamp(),
    };

    Ok(response)
}
