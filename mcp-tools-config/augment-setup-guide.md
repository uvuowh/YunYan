# 🔧 Augment 环境 MCP 工具链配置指南

## 📋 概述

本指南将帮你在 Augment 环境中配置完整的 MCP 工具链，实现高效的 AI 辅助开发工作流。

## ✅ 工具清单

根据项目 `rules.md` 要求配置以下工具：

### 🔥 核心工具 (必需)
- **mcp-feedback-enhanced** - 交互与反馈 (最高优先级)
- **shrimp-task-manager** - 任务管理  
- **sequential-thinking** - 思维与规划
- **context7** - 文档查询 (重点强化)

### 🌐 扩展工具 (可选)
- **brave-search** - 网络搜索

## 🚀 配置方法

Augment 提供两种配置 MCP 服务器的方式：

### 方法 1: 使用 Augment 设置面板 (推荐)

#### 步骤 1: 打开设置面板
- 点击 Augment 面板右上角的 ⚙️ **齿轮图标**
- 或按 `Cmd/Ctrl + Shift + P` → 搜索 "Edit Settings"

#### 步骤 2: 添加 MCP 服务器
在设置面板中找到 **"MCP servers"** 部分，点击 `+` 按钮逐个添加：

**🔥 配置 1: mcp-feedback-enhanced (最高优先级)**
```
Name: mcp-feedback-enhanced
Command: npx
Args: -y mcp-feedback-enhanced
Environment Variables:
  LOG_LEVEL: info
```

**📋 配置 2: shrimp-task-manager**
```
Name: shrimp-task-manager  
Command: npx
Args: -y mcp-shrimp-task-manager
Environment Variables:
  DATA_DIR: /Users/uvu/YunYan/.shrimp-task-manager/data
  TEMPLATES_USE: zh
  ENABLE_GUI: true
  LOG_LEVEL: info
```

**🧠 配置 3: sequential-thinking**
```
Name: sequential-thinking
Command: npx
Args: -y mcp-sequential-thinking
Environment Variables:
  LOG_LEVEL: info
```

**📚 配置 4: context7 (重点强化)**
```
Name: context7
Command: npx
Args: -y @context7/mcp-server
Environment Variables:
  LOG_LEVEL: info
```

**🔍 配置 5: brave-search (可选)**
```
Name: brave-search
Command: npx
Args: -y mcp-brave-search
Environment Variables:
  BRAVE_API_KEY: YOUR_BRAVE_API_KEY_HERE
  LOG_LEVEL: info
```

#### 步骤 3: 重启编辑器
配置完成后重启 VS Code 或你的编辑器。

### 方法 2: 编辑 settings.json (高级用户)

#### 步骤 1: 打开设置文件
1. 按 `Cmd/Ctrl + Shift + P`
2. 选择 "Edit Settings"  
3. 点击 "Advanced" → "Edit in settings.json"

#### 步骤 2: 添加配置
将以下配置添加到 settings.json：

```json
{
  "augment.advanced": {
    "mcpServers": [
      {
        "name": "mcp-feedback-enhanced",
        "command": "npx",
        "args": ["-y", "mcp-feedback-enhanced"],
        "env": {
          "LOG_LEVEL": "info"
        }
      },
      {
        "name": "shrimp-task-manager",
        "command": "npx",
        "args": ["-y", "mcp-shrimp-task-manager"],
        "env": {
          "DATA_DIR": "/Users/uvu/YunYan/.shrimp-task-manager/data",
          "TEMPLATES_USE": "zh",
          "ENABLE_GUI": "true",
          "LOG_LEVEL": "info"
        }
      },
      {
        "name": "sequential-thinking",
        "command": "npx",
        "args": ["-y", "mcp-sequential-thinking"],
        "env": {
          "LOG_LEVEL": "info"
        }
      },
      {
        "name": "context7",
        "command": "npx",
        "args": ["-y", "@context7/mcp-server"],
        "env": {
          "LOG_LEVEL": "info"
        }
      },
      {
        "name": "brave-search",
        "command": "npx",
        "args": ["-y", "mcp-brave-search"],
        "env": {
          "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY_HERE",
          "LOG_LEVEL": "info"
        }
      }
    ]
  }
}
```

#### 步骤 3: 保存并重启
保存设置文件后重启编辑器。

## 🔑 API Key 配置

### Brave Search API Key (可选但推荐)
1. 访问 [Brave Search API](https://api.search.brave.com/)
2. 注册免费账户并获取 API Key
3. 在配置中将 `YOUR_BRAVE_API_KEY_HERE` 替换为实际 API Key

## ✨ 使用示例

配置完成后，你可以在 Augment 中使用：

### 📋 任务管理
```
"plan task 优化连线功能"
"execute task 连线功能优化"
"continuous mode"
"init project rules"
```

### 🧠 思维规划
```
"使用 sequential-thinking 分析性能优化方案"
"分步思考用户体验改进策略"
```

### 📚 文档查询 (重点强化)
```
"使用 context7 查询 Vue 3 最新文档"
"Context7 查询 Konva.js 事件处理API"
"查询 Tauri 桌面应用开发指南"
```

### 🔍 网络搜索
```
"搜索 Canvas 拖拽最佳实践"
"查找 Vue 3 性能优化技巧"
"搜索最新的前端开发趋势"
```

### 💬 交互反馈 (自动)
所有交互都会自动使用 mcp-feedback-enhanced 处理。

## 🔍 验证配置

### 检查配置状态
在 Augment 中尝试以下命令：
```
"检查 MCP 工具状态"
"plan task 测试任务"
"使用 context7 查询测试"
"使用 sequential-thinking 分析测试问题"
```

### 查看已加载的工具
在 Augment 设置面板中查看 MCP 服务器列表，确认所有工具都已正确加载。

## 🚨 故障排除

### 工具无法加载
1. **检查 Node.js 版本**: `node --version` (需要 >= 16)
2. **检查网络连接**: 确保可以访问 npm registry
3. **重启编辑器**: 配置更改后必须重启
4. **查看 Augment 控制台**: 检查错误信息

### 配置不生效
1. **验证 JSON 语法**: 确保配置文件格式正确
2. **检查服务器名称**: 确保名称唯一且无特殊字符
3. **权限问题**: 确保有足够权限执行 npx 命令

### 兼容性问题
1. **服务器兼容性**: 不是所有 MCP 服务器都与 Augment 兼容
2. **版本更新**: MCP 标准和 Augment 支持经常更新
3. **降级方案**: 如果某个工具不兼容，可以暂时禁用

## 📁 相关文件

- `augment-configs/settings-template.json` - Augment 设置模板
- `shared/verify-tools.sh` - 工具验证脚本
- `shared/api-keys-template.env` - API Keys 模板

## 🔄 更新配置

当需要更新工具或添加新工具时：

1. 在 Augment 设置面板中编辑或添加服务器
2. 或直接编辑 settings.json
3. 重启编辑器
4. 测试新工具功能

---

🎉 **Augment MCP 工具链配置完成！享受高效的 AI 辅助开发体验！**
