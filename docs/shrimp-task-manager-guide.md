# Shrimp Task Manager 使用指南

## 概述

Shrimp Task Manager 是一个基于 MCP (Model Context Protocol) 的智能任务管理系统，专为 AI 代理设计，提供结构化的编程工作流程。

## 快速开始

### 1. 在 VSCode 中使用

#### 通过任务面板

1. 按 `Cmd+Shift+P` (macOS) 或 `Ctrl+Shift+P` (Windows/Linux)
2. 输入 "Tasks: Run Task"
3. 选择以下任务之一：
   - **启动 Shrimp Task Manager** - 启动 MCP 服务器
   - **启动 Shrimp Web GUI** - 启动 Web 界面
   - **检查 Shrimp 状态** - 检查版本和状态

#### 通过命令行脚本

```bash
# 启动服务
./scripts/shrimp-manager.sh start

# 启动 Web GUI
./scripts/shrimp-manager.sh gui

# 检查状态
./scripts/shrimp-manager.sh status

# 查看日志
./scripts/shrimp-manager.sh logs

# 停止服务
./scripts/shrimp-manager.sh stop
```

### 2. 与 Cursor IDE 集成

如果你使用 Cursor IDE，项目已经配置了 `.cursor/mcp.json` 文件：

1. 重启 Cursor IDE
2. Shrimp Task Manager 将自动作为 MCP 服务器加载
3. 你可以直接与 AI 助手交互使用任务管理功能

### 3. 与 Claude Desktop 集成

将 `.shrimp-task-manager/mcp-config.json` 的内容复制到你的 Claude Desktop 配置文件中。

## 主要功能

### 任务规划

- **命令**: "plan task [任务描述]"
- **功能**: 分析需求，创建结构化任务计划

### 任务执行

- **命令**: "execute task [任务名称或ID]"
- **功能**: 执行指定任务

### 研究模式

- **命令**: "research [主题]" 或 "enter research mode for [技术/问题]"
- **功能**: 系统性技术调研和知识收集

### 项目规则初始化

- **命令**: "init project rules"
- **功能**: 建立项目标准和规则

### 连续模式

- **命令**: "continuous mode"
- **功能**: 自动执行所有任务队列

## 工作流程示例

### 1. 新功能开发

```
1. "init project rules" - 初始化项目规则
2. "plan task 添加用户登录功能" - 规划任务
3. "execute task 用户登录功能" - 执行任务
4. "continuous mode" - 自动执行剩余任务
```

### 2. 技术调研

```
1. "research Vue 3 Composition API 最佳实践"
2. "plan task 重构组件使用 Composition API"
3. "execute task 重构组件"
```

## 配置说明

### 环境变量

- `DATA_DIR`: 数据存储目录
- `TEMPLATES_USE`: 模板语言 (zh/en)
- `ENABLE_GUI`: 是否启用 Web GUI
- `LOG_LEVEL`: 日志级别

### 自定义提示词

可以通过环境变量自定义 AI 提示词：

- `MCP_PROMPT_PLAN_TASK`: 自定义任务规划提示
- `MCP_PROMPT_EXECUTE_TASK_APPEND`: 额外的执行指令

## 故障排除

### 常见问题

1. **服务无法启动**
   - 检查端口是否被占用
   - 确认 Node.js 版本 >= 16
   - 查看日志文件: `./scripts/shrimp-manager.sh logs`

2. **数据丢失**
   - 检查 `DATA_DIR` 路径是否正确
   - 确保目录有写入权限

3. **MCP 连接失败**
   - 重启 Cursor IDE 或 Claude Desktop
   - 检查配置文件格式是否正确

### 重置数据

```bash
./scripts/shrimp-manager.sh clean
```

## 高级用法

### 自定义模板

1. 复制 `src/prompts/templates_en` 到数据目录
2. 重命名为自定义名称
3. 修改模板内容
4. 设置 `TEMPLATES_USE` 环境变量

### 项目特定配置

每个项目可以有独立的配置：

- 创建项目特定的 `.cursor/mcp.json`
- 使用不同的 `DATA_DIR` 路径

## 支持的客户端

- ✅ Cursor IDE
- ✅ Claude Desktop
- ✅ 任何支持 MCP 的客户端
- ⚠️ VSCode (通过脚本和任务，无直接 MCP 支持)

## 更多资源

- [官方文档](https://github.com/cjo4m06/mcp-shrimp-task-manager)
- [提示词自定义指南](https://github.com/cjo4m06/mcp-shrimp-task-manager/blob/main/docs/en/prompt-customization.md)
- [更新日志](https://github.com/cjo4m06/mcp-shrimp-task-manager/blob/main/CHANGELOG.md)
