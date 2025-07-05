<template>
  <div class="keyboard-shortcuts-help">
    <!-- 触发按钮 -->
    <button class="help-button" title="键盘快捷键帮助 (F1)" @click="showModal = true">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </button>

    <!-- 模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>键盘快捷键</h2>
          <button class="close-button" @click="closeModal">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="shortcuts-grid">
            <div v-for="category in categorizedShortcuts" :key="category.name" class="category">
              <h3>{{ category.name }}</h3>
              <div class="shortcuts-list">
                <div
                  v-for="shortcut in category.shortcuts"
                  :key="shortcut.description"
                  class="shortcut-item"
                >
                  <div class="shortcut-keys">
                    <kbd v-for="key in formatShortcutKeys(shortcut)" :key="key" class="key">{{
                      key
                    }}</kbd>
                  </div>
                  <div class="shortcut-description">{{ shortcut.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <p class="tip">提示：按 <kbd>F1</kbd> 可以快速打开此帮助</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useKeyboardShortcuts, type KeyboardShortcut } from '@/composables/useKeyboardShortcuts'

const showModal = ref(false)
const shortcuts = useKeyboardShortcuts()

// 分类快捷键
const categorizedShortcuts = computed(() => {
  const allShortcuts = shortcuts.getShortcuts()

  const categories = [
    {
      name: '编辑操作',
      shortcuts: allShortcuts.filter(
        s =>
          s.description.includes('撤销') ||
          s.description.includes('重做') ||
          s.description.includes('删除') ||
          s.description.includes('复制') ||
          s.description.includes('编辑') ||
          s.description.includes('重命名')
      ),
    },
    {
      name: '文件操作',
      shortcuts: allShortcuts.filter(
        s =>
          s.description.includes('保存') ||
          s.description.includes('打开') ||
          s.description.includes('新建')
      ),
    },
    {
      name: '选择操作',
      shortcuts: allShortcuts.filter(
        s => s.description.includes('全选') || s.description.includes('取消选择')
      ),
    },
    {
      name: '视图操作',
      shortcuts: allShortcuts.filter(
        s =>
          s.description.includes('放大') ||
          s.description.includes('缩小') ||
          s.description.includes('重置缩放')
      ),
    },
  ]

  return categories.filter(category => category.shortcuts.length > 0)
})

// 格式化快捷键显示
function formatShortcutKeys(shortcut: KeyboardShortcut): string[] {
  const keys: string[] = []

  if (shortcut.ctrlKey) keys.push('Ctrl')
  if (shortcut.shiftKey) keys.push('Shift')
  if (shortcut.altKey) keys.push('Alt')
  if (shortcut.metaKey) keys.push('Cmd')

  // 特殊键名映射
  const keyMap: { [key: string]: string } = {
    Delete: 'Delete',
    Backspace: 'Backspace',
    Escape: 'Esc',
    Enter: 'Enter',
    F1: 'F1',
    F2: 'F2',
    '+': '+',
    '-': '-',
    '0': '0',
  }

  const displayKey = keyMap[shortcut.key] || shortcut.key.toUpperCase()
  keys.push(displayKey)

  return keys
}

function closeModal() {
  showModal.value = false
}

// F1 快捷键处理
function handleF1(event: KeyboardEvent) {
  if (event.key === 'F1') {
    event.preventDefault()
    showModal.value = !showModal.value
  }
}

// ESC 关闭模态框
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && showModal.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleF1)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleF1)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.keyboard-shortcuts-help {
  position: relative;
}

.help-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.help-button:hover {
  background: var(--color-background-mute);
  transform: scale(1.05);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-background);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 800px;
  max-height: 80vh;
  width: 90%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.category h3 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-heading);
  border-bottom: 2px solid var(--vt-c-divider-light-1);
  padding-bottom: 8px;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.shortcut-keys {
  display: flex;
  gap: 4px;
  align-items: center;
}

.key {
  display: inline-block;
  padding: 4px 8px;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-family:
    'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.shortcut-description {
  color: var(--color-text-2);
  font-size: 0.9rem;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.tip {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-2);
  text-align: center;
}

.tip kbd {
  display: inline-block;
  padding: 2px 6px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.8rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 90vh;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
  }

  .shortcut-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .shortcut-description {
    text-align: left;
    margin-left: 0;
  }
}
</style>
