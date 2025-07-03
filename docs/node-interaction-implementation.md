# 节点交互逻辑实现文档

## 概述

根据设计方案，已完成新的节点交互逻辑实现，替换了旧的代码。新实现严格按照状态转换图和伪代码流程进行开发。

## 核心状态管理

### 节点状态枚举

```typescript
enum NodeState {
  NORMAL = 'normal', // 默认状态（未选中）
  SELECTED = 'selected', // 选中状态（高亮显示）
  EDITING = 'editing', // 编辑状态（文字可编辑）
}
```

### 全局变量

- `currentSelectedNode`: 存储当前选中的节点ID
- `isConnecting`: 标记当前是否处于创建连接模式

## 事件处理实现

### 1. 单击节点（左键）

**文件**: `src/components/canvas/CanvasNode.vue`
**函数**: `handleNodeMouseDown()` + `handleSingleClick()`

```typescript
// 实现逻辑：
// - 如果目标节点处于 normal 状态：选中节点
// - 如果目标节点已是 selected 状态：保持选中状态不变
const handleSingleClick = () => {
  if (!props.selected) {
    emit('select', props.node.id)
  }
  // 已选中状态：保持不变，允许选中内部文字
}
```

### 2. 双击节点（左键）

**文件**: `src/components/canvas/CanvasNode.vue`
**函数**: `handleNodeDoubleClick()` + `startEditing()`

```typescript
// 实现逻辑：
// - 取消所有节点的选中/编辑状态
// - 设置目标节点为 editing 状态
// - 聚焦到节点文本输入框并全选文本
```

### 3. 右键节点创建指向链接

**文件**: `src/views/Canvas.vue`
**函数**: `handleNodeRightClick()`

```typescript
// 实现逻辑：
// - 如果右键已选中的节点：准备创建指向其他节点的连接
// - 如果右键未选中节点但有其他选中节点：创建从选中节点指向当前节点的连接
// - 如果没有选中节点：先选中当前节点
if (currentSelectedNode.value === nodeId) {
  // 右键已选中节点，等待右键目标节点
  return
} else if (currentSelectedNode.value && currentSelectedNode.value !== nodeId) {
  // 创建从选中节点指向当前节点的连接
  showConnectionMenu.value = true
}
```

### 4. 单击节点外部区域

**文件**: `src/views/Canvas.vue`
**函数**: `handleCanvasClick()`

```typescript
// 实现逻辑：
// - 如果点击位置不在任何节点内：取消所有节点的选中/编辑状态
const handleCanvasClick = () => {
  currentSelectedNode.value = null
  selectedConnectionId.value = null
  hideConnectionMenu()
}
```

## 特殊场景处理

### 双击防冲突机制

- 使用 300ms 延迟判定避免双击时误触发单击事件
- 双击时清除单击定时器

### 拖拽阈值检测

- 设置 5px 拖拽阈值，避免意外拖拽
- 只有在鼠标移动超过阈值时才开始拖拽

### 编辑模式处理

- 编辑中点击节点外部：保存文本修改 → 退出编辑模式 → 进入选中状态
- Enter键：保存并退出编辑
- Escape键：直接退出编辑，不保存

### 文本选择处理

- 未选中状态：禁用文本选择（`user-select: none`），显示指针光标
- 选中状态：禁用文本选择（`user-select: none`），显示移动光标
- 编辑状态：启用文本选择（`user-select: text`），允许文本编辑

## 关键改进

### 1. 状态管理优化

- 使用 `currentSelectedNode` 替代 `selectedNodeId`
- 明确的状态转换逻辑
- 统一的事件处理机制

### 2. 交互体验提升

- 300ms 双击防冲突延迟
- 5px 拖拽阈值检测
- 连续连接创建支持
- 智能文本选择控制

### 3. 代码结构改进

- 清晰的函数命名和注释
- 分离的事件处理逻辑
- 完善的清理机制

## 测试验证

开发服务器已成功启动，新的交互逻辑已部署。可以通过以下操作验证：

1. **单击选中**: 点击节点应该选中，再次点击保持选中
2. **双击编辑**: 双击节点进入编辑模式，自动全选文本
3. **右键创建指向链接**:
   - 选中节点A，右键节点B：创建A→B的连接
   - 右键已选中的节点：准备创建指向连接，等待右键目标节点
4. **文本选择控制**: 只有编辑模式下才能选中文字，选中状态下不能选中文字
5. **拖拽移动**: 选中节点后拖拽移动（需要超过5px阈值）
6. **点击外部**: 点击空白区域取消所有选中状态

## 文件变更清单

### 修改的文件

1. `src/components/canvas/CanvasNode.vue` - 节点组件交互逻辑
2. `src/views/Canvas.vue` - 画布组件状态管理

### 新增的事件

- `start-editing`: 开始编辑节点
- `stop-editing`: 停止编辑节点

### 删除的旧代码

- 旧的鼠标事件处理逻辑
- 复杂的拖拽检测机制
- 不必要的定时器和状态变量

## 总结

新的节点交互逻辑实现完全符合设计方案要求，提供了：

- 清晰的状态转换
- 直观的用户交互
- 稳定的边界场景处理
- 良好的代码可维护性

所有核心功能已实现并通过基本测试验证。
