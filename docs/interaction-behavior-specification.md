# 节点交互行为规范

## 文本选择行为

### 1. 未选中状态
- **文本选择**: 禁用 (`user-select: none`)
- **光标样式**: 指针光标 (`cursor: pointer`)
- **行为**: 点击可选中节点

### 2. 选中状态  
- **文本选择**: 禁用 (`user-select: none`)
- **光标样式**: 指针光标 (`cursor: pointer`)
- **行为**: 可以拖拽移动节点，点击保持选中

### 3. 编辑状态
- **文本选择**: 启用 (`user-select: text`)
- **光标样式**: 文本光标 (`cursor: text`)
- **行为**: 可编辑文本内容，支持文本选择

## 右键连接行为

### 连接创建规则
**右键其他节点（有选中节点） → 创建 选中节点指向当前节点 的连接**

### 具体实现
```typescript
// 当右键节点时：
if (currentSelectedNode.value && currentSelectedNode.value !== nodeId) {
  pendingConnection.value = {
    sourceId: currentSelectedNode.value,  // 选中节点（源）
    targetId: nodeId,                     // 右键节点（目标）
  }
  // 显示连接类型选择菜单
}
```

### 连接方向示例
- 选中节点A，右键节点B → 创建 A → B 的连接
- 选中节点B，右键节点C → 创建 B → C 的连接
- 保持源节点选中状态，支持连续创建多个连接

## CSS 实现细节

### 文本选择控制
```css
/* 默认状态：禁用文本选择，指针光标 */
.node-content {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 选中状态：保持禁用文本选择，指针光标 */
.canvas-node.selected .node-content {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 编辑状态：启用文本选择，文本光标 */
.node-editor {
  cursor: text;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}
```

## 交互流程

### 文本选择流程
1. **未选中** → 点击 → **选中**（禁用文本选择，指针光标）
2. **选中** → 双击 → **编辑**（启用文本选择，文本光标）
3. **编辑** → Enter/点击外部 → **选中**（禁用文本选择，指针光标）

### 连接创建流程
1. 点击选中节点A
2. 右键节点B
3. 选择连接类型
4. 创建 A → B 的连接
5. 节点A保持选中状态，可继续右键其他节点创建连接

## 验证清单

- [ ] 未选中节点：禁用文本选择，显示指针光标
- [ ] 选中节点：禁用文本选择，显示指针光标  
- [ ] 编辑节点：启用文本选择，显示文本光标
- [ ] 右键连接：选中节点A，右键节点B，创建A→B连接
- [ ] 连续连接：创建连接后源节点保持选中，可继续创建
- [ ] 光标变化：在不同状态下光标正确切换

## 注意事项

1. **文本选择一致性**: 确保在所有浏览器中文本选择行为一致
2. **光标反馈**: 光标样式应该清楚地表明当前可执行的操作
3. **连接方向**: 连接方向应该直观，从选中节点指向右键节点
4. **状态保持**: 创建连接后保持源节点选中状态，便于连续操作

## 实现状态

✅ **已实现**: 文本选择行为规范
✅ **已实现**: 右键连接行为规范  
✅ **已实现**: 光标样式控制
✅ **已实现**: 连接方向控制

所有行为规范已按要求实现并部署。
