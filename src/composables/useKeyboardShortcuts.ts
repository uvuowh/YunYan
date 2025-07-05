import { onMounted, onUnmounted } from 'vue';
import { useHistoryStore } from '@/store/history';
import { useCanvasStore } from '@/store/canvas';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts() {
  const historyStore = useHistoryStore();
  const canvasStore = useCanvasStore();

  // 默认快捷键配置
  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: 'z',
      ctrlKey: true,
      action: () => {
        if (historyStore.canUndo()) {
          historyStore.undo();
        }
      },
      description: '撤销',
      preventDefault: true
    },
    {
      key: 'y',
      ctrlKey: true,
      action: () => {
        if (historyStore.canRedo()) {
          historyStore.redo();
        }
      },
      description: '重做',
      preventDefault: true
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: () => {
        if (historyStore.canRedo()) {
          historyStore.redo();
        }
      },
      description: '重做 (Ctrl+Shift+Z)',
      preventDefault: true
    },
    {
      key: 's',
      ctrlKey: true,
      action: () => {
        canvasStore.saveToLocalStorage();
        console.log('项目已保存');
      },
      description: '保存项目',
      preventDefault: true
    },
    {
      key: 'o',
      ctrlKey: true,
      action: () => {
        canvasStore.loadFromLocalStorage();
        console.log('项目已加载');
      },
      description: '打开项目',
      preventDefault: true
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        if (confirm('确定要创建新项目吗？当前项目的未保存更改将丢失。')) {
          canvasStore.clearCanvas();
          console.log('新项目已创建');
        }
      },
      description: '新建项目',
      preventDefault: true
    },
    {
      key: 'a',
      ctrlKey: true,
      action: () => {
        // 全选所有卡片
        canvasStore.selectAllCards();
      },
      description: '全选',
      preventDefault: true
    },
    {
      key: 'Delete',
      action: () => {
        const selectedCount = canvasStore.getSelectedCount();
        if (selectedCount > 0) {
          const message = selectedCount === 1
            ? '确定要删除选中的卡片吗？'
            : `确定要删除选中的 ${selectedCount} 个卡片吗？`;
          if (confirm(message)) {
            canvasStore.removeSelectedCards();
          }
        }
      },
      description: '删除选中项',
      preventDefault: true
    },
    {
      key: 'Backspace',
      action: () => {
        const selectedCount = canvasStore.getSelectedCount();
        if (selectedCount > 0) {
          const message = selectedCount === 1
            ? '确定要删除选中的卡片吗？'
            : `确定要删除选中的 ${selectedCount} 个卡片吗？`;
          if (confirm(message)) {
            canvasStore.removeSelectedCards();
          }
        }
      },
      description: '删除选中项 (Backspace)',
      preventDefault: true
    },
    {
      key: 'Escape',
      action: () => {
        // 取消选择
        canvasStore.selectCard(null);
      },
      description: '取消选择',
      preventDefault: false
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => {
        if (canvasStore.selectedCardId !== null) {
          // TODO: 实现复制功能
          console.log('复制功能待实现');
        }
      },
      description: '复制选中项',
      preventDefault: true
    },
    {
      key: 'Enter',
      action: () => {
        if (canvasStore.selectedCardId !== null) {
          // TODO: 进入编辑模式
          console.log('编辑模式待实现');
        }
      },
      description: '编辑选中项',
      preventDefault: false
    },
    {
      key: 'F2',
      action: () => {
        if (canvasStore.selectedCardId !== null) {
          // TODO: 重命名功能
          console.log('重命名功能待实现');
        }
      },
      description: '重命名',
      preventDefault: true
    },
    {
      key: '+',
      ctrlKey: true,
      action: () => {
        // TODO: 放大画布
        console.log('缩放功能待实现');
      },
      description: '放大',
      preventDefault: true
    },
    {
      key: '-',
      ctrlKey: true,
      action: () => {
        // TODO: 缩小画布
        console.log('缩放功能待实现');
      },
      description: '缩小',
      preventDefault: true
    },
    {
      key: '0',
      ctrlKey: true,
      action: () => {
        // TODO: 重置缩放
        console.log('缩放功能待实现');
      },
      description: '重置缩放',
      preventDefault: true
    },
    {
      key: 'F1',
      action: () => {
        // F1 快捷键由 KeyboardShortcutsHelp 组件处理
        // 这里只是占位，实际处理在组件中
      },
      description: '显示快捷键帮助',
      preventDefault: true
    }
  ];

  let shortcuts: KeyboardShortcut[] = [...defaultShortcuts];

  // 检查快捷键是否匹配
  function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.shiftKey === !!shortcut.shiftKey &&
      !!event.altKey === !!shortcut.altKey &&
      !!event.metaKey === !!shortcut.metaKey
    );
  }

  // 键盘事件处理器
  function handleKeyDown(event: KeyboardEvent) {
    // 如果焦点在输入框或文本区域，不处理快捷键
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }

  // 添加自定义快捷键
  function addShortcut(shortcut: KeyboardShortcut) {
    shortcuts.push(shortcut);
  }

  // 移除快捷键
  function removeShortcut(key: string, modifiers: Partial<Pick<KeyboardShortcut, 'ctrlKey' | 'shiftKey' | 'altKey' | 'metaKey'>> = {}) {
    shortcuts = shortcuts.filter(shortcut => {
      return !(
        shortcut.key.toLowerCase() === key.toLowerCase() &&
        !!shortcut.ctrlKey === !!modifiers.ctrlKey &&
        !!shortcut.shiftKey === !!modifiers.shiftKey &&
        !!shortcut.altKey === !!modifiers.altKey &&
        !!shortcut.metaKey === !!modifiers.metaKey
      );
    });
  }

  // 获取所有快捷键
  function getShortcuts(): KeyboardShortcut[] {
    return [...shortcuts];
  }

  // 格式化快捷键显示
  function formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];

    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    if (shortcut.metaKey) parts.push('Cmd');

    parts.push(shortcut.key.toUpperCase());

    return parts.join('+');
  }

  // 初始化和清理
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return {
    addShortcut,
    removeShortcut,
    getShortcuts,
    formatShortcut,
    handleKeyDown
  };
}

// 快捷键常量
export const SHORTCUTS = {
  UNDO: { key: 'z', ctrlKey: true },
  REDO: { key: 'y', ctrlKey: true },
  REDO_ALT: { key: 'z', ctrlKey: true, shiftKey: true },
  SAVE: { key: 's', ctrlKey: true },
  DELETE: { key: 'Delete' },
  ESCAPE: { key: 'Escape' },
  ENTER: { key: 'Enter' },
  SPACE: { key: ' ' }
} as const;
