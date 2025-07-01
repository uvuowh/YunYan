// 白板相关命令实现
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

// 基础类型定义
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Size {
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Viewport {
    pub x: f64,
    pub y: f64,
    pub zoom: f64,
}

// 卡片相关类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardStyle {
    #[serde(rename = "backgroundColor")]
    pub background_color: String,
    #[serde(rename = "borderColor")]
    pub border_color: String,
    #[serde(rename = "borderWidth")]
    pub border_width: f64,
    #[serde(rename = "borderRadius")]
    pub border_radius: f64,
    #[serde(rename = "textColor")]
    pub text_color: String,
    #[serde(rename = "fontSize")]
    pub font_size: f64,
    #[serde(rename = "fontFamily")]
    pub font_family: String,
    pub opacity: f64,
    pub shadow: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardMetadata {
    pub tags: Vec<String>,
    pub priority: String, // 'low' | 'medium' | 'high'
    pub status: String,   // 'draft' | 'review' | 'done'
    pub assignee: Option<String>,
    #[serde(rename = "dueDate")]
    pub due_date: Option<i64>,
    pub attachments: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhiteboardCard {
    pub id: String,
    pub title: String,
    pub content: String,
    pub position: Point,
    pub size: Size,
    pub style: CardStyle,
    pub metadata: CardMetadata,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
}

// 白板类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhiteboardSettings {
    #[serde(rename = "gridEnabled")]
    pub grid_enabled: bool,
    #[serde(rename = "gridSize")]
    pub grid_size: f64,
    #[serde(rename = "gridColor")]
    pub grid_color: String,
    #[serde(rename = "snapToGrid")]
    pub snap_to_grid: bool,
    #[serde(rename = "backgroundColor")]
    pub background_color: String,
    #[serde(rename = "showMinimap")]
    pub show_minimap: bool,
    #[serde(rename = "autoSave")]
    pub auto_save: bool,
    #[serde(rename = "collaborationEnabled")]
    pub collaboration_enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhiteboardMetadata {
    pub tags: Vec<String>,
    pub category: String,
    #[serde(rename = "isPublic")]
    pub is_public: bool,
    #[serde(rename = "shareUrl")]
    pub share_url: Option<String>,
    pub version: i32,
    pub thumbnail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Whiteboard {
    pub id: String,
    pub name: String,
    pub description: String,
    pub viewport: Viewport,
    pub cards: Vec<WhiteboardCard>,
    pub connections: Vec<serde_json::Value>, // 暂时使用 JSON 值
    pub sections: Vec<serde_json::Value>,    // 暂时使用 JSON 值
    pub settings: WhiteboardSettings,
    pub metadata: WhiteboardMetadata,
    #[serde(rename = "createdAt")]
    pub created_at: i64,
    #[serde(rename = "updatedAt")]
    pub updated_at: i64,
}

// 请求和响应类型
#[derive(Debug, Deserialize)]
pub struct CreateWhiteboardRequest {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateWhiteboardRequest {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub viewport: Option<Viewport>,
    pub settings: Option<WhiteboardSettings>,
}

#[derive(Debug, Deserialize)]
pub struct CreateCardRequest {
    pub whiteboard_id: String,
    pub title: String,
    pub content: String,
    pub position: Point,
    pub size: Size,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCardRequest {
    pub whiteboard_id: String,
    pub card_id: String,
    pub title: Option<String>,
    pub content: Option<String>,
    pub position: Option<Point>,
    pub size: Option<Size>,
    pub style: Option<CardStyle>,
}

#[derive(Debug, Deserialize)]
pub struct DeleteCardRequest {
    pub whiteboard_id: String,
    pub card_id: String,
}

// 默认值
impl Default for CardStyle {
    fn default() -> Self {
        Self {
            background_color: "#ffffff".to_string(),
            border_color: "#e0e0e0".to_string(),
            border_width: 2.0,
            border_radius: 8.0,
            text_color: "#333333".to_string(),
            font_size: 14.0,
            font_family: "Arial, sans-serif".to_string(),
            opacity: 1.0,
            shadow: true,
        }
    }
}

impl Default for CardMetadata {
    fn default() -> Self {
        Self {
            tags: Vec::new(),
            priority: "medium".to_string(),
            status: "draft".to_string(),
            assignee: None,
            due_date: None,
            attachments: Vec::new(),
        }
    }
}

impl Default for WhiteboardSettings {
    fn default() -> Self {
        Self {
            grid_enabled: true,
            grid_size: 50.0,
            grid_color: "#e0e0e0".to_string(),
            snap_to_grid: false,
            background_color: "#f8f9fa".to_string(),
            show_minimap: false,
            auto_save: true,
            collaboration_enabled: false,
        }
    }
}

// 简单的内存存储 (生产环境应该使用数据库)
static mut WHITEBOARDS: Option<HashMap<String, Whiteboard>> = None;

fn get_whiteboards() -> &'static mut HashMap<String, Whiteboard> {
    unsafe {
        if WHITEBOARDS.is_none() {
            WHITEBOARDS = Some(HashMap::new());
        }
        WHITEBOARDS.as_mut().unwrap()
    }
}

// 获取数据目录
fn get_data_dir() -> Result<PathBuf, String> {
    let data_dir = dirs::data_dir()
        .ok_or("无法获取数据目录")?
        .join("yunyan")
        .join("whiteboards");

    if !data_dir.exists() {
        fs::create_dir_all(&data_dir).map_err(|e| format!("创建数据目录失败: {}", e))?;
    }

    Ok(data_dir)
}

// 保存白板到文件
fn save_whiteboard_to_file(whiteboard: &Whiteboard) -> Result<(), String> {
    let data_dir = get_data_dir()?;
    let file_path = data_dir.join(format!("{}.json", whiteboard.id));

    let json =
        serde_json::to_string_pretty(whiteboard).map_err(|e| format!("序列化白板失败: {}", e))?;

    fs::write(file_path, json).map_err(|e| format!("保存白板文件失败: {}", e))?;

    Ok(())
}

// 从文件加载白板
fn load_whiteboard_from_file(id: &str) -> Result<Whiteboard, String> {
    let data_dir = get_data_dir()?;
    let file_path = data_dir.join(format!("{}.json", id));

    if !file_path.exists() {
        return Err("白板文件不存在".to_string());
    }

    let json = fs::read_to_string(file_path).map_err(|e| format!("读取白板文件失败: {}", e))?;

    let whiteboard: Whiteboard =
        serde_json::from_str(&json).map_err(|e| format!("解析白板文件失败: {}", e))?;

    Ok(whiteboard)
}

// 命令实现
#[tauri::command]
pub fn create_whiteboard(request: CreateWhiteboardRequest) -> Result<Whiteboard, String> {
    let now = chrono::Utc::now().timestamp();
    let id = format!("wb_{}", now);

    let whiteboard = Whiteboard {
        id: id.clone(),
        name: request.name,
        description: request.description.unwrap_or_default(),
        viewport: Viewport {
            x: 0.0,
            y: 0.0,
            zoom: 1.0,
        },
        cards: Vec::new(),
        connections: Vec::new(),
        sections: Vec::new(),
        settings: WhiteboardSettings::default(),
        metadata: WhiteboardMetadata {
            tags: Vec::new(),
            category: "default".to_string(),
            is_public: false,
            share_url: None,
            version: 1,
            thumbnail: None,
        },
        created_at: now,
        updated_at: now,
    };

    // 保存到内存
    get_whiteboards().insert(id.clone(), whiteboard.clone());

    // 保存到文件
    save_whiteboard_to_file(&whiteboard)?;

    Ok(whiteboard)
}

#[tauri::command]
pub fn get_whiteboard(id: String) -> Result<Whiteboard, String> {
    // 先从内存查找
    if let Some(whiteboard) = get_whiteboards().get(&id) {
        return Ok(whiteboard.clone());
    }

    // 从文件加载
    let whiteboard = load_whiteboard_from_file(&id)?;
    get_whiteboards().insert(id, whiteboard.clone());

    Ok(whiteboard)
}

#[tauri::command]
pub fn list_whiteboards() -> Result<Vec<Whiteboard>, String> {
    let data_dir = get_data_dir()?;
    let mut whiteboards = Vec::new();

    if data_dir.exists() {
        let entries = fs::read_dir(data_dir).map_err(|e| format!("读取数据目录失败: {}", e))?;

        for entry in entries {
            let entry = entry.map_err(|e| format!("读取目录项失败: {}", e))?;
            let path = entry.path();

            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Some(file_stem) = path.file_stem().and_then(|s| s.to_str()) {
                    match load_whiteboard_from_file(file_stem) {
                        Ok(whiteboard) => {
                            get_whiteboards().insert(file_stem.to_string(), whiteboard.clone());
                            whiteboards.push(whiteboard);
                        }
                        Err(e) => {
                            log::warn!("加载白板文件失败 {}: {}", file_stem, e);
                        }
                    }
                }
            }
        }
    }

    Ok(whiteboards)
}

#[tauri::command]
pub fn update_whiteboard(request: UpdateWhiteboardRequest) -> Result<Whiteboard, String> {
    let whiteboards = get_whiteboards();

    let whiteboard = whiteboards.get_mut(&request.id).ok_or("白板不存在")?;

    // 更新字段
    if let Some(name) = request.name {
        whiteboard.name = name;
    }
    if let Some(description) = request.description {
        whiteboard.description = description;
    }
    if let Some(viewport) = request.viewport {
        whiteboard.viewport = viewport;
    }
    if let Some(settings) = request.settings {
        whiteboard.settings = settings;
    }

    whiteboard.updated_at = chrono::Utc::now().timestamp();

    // 保存到文件
    save_whiteboard_to_file(whiteboard)?;

    Ok(whiteboard.clone())
}

#[tauri::command]
pub fn delete_whiteboard(id: String) -> Result<(), String> {
    // 从内存删除
    get_whiteboards().remove(&id);

    // 删除文件
    let data_dir = get_data_dir()?;
    let file_path = data_dir.join(format!("{}.json", id));

    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| format!("删除白板文件失败: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn create_card(request: CreateCardRequest) -> Result<WhiteboardCard, String> {
    let whiteboards = get_whiteboards();

    let whiteboard = whiteboards
        .get_mut(&request.whiteboard_id)
        .ok_or("白板不存在")?;

    let now = chrono::Utc::now().timestamp();
    let card = WhiteboardCard {
        id: format!("card_{}", now),
        title: request.title,
        content: request.content,
        position: request.position,
        size: request.size,
        style: CardStyle::default(),
        metadata: CardMetadata::default(),
        created_at: now,
        updated_at: now,
    };

    whiteboard.cards.push(card.clone());
    whiteboard.updated_at = now;

    // 保存到文件
    save_whiteboard_to_file(whiteboard)?;

    Ok(card)
}

#[tauri::command]
pub fn update_card(request: UpdateCardRequest) -> Result<WhiteboardCard, String> {
    let whiteboards = get_whiteboards();

    let whiteboard = whiteboards
        .get_mut(&request.whiteboard_id)
        .ok_or("白板不存在")?;

    let card = whiteboard
        .cards
        .iter_mut()
        .find(|c| c.id == request.card_id)
        .ok_or("卡片不存在")?;

    // 更新字段
    if let Some(title) = request.title {
        card.title = title;
    }
    if let Some(content) = request.content {
        card.content = content;
    }
    if let Some(position) = request.position {
        card.position = position;
    }
    if let Some(size) = request.size {
        card.size = size;
    }
    if let Some(style) = request.style {
        card.style = style;
    }

    card.updated_at = chrono::Utc::now().timestamp();
    whiteboard.updated_at = card.updated_at;

    // 克隆卡片和白板以避免借用冲突
    let updated_card = card.clone();
    let whiteboard_clone = whiteboard.clone();

    // 保存到文件
    save_whiteboard_to_file(&whiteboard_clone)?;

    Ok(updated_card)
}

#[tauri::command]
pub fn delete_card(request: DeleteCardRequest) -> Result<(), String> {
    let whiteboards = get_whiteboards();

    let whiteboard = whiteboards
        .get_mut(&request.whiteboard_id)
        .ok_or("白板不存在")?;

    let initial_len = whiteboard.cards.len();
    whiteboard.cards.retain(|c| c.id != request.card_id);

    if whiteboard.cards.len() == initial_len {
        return Err("卡片不存在".to_string());
    }

    whiteboard.updated_at = chrono::Utc::now().timestamp();

    // 保存到文件
    save_whiteboard_to_file(whiteboard)?;

    Ok(())
}
