use serde::{Deserialize, Serialize};

/// System information structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    /// Operating system name (e.g., "windows", "macos", "linux")
    pub os: String,
    /// System architecture (e.g., "x86_64", "aarch64")
    pub arch: String,
    /// OS family (e.g., "windows", "unix")
    pub family: String,
    /// System hostname
    pub hostname: String,
}

impl Default for SystemInfo {
    fn default() -> Self {
        Self {
            os: "unknown".to_string(),
            arch: "unknown".to_string(),
            family: "unknown".to_string(),
            hostname: "unknown".to_string(),
        }
    }
}
