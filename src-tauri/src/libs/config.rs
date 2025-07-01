// 应用配置管理
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub app_name: String,
    pub version: String,
    pub data_dir: PathBuf,
    pub log_level: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            app_name: "YunYan".to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            data_dir: dirs::data_dir()
                .unwrap_or_else(|| PathBuf::from("."))
                .join("yunyan"),
            log_level: "info".to_string(),
        }
    }
}

impl AppConfig {
    /// 加载应用配置
    pub fn load() -> Result<Self, Box<dyn std::error::Error>> {
        // 这里可以从配置文件加载，目前返回默认配置
        Ok(Self::default())
    }

    /// 保存应用配置
    pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        // 这里可以保存配置到文件
        Ok(())
    }
}
