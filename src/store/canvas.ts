import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

// UUID 生成函数
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 创建新块的工具函数
function createBlock(
  type: Block['type'],
  content: string = '',
  properties?: Record<string, any>
): Block {
  const now = new Date();
  return {
    id: generateUUID(),
    type,
    content,
    properties,
    references: [],
    backlinks: [],
    created: now,
    updated: now,
    version: 1
  };
}

export interface Block {
  id: string; // UUID 唯一标识
  type: 'paragraph' | 'heading' | 'list' | 'code';
  content: string;
  properties?: Record<string, any>; // 自定义属性
  references?: string[]; // 引用的其他块ID
  backlinks?: string[]; // 反向链接
  created: Date; // 创建时间
  updated: Date; // 更新时间
  version: number; // 版本号，用于冲突解决
  isEditing?: boolean; // 是否正在编辑状态
}

export interface Card {
  id: number;
  x: number;
  y: number;
  title: string; // 文档标题
  content: string; // 原始内容
  width: number;
  height: number;
  blocks: Block[]; // 内容块
  created: Date; // 创建时间
  lastModified: Date; // 最后修改时间
  version: number; // 版本号
  properties?: Record<string, any>; // 自定义属性
}

export interface Connection {
    id: string;
    id1: number; // Always the smaller ID
    id2: number; // Always the larger ID
    direction: '1->2' | '2->1' | 'both' | 'none';
}

type ConnectionDirection = Connection['direction'];

const transitions: Record<string, Record<ConnectionDirection, ConnectionDirection>> = {
  '1->2': { // Action from card 1 to 2
    'none': '1->2',
    '1->2': 'none',
    '2->1': 'both',
    'both': '2->1'
  },
  '2->1': { // Action from card 2 to 1
    'none': '2->1',
    '1->2': 'both',
    '2->1': 'none',
    'both': '1->2'
  }
};

export const useCanvasStore = defineStore('canvas', () => {
  const cards = reactive<Card[]>([]);
  const connections = reactive<Connection[]>([]);
  const selectedCardId = ref<number | null>(null);
  const focusedBlockId = ref<string | null>(null); // 聚焦的块ID
  let nextCardId = 0;

  // 自动保存相关
  const isAutoSaving = ref(false);
  const lastSaveTime = ref<Date | null>(null);
  const autoSaveInterval = ref<NodeJS.Timeout | null>(null);



  // Mark file as modified when canvas changes
  function markAsModified() {
    // File manager functionality has been removed
    // This function is kept for compatibility but does nothing
  }

  // 初始化：加载数据和启动自动保存
  function initialize() {
    // 尝试从本地存储加载数据
    loadFromLocalStorage();

    // 启动自动保存（30秒间隔）
    startAutoSave(30000);
  }

  /**
   * 解析内容中的块引用 [[块ID]] 和 ((块引用))
   */
  function parseBlockReferences(content: string): string[] {
    const references: string[] = [];
    // 匹配 [[块ID]] 格式 - 块引用
    const blockLinkRegex = /\[\[([^\]]+)\]\]/g;
    // 匹配 ((块ID)) 格式 - 块嵌入
    const blockRefRegex = /\(\(([^)]+)\)\)/g;

    let match;
    while ((match = blockLinkRegex.exec(content)) !== null) {
      references.push(match[1]);
    }
    while ((match = blockRefRegex.exec(content)) !== null) {
      references.push(match[1]);
    }

    return references;
  }

  /**
   * 渲染带有引用高亮的内容
   */
  function renderContentWithReferences(content: string): string {
    let rendered = content;

    // 转义 HTML 特殊字符
    rendered = rendered
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    // 高亮块引用 [[块ID]]
    rendered = rendered.replace(/\[\[([^\]]+)\]\]/g, (match, blockId) => {
      const targetBlock = findBlockById(blockId);
      const title = targetBlock ? getBlockDisplayTitle(targetBlock) : blockId;
      return `<span class="block-reference" data-block-id="${blockId}" title="${title.replace(/"/g, '&quot;')}">${match}</span>`;
    });

    // 高亮块嵌入 ((块ID))
    rendered = rendered.replace(/\(\(([^)]+)\)\)/g, (match, blockId) => {
      const targetBlock = findBlockById(blockId);
      const title = targetBlock ? getBlockDisplayTitle(targetBlock) : blockId;
      return `<span class="block-embed" data-block-id="${blockId}" title="${title.replace(/"/g, '&quot;')}">${match}</span>`;
    });

    // 处理换行
    rendered = rendered.replace(/\n/g, '<br>');

    return rendered;
  }

  /**
   * 根据块ID查找块
   */
  function findBlockById(blockId: string): Block | null {
    for (const card of cards) {
      const block = card.blocks.find(b => b.id === blockId);
      if (block) return block;
    }
    return null;
  }

  /**
   * 获取块的显示标题
   */
  function getBlockDisplayTitle(block: Block): string {
    const content = block.content.trim();
    if (content.length <= 50) return content;
    return content.substring(0, 47) + '...';
  }

  /**
   * 计算标题所需的节点尺寸
   */
  function calculateCardSize(title: string): { width: number; height: number } {
    // 基础字体大小
    const baseFontSize = 20;
    // 字符宽度约为字体大小的60%
    const charWidth = baseFontSize * 0.6;
    // 行高约为字体大小的1.2倍
    const lineHeight = baseFontSize * 1.2;

    // 计算文字所需宽度（考虑换行）
    const maxCharsPerLine = 15; // 每行最多字符数
    const lines = Math.ceil(title.length / maxCharsPerLine);
    const actualCharsPerLine = Math.min(title.length, maxCharsPerLine);

    // 计算尺寸（加上边距）
    const textWidth = actualCharsPerLine * charWidth;
    const textHeight = lines * lineHeight;

    // 最小和最大尺寸限制
    const minWidth = 80;
    const minHeight = 40;
    const maxWidth = 300;
    const maxHeight = 200;

    const width = Math.max(minWidth, Math.min(maxWidth, textWidth + 20));
    const height = Math.max(minHeight, Math.min(maxHeight, textHeight + 20));

    return { width, height };
  }

  /**
   * 将内容分解为块
   */
  function parseContentToBlocks(content: string): Block[] {
    const lines = content.split('\n');
    const blocks: Block[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let blockType: Block['type'] = 'paragraph';

      // 判断块类型
      if (line.startsWith('#')) {
        blockType = 'heading';
      } else if (line.startsWith('-') || line.startsWith('*')) {
        blockType = 'list';
      } else if (line.startsWith('```')) {
        blockType = 'code';
      }

      const references = parseBlockReferences(line);

      // 使用新的 createBlock 工具函数
      const block = createBlock(blockType, line);
      block.references = references;

      blocks.push(block);
    }

    return blocks;
  }

  /**
   * 更新所有块的反向链接
   */
  function updateBacklinks() {
    // 清空所有反向链接
    cards.forEach(card => {
      card.blocks.forEach(block => {
        block.backlinks = [];
      });
    });

    // 重新计算反向链接
    cards.forEach(card => {
      card.blocks.forEach(block => {
        if (block.references) {
          block.references.forEach(refId => {
            // 查找被引用的块
            cards.forEach(targetCard => {
              const targetBlock = targetCard.blocks.find(b => b.id === refId || b.content.includes(refId));
              if (targetBlock) {
                if (!targetBlock.backlinks) targetBlock.backlinks = [];
                targetBlock.backlinks.push(block.id);
              }
            });
          });
        }
      });
    });
  }

  /**
   * Adds a new card to the canvas at the specified coordinates.
   * The new card is initialized with a default title, content, and size.
   * @param {number} x The x-coordinate for the new card.
   * @param {number} y The y-coordinate for the new card.
   */
  function addCard(x: number, y: number) {
    const newCardId = nextCardId++;
    const documentTitle = `Document-${newCardId}`;
    const defaultContent = `# ${documentTitle}\n\n这是一个新的文档。\n\n- 支持块引用 [[其他块]]\n- 支持双向链接 ((块引用))`;
    const now = new Date();

    // 计算标题所需的尺寸
    const { width, height } = calculateCardSize(documentTitle);

    const newCard: Card = {
      id: newCardId,
      x,
      y,
      title: documentTitle,
      content: defaultContent,
      width,
      height,
      blocks: parseContentToBlocks(defaultContent),
      created: now,
      lastModified: now,
      version: 1,
      properties: {}
    };

    cards.push(newCard);
    updateBacklinks();
    markAsModified();
  }

  /**
   * Removes a card and any connections attached to it.
   * @param {number} id The ID of the card to remove.
   */
  function removeCard(id: number) {
    const cardIndex = cards.findIndex(c => c.id === id);
    if (cardIndex === -1) return;

    // Remove the card
    cards.splice(cardIndex, 1);

    // Remove associated connections
    const connectionsToRemove = connections.filter(c => c.id1 === id || c.id2 === id);
    connectionsToRemove.forEach(conn => {
      const connIndex = connections.indexOf(conn);
      if (connIndex > -1) {
        connections.splice(connIndex, 1);
      }
    });

    // Clear selection if the removed card was selected
    if (selectedCardId.value === id) {
      selectedCardId.value = null;
    }
    markAsModified();
  }

  /**
   * Toggles the selection of a card. If the card is already selected,
   * it gets deselected. Otherwise, it becomes the selected card.
   * @param {number | null} id The ID of the card to select, or null to deselect.
   */
  function selectCard(id: number | null) {
    if (selectedCardId.value === id) {
        selectedCardId.value = null; // deselect
    } else {
        selectedCardId.value = id;
    }
  }
  
  /**
   * Manages the connection state between the currently selected card and a target card.
   * This function implements a state machine to cycle through connection states
   * (none -> one-way -> two-way -> other-way -> none).
   * @param {number} targetId The ID of the card being connected to.
   */
  function manageConnection(targetId: number) {
    const selectedId = selectedCardId.value;
    if (selectedId === null || selectedId === targetId) return;

    const id1 = Math.min(selectedId, targetId);
    const id2 = Math.max(selectedId, targetId);

    const existingConnection = connections.find(c => c.id1 === id1 && c.id2 === id2);
    const currentDirection = existingConnection?.direction ?? 'none';
    const action = selectedId === id1 ? '1->2' : '2->1';

    const nextDirection = transitions[action][currentDirection];

    if (nextDirection === 'none') {
      if (existingConnection) {
        connections.splice(connections.indexOf(existingConnection), 1);
      }
    } else if (existingConnection) {
      existingConnection.direction = nextDirection;
    } else {
      connections.push({
        id: `${id1}-${id2}`,
        id1,
        id2,
        direction: nextDirection,
      });
    }
    markAsModified();
    // By not resetting the selectedCardId, we keep the focus on the source
    // node, allowing for chaining multiple connections from the same node.
    // selectedCardId.value = null; // Deselect after action
  }

  /**
   * 自动调整卡片尺寸以适应标题
   */
  function autoResizeCard(cardId: number) {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      const { width, height } = calculateCardSize(card.title);
      card.width = width;
      card.height = height;
      card.lastModified = new Date();
      card.version = (card.version || 1) + 1;
      markAsModified();
    }
  }

  /**
   * Updates the properties of a specific card.
   * This function merges the provided data with the existing card data.
   * @param {Partial<Card> & { id: number }} payload An object containing the card ID and the properties to update.
   */
  function updateCard(payload: Partial<Card> & { id: number }) {
    const { id, ...data } = payload;
    const card = cards.find(c => c.id === id);
    if (card) {
      // 如果更新了标题，自动调整尺寸
      if (data.title && data.title !== card.title) {
        const { width, height } = calculateCardSize(data.title);
        data.width = width;
        data.height = height;
      }

      // 如果更新了内容，重新解析块
      if (data.content && data.content !== card.content) {
        card.blocks = parseContentToBlocks(data.content);
        card.lastModified = new Date();
        card.version = (card.version || 1) + 1; // 增加版本号
      }

      // 更新最后修改时间
      if (Object.keys(data).length > 0) {
        data.lastModified = new Date();
        data.version = (card.version || 1) + 1;
      }

      Object.assign(card, data);
      updateBacklinks();
      markAsModified();
    }
  }

  /**
   * 更新块内容和元数据
   */
  function updateBlock(blockId: string, updates: Partial<Block>) {
    const card = findCardByBlockId(blockId);
    if (card) {
      const block = card.blocks.find(b => b.id === blockId);
      if (block) {
        // 更新块内容
        Object.assign(block, updates);
        block.updated = new Date();
        block.version = (block.version || 1) + 1;

        // 如果内容改变，重新解析引用
        if (updates.content) {
          block.references = parseBlockReferences(updates.content);
        }

        // 更新卡片的最后修改时间
        card.lastModified = new Date();
        card.version = (card.version || 1) + 1;

        updateBacklinks();
        markAsModified();
      }
    }
  }

  /**
   * 向指定卡片添加新块
   */
  function addBlock(cardId: string, type: Block['type'] = 'paragraph', content: string = '', insertIndex?: number) {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      const newBlock = createBlock(type, content);

      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= card.blocks.length) {
        // 在指定位置插入
        card.blocks.splice(insertIndex, 0, newBlock);
      } else {
        // 添加到末尾
        card.blocks.push(newBlock);
      }

      // 更新卡片内容
      const allContent = card.blocks.map(b => b.content).join('\n\n');
      card.content = allContent;
      card.lastModified = new Date();
      card.version = (card.version || 1) + 1;

      // 更新反向链接
      updateBacklinks();
      markAsModified();

      return newBlock;
    }
    return null;
  }

  /**
   * 删除块
   */
  function deleteBlock(blockId: string) {
    const card = findCardByBlockId(blockId);
    if (card) {
      const blockIndex = card.blocks.findIndex(b => b.id === blockId);
      if (blockIndex !== -1) {
        // 保存删除的块到历史记录（用于恢复）
        const deletedBlock = card.blocks[blockIndex];

        // 从数组中移除块
        card.blocks.splice(blockIndex, 1);

        // 更新卡片内容
        const allContent = card.blocks.map(b => b.content).join('\n\n');
        card.content = allContent;
        card.lastModified = new Date();
        card.version = (card.version || 1) + 1;

        updateBacklinks();
        markAsModified();

        return deletedBlock;
      }
    }
    return null;
  }

  /**
   * 复制块
   */
  function duplicateBlock(blockId: string) {
    const card = findCardByBlockId(blockId);
    if (card) {
      const blockIndex = card.blocks.findIndex(b => b.id === blockId);
      if (blockIndex !== -1) {
        const originalBlock = card.blocks[blockIndex];

        // 创建新块（复制内容）
        const newBlock = createBlock(originalBlock.type, originalBlock.content);
        if (originalBlock.properties) {
          newBlock.properties = { ...originalBlock.properties };
        }

        // 在原块后面插入新块
        card.blocks.splice(blockIndex + 1, 0, newBlock);

        // 更新卡片内容
        const allContent = card.blocks.map(b => b.content).join('\n\n');
        card.content = allContent;
        card.lastModified = new Date();
        card.version = (card.version || 1) + 1;

        updateBacklinks();
        markAsModified();

        return newBlock;
      }
    }
    return null;
  }

  /**
   * 移动块位置
   */
  function moveBlock(blockId: string, newIndex: number) {
    const card = findCardByBlockId(blockId);
    if (card) {
      const currentIndex = card.blocks.findIndex(b => b.id === blockId);
      if (currentIndex !== -1 && currentIndex !== newIndex) {
        // 移除块
        const [block] = card.blocks.splice(currentIndex, 1);

        // 插入到新位置
        const insertIndex = newIndex > currentIndex ? newIndex - 1 : newIndex;
        card.blocks.splice(insertIndex, 0, block);

        // 更新卡片内容
        const allContent = card.blocks.map(b => b.content).join('\n\n');
        card.content = allContent;
        card.lastModified = new Date();
        card.version = (card.version || 1) + 1;

        updateBacklinks();
        markAsModified();

        return true;
      }
    }
    return false;
  }

  /**
   * 转换块类型
   */
  function convertBlockType(blockId: string, newType: Block['type']) {
    const card = findCardByBlockId(blockId);
    if (card) {
      const block = card.blocks.find(b => b.id === blockId);
      if (block && block.type !== newType) {
        block.type = newType;
        block.updated = new Date();
        block.version = (block.version || 1) + 1;

        // 更新卡片
        card.lastModified = new Date();
        card.version = (card.version || 1) + 1;

        updateBacklinks();
        markAsModified();

        return true;
      }
    }
    return false;
  }

  /**
   * 设置聚焦块
   */
  function setFocusedBlock(blockId: string | null) {
    focusedBlockId.value = blockId;
  }

  /**
   * 获取聚焦块
   */
  function getFocusedBlock() {
    return focusedBlockId.value;
  }

  /**
   * 切换聚焦模式
   */
  function toggleFocusMode(blockId: string) {
    if (focusedBlockId.value === blockId) {
      focusedBlockId.value = null; // 取消聚焦
    } else {
      focusedBlockId.value = blockId; // 设置聚焦
    }
  }

  /**
   * 保存数据到本地存储
   */
  function saveToLocalStorage() {
    try {
      const data = {
        cards: cards,
        connections: connections,
        selectedCardId: selectedCardId.value,
        nextCardId: nextCardId,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        metadata: {
          totalBlocks: cards.reduce((sum, card) => sum + card.blocks.length, 0),
          totalCards: cards.length,
          totalConnections: connections.length
        }
      };

      localStorage.setItem('yunyan-canvas-data', JSON.stringify(data));
      lastSaveTime.value = new Date();
      return true;
    } catch (error) {
      console.error('保存数据失败:', error);
      return false;
    }
  }

  /**
   * 从本地存储加载数据
   */
  function loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('yunyan-canvas-data');
      if (savedData) {
        const data = JSON.parse(savedData);

        // 验证数据格式
        if (data.cards && Array.isArray(data.cards)) {
          // 清空现有数据
          cards.splice(0, cards.length);
          connections.splice(0, connections.length);

          // 加载卡片数据
          data.cards.forEach((card: any) => {
            // 确保块有必要的元数据
            if (card.blocks) {
              card.blocks.forEach((block: any) => {
                if (!block.id) block.id = generateUUID();
                if (!block.created) block.created = new Date();
                if (!block.updated) block.updated = new Date();
                if (!block.version) block.version = 1;
              });
            }

            // 确保卡片有必要的元数据
            if (!card.created) card.created = new Date();
            if (!card.lastModified) card.lastModified = new Date();
            if (!card.version) card.version = 1;

            cards.push(card);
          });

          // 加载连接数据
          if (data.connections && Array.isArray(data.connections)) {
            data.connections.forEach((conn: any) => {
              connections.push(conn);
            });
          }

          // 恢复其他状态
          selectedCardId.value = data.selectedCardId || null;
          nextCardId = data.nextCardId || cards.length + 1;

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('加载数据失败:', error);
      return false;
    }
  }

  /**
   * 启动自动保存
   */
  function startAutoSave(intervalMs: number = 30000) { // 默认30秒
    if (autoSaveInterval.value) {
      clearInterval(autoSaveInterval.value);
    }

    autoSaveInterval.value = setInterval(() => {
      if (!isAutoSaving.value) {
        isAutoSaving.value = true;
        saveToLocalStorage();
        isAutoSaving.value = false;
      }
    }, intervalMs);
  }

  /**
   * 停止自动保存
   */
  function stopAutoSave() {
    if (autoSaveInterval.value) {
      clearInterval(autoSaveInterval.value);
      autoSaveInterval.value = null;
    }
  }

  /**
   * 导出数据
   */
  function exportData() {
    const data = {
      cards: cards,
      connections: connections,
      metadata: {
        exportTime: new Date().toISOString(),
        version: '1.0.0',
        totalBlocks: cards.reduce((sum, card) => sum + card.blocks.length, 0),
        totalCards: cards.length,
        totalConnections: connections.length
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入数据
   */
  function importData(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);

      if (data.cards && Array.isArray(data.cards)) {
        // 备份当前数据
        const backup = exportData();
        localStorage.setItem('yunyan-canvas-backup', backup);

        // 清空现有数据
        cards.splice(0, cards.length);
        connections.splice(0, connections.length);

        // 导入新数据
        data.cards.forEach((card: any) => {
          // 重新生成ID以避免冲突
          const newCard = {
            ...card,
            id: nextCardId++,
            blocks: card.blocks?.map((block: any) => ({
              ...block,
              id: generateUUID(),
              created: new Date(block.created || Date.now()),
              updated: new Date(block.updated || Date.now()),
              version: block.version || 1
            })) || []
          };
          cards.push(newCard);
        });

        // 导入连接（需要重新映射ID）
        if (data.connections && Array.isArray(data.connections)) {
          // 这里需要根据实际需求重新映射连接ID
          data.connections.forEach((conn: any) => {
            connections.push(conn);
          });
        }

        // 更新反向链接
        updateBacklinks();

        return true;
      }

      return false;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  /**
   * 获取所有块的引用关系
   */
  function getAllBlockReferences(): { [blockId: string]: string[] } {
    const references: { [blockId: string]: string[] } = {};

    cards.forEach(card => {
      card.blocks.forEach(block => {
        if (block.references && block.references.length > 0) {
          references[block.id] = block.references;
        }
      });
    });

    return references;
  }

  /**
   * 根据块ID查找包含该块的卡片
   */
  function findCardByBlockId(blockId: string): Card | undefined {
    return cards.find(card =>
      card.blocks.some(block => block.id === blockId)
    );
  }



  /**
   * Resets the canvas to a blank state.
   */
  function clearCanvas() {
    cards.splice(0, cards.length);
    connections.splice(0, connections.length);
    selectedCardId.value = null;
    nextCardId = 0;
  }



  // Initialize with some default data
  addCard(50, 50);
  addCard(250, 150);

  // 自动调整所有现有卡片的尺寸
  cards.forEach(card => {
    const { width, height } = calculateCardSize(card.title);
    card.width = width;
    card.height = height;
  });

  return {
    cards,
    connections,
    selectedCardId,
    focusedBlockId,
    nextCardId,
    addCard,
    removeCard,
    selectCard,
    updateCard,
    updateBlock,
    addBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    convertBlockType,
    setFocusedBlock,
    getFocusedBlock,
    toggleFocusMode,
    saveToLocalStorage,
    loadFromLocalStorage,
    startAutoSave,
    stopAutoSave,
    exportData,
    importData,
    initialize,
    isAutoSaving,
    lastSaveTime,
    manageConnection,
    clearCanvas,
    parseBlockReferences,
    renderContentWithReferences,
    findBlockById,
    getBlockDisplayTitle,
    parseContentToBlocks,
    updateBacklinks,
    getAllBlockReferences,
    findCardByBlockId,
    calculateCardSize,
    autoResizeCard
  };
});

// 导出工具函数
export { generateUUID, createBlock };