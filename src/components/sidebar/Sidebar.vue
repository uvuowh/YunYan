<template>
  <aside class="sidebar" v-if="selectedCard">
    <div class="sidebar-header">
      <input
        v-model="selectedCard.title"
        @input="handleTitleChange"
        class="title-input"
        placeholder="文档标题..."
      />
      <div class="document-info">
        <span class="block-count">{{ selectedCard.blocks?.length || 0 }} blocks</span>
      </div>
      <button @click="handleDelete" class="delete-button" aria-label="Delete Document">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
    <div class="sidebar-content">
      <div class="data-management-section">
        <button @click="showDataPanel = !showDataPanel" class="data-btn" title="数据管理">
          💾 数据管理
        </button>
      </div>

      <!-- 数据管理面板 -->
      <div v-if="showDataPanel" class="data-panel">
        <h4>数据管理</h4>
        <div class="data-actions">
          <button @click="handleSaveData" class="action-btn save-btn">
            💾 手动保存
          </button>
          <button @click="handleExportData" class="action-btn export-btn">
            📤 导出数据
          </button>
          <button @click="triggerImport" class="action-btn import-btn">
            📥 导入数据
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleImportData"
            style="display: none"
          />
        </div>
        <div class="data-info">
          <p v-if="lastSaveTime" class="save-time">
            上次保存: {{ formatTime(lastSaveTime) }}
          </p>
          <p class="auto-save-status">
            自动保存: <span :class="{ 'saving': isAutoSaving }">
              {{ isAutoSaving ? '保存中...' : '已启用' }}
            </span>
          </p>
        </div>
      </div>

      <div v-if="selectedCard" class="blocks-section">
        <h4>Blocks ({{ selectedCard.blocks?.length || 0 }})</h4>
        <div v-if="selectedCard.blocks && selectedCard.blocks.length > 0" class="block-list">
          <div
            v-for="block in selectedCard.blocks"
            :key="block.id"
            class="block-item"
            :data-block-id="block.id"
            :class="[
              block.type,
              {
                'focused': focusedBlockId === block.id,
                'dimmed': focusedBlockId && focusedBlockId !== block.id,
                'hovered': hoveredBlockId === block.id,
                'editing': block.isEditing
              }
            ]"
            @mouseenter="hoveredBlockId = block.id"
            @mouseleave="hoveredBlockId = null"
            draggable="true"
            @dragstart="handleDragStart(block.id, $event)"
            @dragover.prevent="handleDragOver($event)"
            @drop="handleDrop(block.id, $event)"
            @dragend="handleDragEnd"
          >
            <div class="block-wrapper">
              <!-- 块图标 - 类似思源笔记的实现 -->
              <div
                class="block-icon"
                :class="{
                  'visible': hoveredBlockId === block.id,
                  'focused-icon': focusedBlockId === block.id
                }"
                @click="showBlockMenu(block.id, $event)"
                @dblclick="toggleBlockFocus(block.id)"
                :title="`${block.type} 块 - 左键菜单，双击聚焦`"
              >
                <span class="block-type-icon">
                  {{ getBlockTypeIcon(block.type) }}
                </span>
              </div>

              <!-- 可编辑的块内容区域 -->
              <div class="block-content-area">
                <!-- 显示模式：带引用高亮 -->
                <div
                  v-if="!block.isEditing"
                  class="block-content-display"
                  @click="startEditBlock(block.id)"
                  @click.capture="handleReferenceClick"
                  v-html="renderBlockContent(block.content)"
                ></div>

                <!-- 编辑模式：纯文本编辑 -->
                <textarea
                  v-else
                  v-model="block.content"
                  @input="(event) => onBlockContentChange(block.id, event)"
                  @keydown="(event) => handleKeyDown(block.id, event)"
                  @blur="stopEditBlock(block.id)"
                  class="block-content-editor"
                  :placeholder="`编辑 ${block.type} 块内容...`"
                  :data-block-id="block.id"
                  rows="2"
                  ref="blockEditor"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-blocks" @click="addNewBlock">
          <div class="empty-message">
            <span class="empty-icon">📝</span>
            <p>还没有任何块</p>
            <p class="empty-hint">点击这里创建第一个块</p>
          </div>
        </div>
      </div>


    </div>

    <!-- 块操作菜单 -->
    <div
      v-if="blockMenuVisible"
      class="block-menu"
      :style="{ left: blockMenuPosition.x + 'px', top: blockMenuPosition.y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="duplicateCurrentBlock">
        <span class="menu-icon">📋</span>
        <span>复制块</span>
      </div>
      <div class="menu-item" @click="deleteCurrentBlock">
        <span class="menu-icon">🗑️</span>
        <span>删除块</span>
      </div>
      <div class="menu-separator"></div>
      <div class="menu-item" @click="convertBlockType('paragraph')">
        <span class="menu-icon">{{ getBlockTypeIcon('paragraph') }}</span>
        <span>段落</span>
      </div>
      <div class="menu-item" @click="convertBlockType('heading')">
        <span class="menu-icon">{{ getBlockTypeIcon('heading') }}</span>
        <span>标题</span>
      </div>
      <div class="menu-item" @click="convertBlockType('list')">
        <span class="menu-icon">{{ getBlockTypeIcon('list') }}</span>
        <span>列表</span>
      </div>
      <div class="menu-item" @click="convertBlockType('code')">
        <span class="menu-icon">{{ getBlockTypeIcon('code') }}</span>
        <span>代码</span>
      </div>
    </div>

    <!-- 点击遮罩关闭菜单 -->
    <div
      v-if="blockMenuVisible"
      class="menu-overlay"
      @click="hideBlockMenu"
    ></div>

    <!-- 命令菜单 -->
    <div
      v-if="commandMenuVisible"
      class="command-menu"
      :style="{ left: commandMenuPosition.x + 'px', top: commandMenuPosition.y + 'px' }"
      @click.stop
    >
      <div class="command-search">
        <input
          v-model="commandMenuFilter"
          placeholder="输入命令..."
          class="command-input"
          @keydown="handleCommandKeyDown"
          ref="commandInput"
        />
      </div>
      <div class="command-list">
        <div
          v-for="command in filteredCommands"
          :key="command.id"
          class="command-item"
          @click="executeCommand(command)"
        >
          <span class="command-icon">{{ command.icon }}</span>
          <div class="command-info">
            <div class="command-name">{{ command.name }}</div>
            <div class="command-desc">{{ command.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 命令菜单遮罩 -->
    <div
      v-if="commandMenuVisible"
      class="menu-overlay"
      @click="hideCommandMenu"
    ></div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useCanvasStore, type Block } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash';

const store = useCanvasStore();
const { cards, selectedCardId, focusedBlockId, isAutoSaving, lastSaveTime } = storeToRefs(store);

const hoveredBlockId = ref<string | null>(null);

// 块菜单相关状态
const blockMenuVisible = ref(false);
const blockMenuPosition = ref({ x: 0, y: 0 });
const currentBlockId = ref<string | null>(null);

// 拖拽相关状态
const draggedBlockId = ref<string | null>(null);

// 命令菜单相关状态
const commandMenuVisible = ref(false);
const commandMenuPosition = ref({ x: 0, y: 0 });
const commandMenuBlockId = ref<string | null>(null);
const commandMenuFilter = ref('');

// 数据管理面板状态
const showDataPanel = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// 命令列表
const commands = ref([
  {
    id: 'heading',
    name: '标题',
    description: '创建标题块',
    icon: '📰',
    action: () => convertBlockTypeAndUpdateContent(commandMenuBlockId.value!, 'heading', '# ')
  },
  {
    id: 'paragraph',
    name: '段落',
    description: '创建段落块',
    icon: '📝',
    action: () => convertBlockTypeAndUpdateContent(commandMenuBlockId.value!, 'paragraph', '')
  },
  {
    id: 'list',
    name: '列表',
    description: '创建列表块',
    icon: '📋',
    action: () => convertBlockTypeAndUpdateContent(commandMenuBlockId.value!, 'list', '- ')
  },
  {
    id: 'code',
    name: '代码',
    description: '创建代码块',
    icon: '💻',
    action: () => convertBlockTypeAndUpdateContent(commandMenuBlockId.value!, 'code', '')
  },
  {
    id: 'duplicate',
    name: '复制块',
    description: '复制当前块',
    icon: '📋',
    action: () => store.duplicateBlock(commandMenuBlockId.value!)
  },
  {
    id: 'delete',
    name: '删除块',
    description: '删除当前块',
    icon: '🗑️',
    action: () => store.deleteBlock(commandMenuBlockId.value!)
  }
]);

/**
 * 过滤后的命令列表
 */
const filteredCommands = computed(() => {
  if (!commandMenuFilter.value) return commands.value;

  const filter = commandMenuFilter.value.toLowerCase();
  return commands.value.filter(cmd =>
    cmd.name.toLowerCase().includes(filter) ||
    cmd.description.toLowerCase().includes(filter)
  );
});

/**
 * Finds the currently selected card from the store based on selectedCardId.
 * @returns {Card | undefined} The selected card object or undefined if no card is selected.
 */
const selectedCard = computed(() => {
  if (selectedCardId.value === null) return undefined;
  return cards.value.find((card: any) => card.id === selectedCardId.value);
});







/**
 * Debounced function to update the card's title in the store.
 */
const debouncedTitleUpdate = debounce((newTitle: string) => {
  if (selectedCard.value) {
    store.updateCard({ id: selectedCard.value.id, title: newTitle });
  }
}, 300);

/**
 * 处理标题变化
 */
const handleTitleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newTitle = target.value;
  debouncedTitleUpdate(newTitle);
};





/**
 * Handles the click event for the delete button.
 * It removes the currently selected card from the store.
 */
const handleDelete = () => {
  if (selectedCard.value) {
    store.removeCard(selectedCard.value.id);
  }
};

/**
 * 获取块类型对应的图标
 */
const getBlockTypeIcon = (type: string): string => {
  switch (type) {
    case 'heading': return '🔖';
    case 'paragraph': return '📄';
    case 'list': return '📝';
    case 'code': return '⚡';
    default: return '📋';
  }
};





/**
 * 自动调整textarea高度
 */
const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

/**
 * 处理单个块内容变化
 */
const onBlockContentChange = (blockId: string, event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  const newContent = target.value;

  // 自动调整高度
  autoResizeTextarea(target);

  // 使用新的 updateBlock 方法更新单个块
  store.updateBlock(blockId, { content: newContent });

  // 同时更新卡片的整体内容
  if (selectedCard.value) {
    const allContent = selectedCard.value.blocks.map(b => b.content).join('\n\n');
    selectedCard.value.content = allContent;
  }
};

/**
 * 渲染块内容，包含引用高亮
 */
const renderBlockContent = (content: string) => {
  return store.renderContentWithReferences(content);
};

/**
 * 开始编辑块
 */
const startEditBlock = (blockId: string) => {
  if (selectedCard.value) {
    const block = selectedCard.value.blocks.find(b => b.id === blockId);
    if (block) {
      block.isEditing = true;
      // 下一帧聚焦到编辑器并调整高度
      nextTick(() => {
        const editor = document.querySelector(`textarea[data-block-id="${blockId}"]`) as HTMLTextAreaElement;
        if (editor) {
          editor.focus();
          autoResizeTextarea(editor);
        }
      });
    }
  }
};

/**
 * 停止编辑块
 */
const stopEditBlock = (blockId: string) => {
  if (selectedCard.value) {
    const block = selectedCard.value.blocks.find(b => b.id === blockId);
    if (block) {
      block.isEditing = false;
    }
  }
};

/**
 * 处理引用点击事件
 */
const handleReferenceClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('block-reference') || target.classList.contains('block-embed')) {
    const blockId = target.getAttribute('data-block-id');
    if (blockId) {
      navigateToBlock(blockId);
    }
  }
};

/**
 * 导航到指定块
 */
const navigateToBlock = (blockId: string) => {
  const targetCard = store.findCardByBlockId(blockId);
  if (targetCard) {
    // 选中包含目标块的卡片
    store.selectCard(targetCard.id);

    // 滚动到目标块
    nextTick(() => {
      const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
      if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 高亮显示目标块
        blockElement.classList.add('highlight-target');
        setTimeout(() => {
          blockElement.classList.remove('highlight-target');
        }, 2000);
      }
    });
  }
};

/**
 * 显示块操作菜单
 */
const showBlockMenu = (blockId: string, event: MouseEvent) => {
  currentBlockId.value = blockId;
  blockMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  };
  blockMenuVisible.value = true;
};

/**
 * 隐藏块操作菜单
 */
const hideBlockMenu = () => {
  blockMenuVisible.value = false;
  currentBlockId.value = null;
};

/**
 * 复制当前块
 */
const duplicateCurrentBlock = () => {
  if (currentBlockId.value) {
    store.duplicateBlock(currentBlockId.value);
  }
  hideBlockMenu();
};

/**
 * 删除当前块
 */
const deleteCurrentBlock = () => {
  if (currentBlockId.value) {
    store.deleteBlock(currentBlockId.value);
  }
  hideBlockMenu();
};

/**
 * 转换块类型
 */
const convertBlockType = (newType: Block['type']) => {
  if (currentBlockId.value) {
    store.convertBlockType(currentBlockId.value, newType);
  }
  hideBlockMenu();
};

/**
 * 处理拖拽开始
 */
const handleDragStart = (blockId: string, event: DragEvent) => {
  draggedBlockId.value = blockId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', blockId);
  }
};

/**
 * 处理拖拽悬停
 */
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

/**
 * 处理拖拽放置
 */
const handleDrop = (targetBlockId: string, event: DragEvent) => {
  event.preventDefault();

  if (draggedBlockId.value && draggedBlockId.value !== targetBlockId && selectedCard.value) {
    // 找到目标块的索引
    const targetIndex = selectedCard.value.blocks.findIndex(b => b.id === targetBlockId);
    if (targetIndex !== -1) {
      // 移动块到目标位置
      store.moveBlock(draggedBlockId.value, targetIndex);
    }
  }
};

/**
 * 处理拖拽结束
 */
const handleDragEnd = () => {
  draggedBlockId.value = null;
};

/**
 * 处理键盘事件
 */
const handleKeyDown = (blockId: string, event: KeyboardEvent) => {
  const target = event.target as HTMLTextAreaElement;
  const content = target.value;
  const cursorPosition = target.selectionStart;

  // Ctrl+Enter 停止编辑
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    stopEditBlock(blockId);
    return;
  }

  // Enter 键处理
  if (event.key === 'Enter') {
    // 检查是否在行首输入 Markdown 语法
    const lines = content.split('\n');
    const currentLineIndex = content.substring(0, cursorPosition).split('\n').length - 1;
    const currentLine = lines[currentLineIndex] || '';

    // 检查 Markdown 快捷键
    if (currentLine.trim() === '#') {
      event.preventDefault();
      convertBlockTypeAndUpdateContent(blockId, 'heading', '# ');
      return;
    }

    if (currentLine.trim() === '##') {
      event.preventDefault();
      convertBlockTypeAndUpdateContent(blockId, 'heading', '## ');
      return;
    }

    if (currentLine.trim() === '###') {
      event.preventDefault();
      convertBlockTypeAndUpdateContent(blockId, 'heading', '### ');
      return;
    }

    if (currentLine.trim() === '-' || currentLine.trim() === '*') {
      event.preventDefault();
      convertBlockTypeAndUpdateContent(blockId, 'list', '- ');
      return;
    }

    if (currentLine.trim() === '```') {
      event.preventDefault();
      convertBlockTypeAndUpdateContent(blockId, 'code', '');
      return;
    }

    // 如果没有匹配到Markdown语法，且光标在行末，创建新块
    if (cursorPosition === content.length ||
        (currentLineIndex === lines.length - 1 && cursorPosition >= content.lastIndexOf('\n') + currentLine.length)) {
      event.preventDefault();
      createNewBlockAfter(blockId);
      return;
    }
  }

  // / 键处理 - 显示命令菜单
  if (event.key === '/' && cursorPosition === 0) {
    event.preventDefault();
    showCommandMenu(blockId, target);
    return;
  }

  // Tab 键处理 - 缩进
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (event.shiftKey) {
      // Shift+Tab 减少缩进
      const beforeCursor = content.substring(0, start);
      const afterCursor = content.substring(end);
      if (beforeCursor.endsWith('  ')) {
        target.value = beforeCursor.slice(0, -2) + afterCursor;
        target.setSelectionRange(start - 2, start - 2);
      }
    } else {
      // Tab 增加缩进
      target.value = content.substring(0, start) + '  ' + content.substring(end);
      target.setSelectionRange(start + 2, start + 2);
    }

    // 触发 input 事件更新内容
    onBlockContentChange(blockId, { target } as any);
  }
};

/**
 * 转换块类型并更新内容
 */
const convertBlockTypeAndUpdateContent = (blockId: string, newType: Block['type'], newContent: string) => {
  store.convertBlockType(blockId, newType);

  // 更新块内容
  if (selectedCard.value) {
    const block = selectedCard.value.blocks.find(b => b.id === blockId);
    if (block) {
      block.content = newContent;
      store.updateBlock(blockId, { content: newContent });

      // 聚焦到编辑器末尾
      nextTick(() => {
        const editor = document.querySelector(`textarea[data-block-id="${blockId}"]`) as HTMLTextAreaElement;
        if (editor) {
          editor.focus();
          editor.setSelectionRange(newContent.length, newContent.length);
        }
      });
    }
  }
};

/**
 * 显示命令菜单
 */
const showCommandMenu = (blockId: string, target: HTMLTextAreaElement) => {
  commandMenuBlockId.value = blockId;
  commandMenuFilter.value = '';

  // 计算菜单位置
  const rect = target.getBoundingClientRect();
  commandMenuPosition.value = {
    x: rect.left,
    y: rect.bottom + 5
  };

  commandMenuVisible.value = true;

  // 聚焦到搜索框
  nextTick(() => {
    const input = document.querySelector('.command-input') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  });
};

/**
 * 隐藏命令菜单
 */
const hideCommandMenu = () => {
  commandMenuVisible.value = false;
  commandMenuBlockId.value = null;
  commandMenuFilter.value = '';
};

/**
 * 执行命令
 */
const executeCommand = (command: any) => {
  command.action();
  hideCommandMenu();
};

/**
 * 处理命令菜单键盘事件
 */
const handleCommandKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    hideCommandMenu();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const filtered = filteredCommands.value;
    if (filtered.length > 0) {
      executeCommand(filtered[0]);
    }
  }
};

/**
 * 切换块聚焦模式
 */
const toggleBlockFocus = (blockId: string) => {
  store.toggleFocusMode(blockId);
};

/**
 * 手动保存数据
 */
const handleSaveData = () => {
  const success = store.saveToLocalStorage();
  if (success) {
    alert('数据保存成功！');
  } else {
    alert('数据保存失败！');
  }
};

/**
 * 导出数据
 */
const handleExportData = () => {
  try {
    const data = store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `yunyan-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('数据导出成功！');
  } catch (error) {
    console.error('导出失败:', error);
    alert('数据导出失败！');
  }
};

/**
 * 触发文件选择
 */
const triggerImport = () => {
  fileInput.value?.click();
};

/**
 * 导入数据
 */
const handleImportData = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = store.importData(content);

        if (success) {
          alert('数据导入成功！');
          showDataPanel.value = false;
        } else {
          alert('数据导入失败：格式不正确！');
        }
      } catch (error) {
        console.error('导入失败:', error);
        alert('数据导入失败！');
      }
    };
    reader.readAsText(file);
  }

  // 清空文件输入
  target.value = '';
};

/**
 * 格式化时间显示
 */
const formatTime = (date: Date | null) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
};

/**
 * 添加新块
 */
const addNewBlock = () => {
  if (selectedCard.value) {
    const newBlock = store.addBlock(selectedCard.value.id, 'paragraph', '');
    if (newBlock) {
      // 自动进入编辑模式
      nextTick(() => {
        const blockElement = document.querySelector(`[data-block-id="${newBlock.id}"] .block-content-display`);
        if (blockElement) {
          (blockElement as HTMLElement).click();
        }
      });
    }
  }
};

/**
 * 在指定块后创建新块
 */
const createNewBlockAfter = (blockId: string) => {
  if (selectedCard.value) {
    const currentBlockIndex = selectedCard.value.blocks.findIndex(b => b.id === blockId);
    if (currentBlockIndex !== -1) {
      const newBlock = store.addBlock(selectedCard.value.id, 'paragraph', '', currentBlockIndex + 1);
      if (newBlock) {
        // 停止当前块的编辑
        stopEditBlock(blockId);

        // 自动进入新块的编辑模式
        nextTick(() => {
          const blockElement = document.querySelector(`[data-block-id="${newBlock.id}"] .block-content-display`);
          if (blockElement) {
            (blockElement as HTMLElement).click();
          }
        });
      }
    }
  }
};


</script>

<style scoped>
.sidebar {
  width: 50vw;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border);
  padding: 1.5rem;
  background-color: var(--color-bg-secondary);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.title-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.title-input:focus {
  outline: none;
  background-color: rgba(0, 0, 0, 0.05);
}

.title-input:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.delete-button {
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 6px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.delete-button:hover {
  background-color: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.sidebar-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-content label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.styled-input,
textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  font-size: 0.95rem;
  font-family: inherit;
  box-sizing: border-box;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.styled-input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-accent-secondary);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15);
}

textarea {
  flex-grow: 1;
  resize: vertical;
  min-height: 120px;
}

/* 文档信息样式 */
.document-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 0.875rem;
}

.block-count {
  color: #495057;
  font-weight: 500;
}

/* 块编辑样式 */
.blocks-section {
  margin-top: 1rem;
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.blocks-section h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 0.875rem;
}

.block-list {
  max-height: 400px;
  overflow-y: auto;
}

.block-item {
  margin-bottom: 2px;
  position: relative;
  transition: all 0.2s ease;
  padding: 2px 4px;
}

.block-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.25rem;
}

/* 块图标样式 - 类似思源笔记 */
.block-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  background-color: transparent;
  flex-shrink: 0;
  margin-top: 2px;
}

.block-icon:hover {
  /* 移除背景色，保持简洁 */
}

.block-icon.visible {
  opacity: 1;
}



/* 块内容编辑区域 */
.block-content-area {
  flex: 1;
  min-width: 0;
  position: relative;
}

.block-content-editor {
  width: 100%;
  border: none;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
  resize: none;
  min-height: 1.5rem;
  font-family: inherit;
  overflow: hidden;
  color: var(--color-text-primary);
  background: transparent;
}

.block-content-editor:focus {
  outline: none;
}

/* 移除块类型的边框和背景色 */

.block-item.code .block-content-editor {
  font-family: inherit;
}

/* 块内容显示区域 */
.block-content-display {
  width: 100%;
  min-height: 1.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
  cursor: text;
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
  color: var(--color-text-primary);
}

.block-content-display:active {
  transform: translateX(1px);
}

/* 块引用样式 */
.block-reference {
  color: #007bff;
  background-color: rgba(0, 123, 255, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.block-reference:hover {
  background-color: rgba(0, 123, 255, 0.2);
  text-decoration: underline;
}

/* 块嵌入样式 */
.block-embed {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.block-embed:hover {
  background-color: rgba(40, 167, 69, 0.2);
  text-decoration: underline;
}

/* 目标块高亮动画 */
.highlight-target {
  animation: highlightPulse 2s ease-in-out;
}

@keyframes highlightPulse {
  0% { background-color: rgba(255, 193, 7, 0.3); }
  50% { background-color: rgba(255, 193, 7, 0.6); }
  100% { background-color: transparent; }
}

/* 块操作菜单 */
.block-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 160px;
  padding: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

.menu-separator {
  height: 1px;
  background-color: #e0e0e0;
  margin: 4px 0;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* 拖拽样式 */
.block-item[draggable="true"] {
  cursor: grab;
}

.block-item[draggable="true"]:active {
  cursor: grabbing;
}

.block-item.drag-over {
  border-top: 2px solid #007bff;
  margin-top: 2px;
}

.block-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg);
}

/* 命令菜单样式 */
.command-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 280px;
  max-height: 400px;
  overflow: hidden;
}

.command-search {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.command-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 8px 0;
  background: transparent;
}

.command-input::placeholder {
  color: #999;
}

.command-list {
  max-height: 320px;
  overflow-y: auto;
}

.command-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid #f5f5f5;
}

.command-item:hover {
  background-color: #f8f9fa;
}

.command-item:last-child {
  border-bottom: none;
}

.command-icon {
  margin-right: 12px;
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.command-info {
  flex: 1;
}

.command-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
}

.command-desc {
  font-size: 12px;
  color: #666;
}

/* 聚焦模式样式 */
.block-item.focused {
  /* 移除聚焦状态的视觉效果，保持简洁 */
}

.block-item.dimmed {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

.block-icon.focused-icon {
  /* 移除聚焦图标的背景色 */
}

/* 聚焦模式下的内容区域 */
.block-item.focused .block-content-area {
  padding: 8px;
}

.block-item.focused .block-content-display,
.block-item.focused .block-content-editor {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text-primary);
}

/* 悬停状态 */
.block-item:hover .block-icon {
  opacity: 1;
}

/* 编辑状态 */
.block-item.editing {
  /* 编辑状态保持简洁，无特殊样式 */
}

/* 块类型特定样式 */
.block-item.code {
  font-family: inherit;
}

/* 改进的块图标样式 */
.block-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-icon:hover {
  transform: scale(1.2);
}

.block-type-icon {
  font-size: 14px;
  line-height: 1;
  transition: all 0.2s ease;
}

/* 数据管理区域样式 */
.data-management-section {
  margin-bottom: 16px;
}

.data-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  min-width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

/* 数据管理面板样式 */
.data-panel {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.data-panel h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.data-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.action-btn {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.save-btn:hover {
  background: #d4edda;
  border-color: #c3e6cb;
}

.export-btn:hover {
  background: #d1ecf1;
  border-color: #bee5eb;
}

.import-btn:hover {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.data-info {
  border-top: 1px solid #dee2e6;
  padding-top: 12px;
}

.data-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #6c757d;
}

.save-time {
  font-family: monospace;
}

.auto-save-status .saving {
  color: #007bff;
  font-weight: 500;
}

/* 块区域标题样式 */
.blocks-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

/* 空状态样式 */
.empty-blocks {
  text-align: center;
  padding: 32px 16px;
  color: #6c757d;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.empty-blocks:hover {
  background-color: #f8f9fa;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-message p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

</style>