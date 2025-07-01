<template>
  <div
    class="whiteboard-card"
    :class="{ selected: isSelected, dragging: isDragging }"
    :style="cardStyle"
    @mousedown="handleMouseDown"
    @dblclick="handleDoubleClick"
  >
    <!-- 卡片头部 -->
    <div class="card-header" v-if="!isEditing">
      <div class="card-title">{{ card.title || '无标题卡片' }}</div>
      <div class="card-actions">
        <button class="action-btn" @click="handleEdit" title="编辑">✏️</button>
        <button class="action-btn" @click="handleDelete" title="删除">🗑️</button>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <div v-if="!isEditing" class="content-display">
        <div v-if="card.content" v-html="formattedContent"></div>
        <div v-else class="empty-content">点击编辑添加内容...</div>
      </div>

      <div v-else class="content-editor">
        <input
          v-model="editTitle"
          class="title-input"
          placeholder="卡片标题"
          @keydown.enter="handleSaveTitle"
          @blur="handleSaveTitle"
        />
        <textarea
          v-model="editContent"
          class="content-textarea"
          placeholder="输入内容... (支持Markdown)"
          @keydown.ctrl.enter="handleSave"
          @blur="handleSave"
          ref="textareaRef"
        ></textarea>
        <div class="editor-actions">
          <button @click="handleSave" class="save-btn">保存</button>
          <button @click="handleCancel" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 调整大小的控制点 -->
    <div v-if="isSelected && !isEditing" class="resize-handles">
      <div class="resize-handle resize-se" @mousedown="handleResizeStart('se', $event)"></div>
      <div class="resize-handle resize-sw" @mousedown="handleResizeStart('sw', $event)"></div>
      <div class="resize-handle resize-ne" @mousedown="handleResizeStart('ne', $event)"></div>
      <div class="resize-handle resize-nw" @mousedown="handleResizeStart('nw', $event)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WhiteboardCard as Card } from '@shared/types'
import { computed, nextTick, ref, watch } from 'vue'

interface Props {
  card: Card
  isSelected: boolean
  zoom?: number
}

interface Emits {
  (e: 'update:card', card: Card): void
  (e: 'select', cardId: string): void
  (e: 'delete', cardId: string): void
  (e: 'drag-start', event: MouseEvent, cardId: string): void
  (e: 'resize-start', event: MouseEvent, cardId: string, direction: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态
const isEditing = ref(false)
const isDragging = ref(false)
const editTitle = ref('')
const editContent = ref('')
const textareaRef = ref<HTMLTextAreaElement>()

// 计算属性
const cardStyle = computed(() => ({
  left: `${props.card.position.x}px`,
  top: `${props.card.position.y}px`,
  width: `${props.card.size.width}px`,
  height: `${props.card.size.height}px`,
  backgroundColor: props.card.style.backgroundColor,
  borderColor: props.card.style.borderColor,
  borderWidth: `${props.card.style.borderWidth}px`,
  borderRadius: `${props.card.style.borderRadius}px`,
  color: props.card.style.textColor,
  fontSize: `${props.card.style.fontSize}px`,
  fontFamily: props.card.style.fontFamily,
  opacity: props.card.style.opacity,
  boxShadow: props.card.style.shadow ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
}))

const formattedContent = computed(() => {
  // 简单的Markdown渲染
  let content = props.card.content || ''

  // 处理换行
  content = content.replace(/\n/g, '<br>')

  // 处理粗体
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 处理斜体
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // 处理代码
  content = content.replace(/`(.*?)`/g, '<code>$1</code>')

  return content
})

// 方法
const handleMouseDown = (event: MouseEvent) => {
  event.stopPropagation()

  // 选中卡片
  emit('select', props.card.id)

  // 开始拖拽
  if (!isEditing.value) {
    isDragging.value = true
    emit('drag-start', event, props.card.id)
  }
}

const handleDoubleClick = () => {
  handleEdit()
}

const handleEdit = () => {
  editTitle.value = props.card.title
  editContent.value = props.card.content
  isEditing.value = true

  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const handleSave = () => {
  const updatedCard = {
    ...props.card,
    title: editTitle.value,
    content: editContent.value,
    updatedAt: Date.now(),
  }

  emit('update:card', updatedCard)
  isEditing.value = false
}

const handleSaveTitle = () => {
  // 只保存标题，不退出编辑模式
  const updatedCard = {
    ...props.card,
    title: editTitle.value,
  }
  emit('update:card', updatedCard)
}

const handleCancel = () => {
  editTitle.value = props.card.title
  editContent.value = props.card.content
  isEditing.value = false
}

const handleDelete = () => {
  emit('delete', props.card.id)
}

const handleResizeStart = (direction: string, event: MouseEvent) => {
  event.stopPropagation()
  emit('resize-start', event, props.card.id, direction)
}

// 监听卡片变化
watch(
  () => props.card,
  () => {
    if (!isEditing.value) {
      editTitle.value = props.card.title
      editContent.value = props.card.content
    }
  },
  { deep: true }
)
</script>

<style scoped>
.whiteboard-card {
  position: absolute;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  min-width: 150px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.whiteboard-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.whiteboard-card.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.whiteboard-card.dragging {
  opacity: 0.8;
  z-index: 1000;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: rgba(0, 0, 0, 0.02);
}

.card-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 3px;
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.card-content {
  flex: 1;
  padding: 12px;
  overflow: hidden;
}

.content-display {
  height: 100%;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.4;
  color: #555;
}

.empty-content {
  color: #999;
  font-style: italic;
}

.content-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.title-input {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 600;
}

.content-textarea {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.editor-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.save-btn,
.cancel-btn {
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.save-btn {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.cancel-btn {
  background: white;
  color: #666;
}

.resize-handles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007bff;
  border: 1px solid white;
  border-radius: 50%;
  pointer-events: all;
  cursor: nw-resize;
}

.resize-se {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.resize-sw {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.resize-ne {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.resize-nw {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}
</style>
