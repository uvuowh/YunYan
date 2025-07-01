// Commands module - 所有 Tauri 命令的集中管理
pub mod greet;
pub mod whiteboard;

// 重新导出所有命令
pub use greet::*;
pub use whiteboard::*;
