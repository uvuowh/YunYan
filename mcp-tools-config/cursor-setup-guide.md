# 🎯 Cursor IDE MCP 工具链配置指南

## 📋 概述

本指南将帮你在 Cursor IDE 中配置完整的 MCP 工具链，实现高效的 AI 辅助开发工作流。

## ✅ 工具清单

根据项目 `rules.md` 要求配置以下工具：

### 🔥 核心工具 (必需)

- **mcp-feedback-enhanced** - 交互与反馈 (最高优先级)
- **shrimp-task-manager** - 任务管理
- **sequential-thinking** - 思维与规划
- **context7** - 文档查询 (重点强化)

### 🌐 扩展工具 (可选)

- **brave-search** - 网络搜索
- **playwright** - E2E 测试自动化和浏览器操作

## 🚀 快速配置

### 步骤 1: 复制配置文件

将预配置的 MCP 配置文件复制到项目根目录：

```bash
# 如果 .cursor 目录不存在，先创建
mkdir -p .cursor

# 复制配置文件
cp mcp-tools-config/cursor-configs/mcp.json .cursor/
```

### 步骤 2: 配置 API Keys (可选)

编辑 `.cursor/mcp.json`，替换 API Key：

```json
{
  "mcpServers": {
    "brave-search": {
      "env": {
        "BRAVE_API_KEY": "YOUR_ACTUAL_API_KEY_HERE"
      }
    }
  }
}
```

**获取 Brave Search API Key:**

1. 访问 [Brave Search API](https://api.search.brave.com/)
2. 注册免费账户
3. 获取 API Key
4. 替换配置文件中的占位符

### 步骤 3: 重启 Cursor IDE

保存配置后，重启 Cursor IDE 以加载 MCP 服务器。

## 🔧 手动配置 (备选方法)

如果你需要手动配置或自定义设置：

### 创建 .cursor/mcp.json

```json
{
  "mcpServers": {
    "mcp-feedback-enhanced": {
      "command": "npx",
      "args": ["-y", "mcp-feedback-enhanced"],
      "env": {
        "LOG_LEVEL": "info"
      }
    },
    "shrimp-task-manager": {
      "command": "npx",
      "args": ["-y", "mcp-shrimp-task-manager"],
      "env": {
        "DATA_DIR": "/Users/uvu/YunYan/.shrimp-task-manager/data",
        "TEMPLATES_USE": "zh",
        "ENABLE_GUI": "true",
        "LOG_LEVEL": "info"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "mcp-sequential-thinking"],
      "env": {
        "LOG_LEVEL": "info"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {
        "LOG_LEVEL": "info"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "mcp-brave-search"],
      "env": {
        "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY_HERE",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## ✨ 使用示例

配置完成后，你可以在 Cursor 中直接使用：

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

### 检查配置文件

```bash
# 验证配置文件存在
ls -la .cursor/mcp.json

# 检查配置语法
cat .cursor/mcp.json | jq .
```

### 测试工具功能

在 Cursor 中尝试以下命令：

```
"检查 MCP 工具状态"
"plan task 测试任务"
"使用 context7 查询测试"
```

## 🚨 故障排除

### 工具无法加载

1. **检查 Node.js 版本**: `node --version` (需要 >= 16)
2. **检查网络连接**: 确保可以访问 npm registry
3. **重启 Cursor**: 配置更改后必须重启
4. **查看日志**: 检查 Cursor 控制台错误信息

### 配置不生效

1. **验证 JSON 语法**: 使用 `jq` 或在线 JSON 验证器
2. **检查路径**: 确保 `.cursor/mcp.json` 在项目根目录
3. **权限问题**: 确保文件可读

### API Key 相关

1. **Brave Search**: 确保 API Key 有效且未过期
2. **其他工具**: 无需额外 API Keys

## 📁 相关文件

- `cursor-configs/mcp.json` - 预配置的 MCP 配置文件
- `shared/verify-tools.sh` - 工具验证脚本
- `shared/api-keys-template.env` - API Keys 模板

## 🔄 更新配置

当需要更新工具或添加新工具时：

1. 编辑 `.cursor/mcp.json`
2. 添加新的 MCP 服务器配置
3. 重启 Cursor IDE
4. 测试新工具功能

---

🎉 **Cursor IDE MCP 工具链配置完成！享受高效的 AI 辅助开发体验！**
