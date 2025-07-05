# 🌟 YunYan - 智能卡片连线应用

基于 Tauri + Vue.js 的桌面应用，提供直观的卡片创建和连线功能。

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建应用
pnpm build
```

### 🛠️ MCP 工具链配置

本项目配置了完整的 MCP (Model Context Protocol) 工具链，提供 AI 辅助开发体验：

👉 **配置指南**: [`mcp-tools-config/`](./mcp-tools-config/)

**快速配置**:

```bash
# 自动配置脚本
./mcp-tools-config/quick-setup.sh

# 验证配置
./mcp-tools-config/shared/verify-tools.sh
```

**支持的环境**:

- [Cursor IDE 配置指南](./mcp-tools-config/cursor-setup-guide.md)
- [Augment 环境配置指南](./mcp-tools-config/augment-setup-guide.md)

## 📋 项目结构

```
├── src/                    # Vue.js 前端源码
├── src-tauri/             # Tauri 后端源码
├── mcp-tools-config/      # MCP 工具链配置中心
├── docs/                  # 项目文档
├── scripts/               # 实用脚本
└── rules.md              # 开发规范和规则
```

## 🎯 核心功能

- ✅ 卡片创建和管理
- ✅ 右键连线操作
- ✅ 连接状态管理 (无连接 → 单向 → 双向 → 其他方向 → 无连接)
- ✅ Canvas 拖拽交互
- ✅ 响应式界面设计

## 📚 文档

- [MCP 工具配置](./docs/mcp-tools-setup.md)
- [任务管理指南](./docs/shrimp-task-manager-guide.md)
- [开发规范](./rules.md)

---

## 开发规范

【代码生成原则（按优先级）】

1. First Principles（第一性原理）：梳理最核心需求与边界
2. YAGNI：只实现当前真正需要的功能
3. KISS：保持设计和实现的简单性
4. SOLID：面向对象/模块化设计时，遵循单一职责、开放封闭等
5. DRY：消除重复，提炼公用逻辑

### 根据场景动态调整顺序

- 架构级／需求分析（Project Kickoff） First Principles → YAGNI → KISS → SOLID → DRY
- 新功能迭代／增量开发：YAGNI → KISS → SOLID → DRY → First Principles
- 小函数／工具库实现：KISS → DRY → YAGNI → SOLID → First Principles
- 复杂业务组件／面向对象建模：First Principles → SOLID → YAGNI → KISS → DRY
