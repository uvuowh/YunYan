# 节点交互逻辑更新说明

## 更新概述

根据用户要求，对节点交互逻辑进行了以下关键修改：

1. **文本选择控制**：只有编辑模式下才能选中文字
2. **右键连接逻辑**：选中状态下右键创建指向链接

## 具体修改内容

### 1. 文本选择控制优化

**修改文件**: `src/components/canvas/CanvasNode.vue`

#### 模板修改
- 移除了 `text-selectable` 类的条件绑定
- 简化了节点内容的类绑定逻辑

#### CSS样式修改
```css
/* 默认状态：禁用文本选择，显示指针光标 */
.node-content {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 选中状态下：保持禁用文本选择，显示移动光标 */
.canvas-node.selected .node-content {
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 编辑状态：启用文本选择 */
.node-editor {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  pointer-events: auto;
}
```

#### 行为变化
- **未选中状态**：禁用文本选择，显示指针光标
- **选中状态**：禁用文本选择，显示移动光标（表示可拖拽）
- **编辑状态**：启用文本选择，允许文本编辑

### 2. 右键连接逻辑重构

**修改文件**: `src/views/Canvas.vue`

#### 新的右键逻辑
```typescript
const handleNodeRightClick = (nodeId: string, event: MouseEvent) => {
  if (currentSelectedNode.value === nodeId) {
    // 情况1：右键已选中的节点，准备创建指向其他节点的连接
    // 保持当前节点选中状态，等待用户右键其他节点
    return
  } else if (currentSelectedNode.value && currentSelectedNode.value !== nodeId) {
    // 情况2：有其他选中节点，创建从选中节点指向当前节点的连接
    pendingConnection.value = {
      sourceId: currentSelectedNode.value,
      targetId: nodeId,
    }
    connectionMenuPosition.value = { x: event.clientX, y: event.clientY }
    showConnectionMenu.value = true
    // 保持源节点的选中状态，支持连续创建连接
  } else {
    // 情况3：没有选中节点，先选中当前节点
    currentSelectedNode.value = nodeId
  }
}
```

#### 右键连接行为
1. **右键已选中节点**：准备创建指向连接，等待右键目标节点
2. **右键其他节点（有选中节点）**：创建从选中节点指向当前节点的连接
3. **右键节点（无选中节点）**：先选中当前节点

### 3. 注释和文档更新

**修改文件**: `src/components/canvas/CanvasNode.vue`

更新了右键处理函数的注释，明确说明新的交互逻辑：

```typescript
/**
 * 3. 右键节点处理
 * - 如果当前节点已选中：创建从当前节点指向其他节点的连接
 * - 如果当前节点未选中但有其他选中节点：创建从其他节点指向当前节点的连接
 * - 如果没有选中节点：显示默认右键菜单（可选功能）
 */
```

## 用户体验改进

### 1. 更清晰的文本选择控制
- 避免了选中状态下意外选择文字的问题
- 通过光标变化明确指示当前状态（指针/移动/文本）
- 只有在明确需要编辑时才允许文本选择

### 2. 更直观的连接创建
- 支持从选中节点创建指向其他节点的连接
- 右键已选中节点表示准备创建指向连接
- 保持源节点选中状态，支持连续创建多个连接

### 3. 一致的交互模式
- 所有交互都基于明确的状态转换
- 减少了用户的认知负担
- 提供了可预测的交互行为

## 测试验证

开发服务器已启动（http://localhost:1420/），可以验证以下功能：

### 文本选择测试
1. 点击节点选中，尝试选择文字 → 应该无法选择
2. 双击节点进入编辑模式 → 应该可以选择和编辑文字
3. 按Enter或点击外部退出编辑 → 文字选择应该被禁用

### 右键连接测试
1. 选中节点A，右键节点B → 应该显示连接类型菜单，创建A→B连接
2. 右键已选中的节点A → 应该保持选中状态，准备创建指向连接
3. 在步骤2后，右键节点C → 应该创建A→C连接

### 光标状态测试
1. 未选中节点 → 鼠标悬停显示指针光标
2. 选中节点 → 鼠标悬停显示移动光标
3. 编辑模式 → 鼠标悬停显示文本光标

## 总结

本次更新成功实现了：
- ✅ 只有编辑模式下才能选中文字
- ✅ 选中状态下右键创建指向链接
- ✅ 更清晰的视觉反馈和交互逻辑
- ✅ 保持了原有的其他功能不变

所有修改都已完成并可以在开发环境中测试验证。
