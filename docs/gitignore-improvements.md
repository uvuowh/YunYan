# .gitignore 改进说明

## 改进概述

对项目的 `.gitignore` 文件进行了全面改进，确保所有不应该被版本控制的文件和目录都被正确忽略。

## 主要改进

### 1. 测试相关文件

- `coverage/` - 代码覆盖率报告
- `test-results/` - Playwright 测试结果
- `playwright-report/` - Playwright HTML 报告

### 2. 构建和缓存文件

- `dist/` - 构建输出目录
- `src-tauri/target/` - Rust 构建目录
- `src-tauri/gen/` - Tauri 生成的文件
- `.cache/` - 各种缓存目录

### 3. 开发工具配置

- `.shrimp-task-manager/` - 任务管理器数据
- `.vscode/launch.json` - VSCode 调试配置
- `.vscode/settings.json` - VSCode 设置
- `.vscode/tasks.json` - VSCode 任务配置

### 4. 环境变量和临时文件

- `.env*` - 环境变量文件
- `*.tmp`, `*.temp` - 临时文件
- `*.swp`, `*.swo` - 编辑器交换文件

### 5. 操作系统文件

- `.DS_Store` - macOS 系统文件
- `Thumbs.db` - Windows 缩略图文件
- `Desktop.ini` - Windows 桌面配置

## 清理操作

从 git 跟踪中移除了以下已被跟踪但应该被忽略的文件：

- 所有测试覆盖率报告文件
- 所有 Playwright 测试结果和报告
- Shrimp Task Manager 配置文件

## 验证

使用 `git status --ignored` 命令可以查看所有被忽略的文件，确认 `.gitignore` 正确工作。

## 最佳实践

1. **定期检查**: 定期运行 `git status` 确保没有不应该被跟踪的文件
2. **环境特定**: 将环境特定的配置文件添加到 `.gitignore`
3. **构建产物**: 确保所有构建产物都被忽略
4. **敏感信息**: 永远不要提交包含敏感信息的文件

## 注意事项

- 保留了一些有用的 VSCode 配置文件（如 `extensions.json`）
- 临时测试目录 `src/views/test/` 被忽略
- 工作区文件 `*.code-workspace` 被忽略以避免个人配置冲突
