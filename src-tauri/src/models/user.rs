use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// User information structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    /// Unique user identifier
    pub id: Uuid,
    /// User's display name
    pub name: String,
    /// User's email address
    pub email: Option<String>,
    /// User preferences
    pub preferences: UserPreferences,
    /// Account creation timestamp
    pub created_at: u64,
    /// Last login timestamp
    pub last_login: Option<u64>,
}

/// User preferences structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserPreferences {
    /// UI theme preference
    pub theme: Theme,
    /// Language preference
    pub language: String,
    /// Notification settings
    pub notifications: NotificationSettings,
    /// Application-specific settings
    pub app_settings: AppSettings,
}

/// Theme enumeration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Light,
    Dark,
    Auto,
}

/// Notification settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
    /// Enable desktop notifications
    pub desktop: bool,
    /// Enable sound notifications
    pub sound: bool,
    /// Notification frequency
    pub frequency: NotificationFrequency,
}

/// Notification frequency
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NotificationFrequency {
    Immediate,
    Hourly,
    Daily,
    Never,
}

/// Application-specific settings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    /// Auto-save interval in seconds
    pub auto_save_interval: u32,
    /// Maximum number of recent files to remember
    pub max_recent_files: u32,
    /// Enable analytics
    pub analytics_enabled: bool,
}

impl Default for UserPreferences {
    fn default() -> Self {
        Self {
            theme: Theme::Auto,
            language: "en".to_string(),
            notifications: NotificationSettings::default(),
            app_settings: AppSettings::default(),
        }
    }
}

impl Default for NotificationSettings {
    fn default() -> Self {
        Self {
            desktop: true,
            sound: false,
            frequency: NotificationFrequency::Immediate,
        }
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            auto_save_interval: 300, // 5 minutes
            max_recent_files: 10,
            analytics_enabled: false,
        }
    }
}
