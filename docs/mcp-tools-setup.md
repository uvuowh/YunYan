# 🛠️ MCP 工具链配置指南

> **📢 重要更新**: MCP 工具配置已迁移到专门的配置中心！
>
> 👉 **新的配置位置**: [`mcp-tools-config/`](../mcp-tools-config/)
>
> 请根据你的开发环境选择对应的配置指南：
> - **Cursor IDE 用户**: [`cursor-setup-guide.md`](../mcp-tools-config/cursor-setup-guide.md)
> - **Augment 环境用户**: [`augment-setup-guide.md`](../mcp-tools-config/augment-setup-guide.md)

## 🎯 快速开始

### 🚀 自动配置 (推荐)
```bash
# 运行快速设置脚本
./mcp-tools-config/quick-setup.sh
```

### 📚 手动配置
根据你的开发环境选择对应指南：

#### Cursor IDE 用户
👉 **详细指南**: [`mcp-tools-config/cursor-setup-guide.md`](../mcp-tools-config/cursor-setup-guide.md)

**快速配置**:
```bash
# 复制配置文件
mkdir -p .cursor
cp mcp-tools-config/cursor-configs/mcp.json .cursor/

# 重启 Cursor IDE
```

#### Augment 环境用户
👉 **详细指南**: [`mcp-tools-config/augment-setup-guide.md`](../mcp-tools-config/augment-setup-guide.md)

**配置步骤**:
1. 打开 Augment 设置面板 (⚙️ 齿轮图标)
2. 找到 "MCP servers" 部分
3. 按照指南添加 5 个 MCP 服务器
4. 重启编辑器

## ✅ 工具清单

根据 `rules.md` 要求配置的工具：

| 工具 | 功能 | 优先级 | 状态 |
|------|------|--------|------|
| **mcp-feedback-enhanced** | 交互与反馈 | 🔥 最高 | ✅ 已配置 |
| **context7** | 文档查询 | 🎯 重点强化 | ✅ 已配置 |
| **sequential-thinking** | 思维规划 | 🧠 高 | ✅ 已配置 |
| **shrimp-task-manager** | 任务管理 | 📋 中 | ✅ 已配置 |
| **brave-search** | 网络搜索 | 🔍 可选 | ⚠️ 需要 API Key |

## 🔍 验证配置

```bash
# 运行验证脚本
./mcp-tools-config/shared/verify-tools.sh
```

## 💡 使用示例

配置完成后，你可以使用：

```bash
# 任务管理
"plan task 优化连线功能"
"execute task 连线功能优化"

# 文档查询 (重点强化)
"使用 context7 查询 Vue 3 最新文档"
"Context7 查询 Konva.js 事件处理API"

# 思维规划
"使用 sequential-thinking 分析性能优化方案"

# 网络搜索
"搜索 Canvas 拖拽最佳实践"
```

## 📁 配置文件位置

```
mcp-tools-config/
├── cursor-configs/mcp.json        # Cursor IDE 配置
├── augment-configs/               # Augment 配置模板
└── shared/verify-tools.sh         # 验证脚本
```

## 📚 相关资源

- [📁 配置中心](../mcp-tools-config/) - 完整的配置文件和指南
- [📋 任务管理指南](./shrimp-task-manager-guide.md) - Shrimp Task Manager 详细用法
- [📜 项目规则](../rules.md) - 工具使用规范和优先级

---

🎉 **选择你的环境，开始配置完整的 MCP 工具链！**
