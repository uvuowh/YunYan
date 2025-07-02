use serde::{Deserialize, Serialize};
use thiserror::Error;

/// Application error types
#[derive(Error, Debug, Serialize, Deserialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("System error: {0}")]
    SystemError(String),
    
    #[error("File operation error: {0}")]
    FileError(String),
    
    #[error("Security error: {0}")]
    SecurityError(String),
    
    #[error("Validation error: {0}")]
    ValidationError(String),
    
    #[error("Network error: {0}")]
    NetworkError(String),
    
    #[error("Database error: {0}")]
    DatabaseError(String),
    
    #[error("Configuration error: {0}")]
    ConfigError(String),
    
    #[error("Unknown error: {0}")]
    Unknown(String),
}

impl AppError {
    /// Create a new system error
    pub fn system<T: Into<String>>(msg: T) -> Self {
        Self::SystemError(msg.into())
    }
    
    /// Create a new file error
    pub fn file<T: Into<String>>(msg: T) -> Self {
        Self::FileError(msg.into())
    }
    
    /// Create a new security error
    pub fn security<T: Into<String>>(msg: T) -> Self {
        Self::SecurityError(msg.into())
    }
    
    /// Create a new validation error
    pub fn validation<T: Into<String>>(msg: T) -> Self {
        Self::ValidationError(msg.into())
    }
    
    /// Create a new network error
    pub fn network<T: Into<String>>(msg: T) -> Self {
        Self::NetworkError(msg.into())
    }
    
    /// Create a new database error
    pub fn database<T: Into<String>>(msg: T) -> Self {
        Self::DatabaseError(msg.into())
    }
    
    /// Create a new configuration error
    pub fn config<T: Into<String>>(msg: T) -> Self {
        Self::ConfigError(msg.into())
    }
    
    /// Create a new unknown error
    pub fn unknown<T: Into<String>>(msg: T) -> Self {
        Self::Unknown(msg.into())
    }
}

/// Result type alias for application operations
pub type AppResult<T> = Result<T, AppError>;

/// Convert std::io::Error to AppError
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::FileError(err.to_string())
    }
}

/// Convert serde_json::Error to AppError
impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::ValidationError(format!("JSON error: {}", err))
    }
}
