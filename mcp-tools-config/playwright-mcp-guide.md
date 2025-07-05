# 🎭 Playwright MCP 工具配置指南

## 📖 概述

Playwright MCP 工具为 AI 助手提供了强大的浏览器自动化和 E2E 测试能力，可以直接在对话中执行浏览器操作、运行测试、生成测试报告等。

## 🎯 主要功能

### 🌐 浏览器操作

- 打开网页和导航
- 点击、输入、选择等交互操作
- 截图和页面快照
- 网络请求监控

### 🧪 测试执行

- 运行 Playwright 测试套件
- 生成测试报告
- 调试失败的测试
- 并行测试执行

### 📊 测试分析

- 测试结果分析
- 性能指标收集
- 错误诊断和建议
- 测试覆盖率报告

## ⚙️ 配置说明

### 环境变量

```json
{
  "env": {
    "LOG_LEVEL": "info",
    "PLAYWRIGHT_BROWSERS_PATH": "/Users/uvu/YunYan/node_modules/@playwright/test",
    "PLAYWRIGHT_CONFIG_PATH": "/Users/uvu/YunYan/playwright.config.ts"
  }
}
```

**配置参数说明**:

- `LOG_LEVEL`: 日志级别 (debug, info, warn, error)
- `PLAYWRIGHT_BROWSERS_PATH`: Playwright 浏览器安装路径
- `PLAYWRIGHT_CONFIG_PATH`: Playwright 配置文件路径

### 项目集成

确保项目中已安装 Playwright：

```bash
# 检查 Playwright 安装
npx playwright --version

# 如果未安装，运行安装命令
npm install -D @playwright/test
npx playwright install
```

## 🚀 使用场景

### 1. E2E 测试执行

```
请运行 E2E 测试并分析结果
```

AI 助手将：

- 执行 `npm run test:e2e`
- 分析测试结果
- 提供失败测试的详细信息
- 建议修复方案

### 2. 浏览器自动化

```
请打开应用首页并截图
```

AI 助手将：

- 启动浏览器
- 导航到指定页面
- 执行交互操作
- 生成截图和报告

### 3. 测试调试

```
帮我调试失败的连接创建测试
```

AI 助手将：

- 分析测试失败原因
- 检查相关代码
- 提供修复建议
- 重新运行验证

## 🔧 高级配置

### 自定义浏览器设置

在 `playwright.config.ts` 中配置：

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
```

### 测试报告配置

```typescript
reporter: [
  ['html', { outputFolder: 'playwright-report' }],
  ['json', { outputFile: 'test-results.json' }],
  ['junit', { outputFile: 'test-results.xml' }],
],
```

## 🛠️ 故障排除

### 常见问题

1. **浏览器未安装**

   ```bash
   npx playwright install
   ```

2. **权限问题**

   ```bash
   chmod +x node_modules/.bin/playwright
   ```

3. **配置文件路径错误**
   - 检查 `PLAYWRIGHT_CONFIG_PATH` 环境变量
   - 确保配置文件存在且语法正确

### 调试模式

启用详细日志：

```json
{
  "env": {
    "LOG_LEVEL": "debug",
    "DEBUG": "pw:*"
  }
}
```

## 📚 相关资源

- [Playwright 官方文档](https://playwright.dev/)
- [项目测试配置](../playwright.config.ts)
- [E2E 测试目录](../tests/e2e/)
- [测试报告](../playwright-report/)

## 🎉 最佳实践

1. **测试隔离**: 每个测试独立运行，避免相互影响
2. **等待策略**: 使用适当的等待条件，避免不稳定的测试
3. **页面对象**: 使用页面对象模式提高测试可维护性
4. **并行执行**: 合理配置并行度，平衡速度和稳定性
5. **错误处理**: 添加适当的错误处理和重试机制

---

🎭 **通过 Playwright MCP 工具，AI 助手可以直接执行浏览器操作和测试，大大提升开发效率！**
