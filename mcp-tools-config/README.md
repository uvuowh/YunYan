# 🛠️ MCP 工具链配置中心

这个文件夹包含了为不同开发环境配置 MCP (Model Context Protocol) 工具链的完整指南和配置文件。

## 📁 文件结构

```
mcp-tools-config/
├── README.md                    # 本文件 - 配置中心说明
├── quick-setup.sh              # 🤖 智能配置脚本 (推荐)
├── cursor-setup-guide.md       # Cursor IDE 配置指南
├── augment-setup-guide.md      # Augment 环境配置指南
├── cursor-configs/              # Cursor 配置文件
│   ├── mcp.json                # Cursor MCP 配置
│   └── mcp-current.json        # 当前项目配置备份
├── augment-configs/             # Augment 配置文件
│   └── settings-template.json  # Augment 设置模板
└── shared/                      # 共享配置和脚本
    ├── augment-auto-config.sh  # 🤖 Augment 自动配置
    ├── verify-tools.sh         # 工具验证脚本
    ├── api-keys-template.env   # API Keys 模板
    └── mcp-config-backup.json  # 原有配置备份
```

## 🎯 支持的工具

根据项目 `rules.md` 要求，配置以下 MCP 工具：

### 核心工具 (必需)

- **mcp-feedback-enhanced** - 交互与反馈 (最高优先级)
- **shrimp-task-manager** - 任务管理
- **sequential-thinking** - 思维与规划
- **context7** - 文档查询 (重点强化，首选权威工具)

### 扩展工具 (可选)

- **brave-search** - 网络搜索，用于广泛概念和行业实践搜索
- **tavily-search** - 备选网络搜索工具
- **playwright** - E2E 测试自动化，支持浏览器操作和测试执行

## 🚀 快速开始

### 🤖 智能配置 (推荐)

```bash
# 运行智能配置脚本 - 自动检测环境并配置
./quick-setup.sh
```

**智能功能**:

- ✅ 自动检测 Cursor IDE、Augment、VSCode
- 🎯 智能推荐最佳配置选项
- 🤖 Augment 自动配置 (支持多种安装路径)
- 📋 提供默认选择，一键配置

### 🔧 高级配置

```bash
# 仅配置 Augment (自动检测设置文件)
./shared/augment-auto-config.sh

# 验证所有工具配置
./shared/verify-tools.sh
```

### 📚 手动配置 - 选择你的开发环境

#### 🎯 Cursor IDE 用户

👉 **阅读**: [`cursor-setup-guide.md`](./cursor-setup-guide.md)

- 完整的 Cursor IDE MCP 配置指南
- 自动加载配置
- 即开即用的体验

#### 🔧 Augment 环境用户

👉 **阅读**: [`augment-setup-guide.md`](./augment-setup-guide.md)

- Augment 专用 MCP 配置指南
- 设置面板和 JSON 两种配置方式
- 兼容性优化建议

#### 🔄 多环境用户

两个指南都可以参考，配置文件已分别优化。

## ⚙️ 配置优先级

根据 `rules.md` 中的工具使用优先级：

1. **mcp-feedback-enhanced** (最高优先级，所有交互的终点)
2. **context7** (重点强化，首选权威文档工具)
3. **sequential-thinking** (复杂问题思维规划)
4. **shrimp-task-manager** (任务管理)
5. **brave-search/tavily-search** (广泛概念搜索)

## 🔧 通用要求

### 系统要求

- Node.js >= 16
- npm 或 pnpm
- 网络连接 (用于下载 MCP 包)

### API Keys (可选)

- Brave Search API Key (免费层可用)
- 其他工具无需额外 API Keys

## 📚 相关文档

- [项目规则](../rules.md) - 工具使用规范和优先级
- [Shrimp Task Manager 指南](../docs/shrimp-task-manager-guide.md)
- [Playwright MCP 工具指南](./playwright-mcp-guide.md) - E2E 测试自动化配置
- [MCP 官方文档](https://modelcontextprotocol.io/)

## 🆘 获取帮助

如果遇到配置问题：

1. 查看对应环境的详细指南
2. 运行 `shared/verify-tools.sh` 验证配置
3. 检查系统要求和依赖
4. 查看各工具的官方文档

---

🎉 **选择你的环境，开始配置完整的 MCP 工具链！**
