import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import type { Card, Connection } from './canvas';

// 命令接口
export interface Command {
  id: string;
  type: string;
  timestamp: Date;
  execute(): void;
  undo(): void;
  description: string;
}

// Canvas 状态快照
export interface CanvasSnapshot {
  cards: Card[];
  connections: Connection[];
  selectedCardId: number | null;
  nextCardId: number;
}

// 添加卡片命令
export class AddCardCommand implements Command {
  id: string;
  type = 'ADD_CARD';
  timestamp: Date;
  description: string;

  constructor(
    private canvasStore: any,
    private card: Card
  ) {
    this.id = `add_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.description = `添加卡片: ${card.title}`;
  }

  execute(): void {
    // 检查卡片是否已经存在，如果不存在则添加
    const exists = this.canvasStore.cards.some((c: Card) => c.id === this.card.id);
    if (!exists) {
      this.canvasStore.cards.push(this.card);
      if (this.card.id >= this.canvasStore.nextCardId) {
        this.canvasStore.nextCardId = this.card.id + 1;
      }
    }
  }

  undo(): void {
    const index = this.canvasStore.cards.findIndex((c: Card) => c.id === this.card.id);
    if (index !== -1) {
      this.canvasStore.cards.splice(index, 1);
    }
    // 如果删除的是选中的卡片，清除选择
    if (this.canvasStore.selectedCardId === this.card.id) {
      this.canvasStore.selectedCardId = null;
    }
  }
}

// 删除卡片命令
export class RemoveCardCommand implements Command {
  id: string;
  type = 'REMOVE_CARD';
  timestamp: Date;
  description: string;
  private removedConnections: Connection[] = [];

  constructor(
    private canvasStore: any,
    private card: Card
  ) {
    this.id = `remove_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.description = `删除卡片: ${card.title}`;
  }

  execute(): void {
    // 保存相关连接
    this.removedConnections = this.canvasStore.connections.filter(
      (c: Connection) => c.id1 === this.card.id || c.id2 === this.card.id
    );

    // 删除相关连接
    this.canvasStore.connections.splice(0, this.canvasStore.connections.length,
      ...this.canvasStore.connections.filter(
        (c: Connection) => c.id1 !== this.card.id && c.id2 !== this.card.id
      )
    );

    // 删除卡片
    const index = this.canvasStore.cards.findIndex((c: Card) => c.id === this.card.id);
    if (index !== -1) {
      this.canvasStore.cards.splice(index, 1);
    }

    // 清除选择
    if (this.canvasStore.selectedCardId === this.card.id) {
      this.canvasStore.selectedCardId = null;
    }
  }

  undo(): void {
    // 恢复卡片
    this.canvasStore.cards.push(this.card);

    // 恢复连接
    this.removedConnections.forEach(conn => {
      this.canvasStore.connections.push(conn);
    });
  }
}

// 更新卡片命令
export class UpdateCardCommand implements Command {
  id: string;
  type = 'UPDATE_CARD';
  timestamp: Date;
  description: string;

  constructor(
    private canvasStore: any,
    private cardId: number,
    private oldData: Partial<Card>,
    private newData: Partial<Card>
  ) {
    this.id = `update_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.description = `更新卡片: ${this.oldData.title || this.newData.title || cardId}`;
  }

  execute(): void {
    const card = this.canvasStore.cards.find((c: Card) => c.id === this.cardId);
    if (card) {
      Object.assign(card, this.newData);
    }
  }

  undo(): void {
    const card = this.canvasStore.cards.find((c: Card) => c.id === this.cardId);
    if (card) {
      Object.assign(card, this.oldData);
    }
  }
}

// 移动卡片命令
export class MoveCardCommand implements Command {
  id: string;
  type = 'MOVE_CARD';
  timestamp: Date;
  description: string;

  constructor(
    private canvasStore: any,
    private cardId: number,
    private oldPosition: { x: number; y: number },
    private newPosition: { x: number; y: number }
  ) {
    this.id = `move_card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.description = `移动卡片`;
  }

  execute(): void {
    const card = this.canvasStore.cards.find((c: Card) => c.id === this.cardId);
    if (card) {
      card.x = this.newPosition.x;
      card.y = this.newPosition.y;
    }
  }

  undo(): void {
    const card = this.canvasStore.cards.find((c: Card) => c.id === this.cardId);
    if (card) {
      card.x = this.oldPosition.x;
      card.y = this.oldPosition.y;
    }
  }
}

// 连接管理命令
export class ManageConnectionCommand implements Command {
  id: string;
  type = 'MANAGE_CONNECTION';
  timestamp: Date;
  description: string;

  constructor(
    private canvasStore: any,
    private cardId1: number,
    private cardId2: number,
    private oldConnection: Connection | null,
    private newConnection: Connection | null
  ) {
    this.id = `manage_connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.description = `管理连接: ${cardId1} <-> ${cardId2}`;
  }

  execute(): void {
    // 删除旧连接
    if (this.oldConnection) {
      const index = this.canvasStore.connections.findIndex(
        (c: Connection) => c.id === this.oldConnection!.id
      );
      if (index !== -1) {
        this.canvasStore.connections.splice(index, 1);
      }
    }

    // 添加新连接
    if (this.newConnection) {
      this.canvasStore.connections.push(this.newConnection);
    }
  }

  undo(): void {
    // 删除新连接
    if (this.newConnection) {
      const index = this.canvasStore.connections.findIndex(
        (c: Connection) => c.id === this.newConnection!.id
      );
      if (index !== -1) {
        this.canvasStore.connections.splice(index, 1);
      }
    }

    // 恢复旧连接
    if (this.oldConnection) {
      this.canvasStore.connections.push(this.oldConnection);
    }
  }
}

// 历史管理 Store
export const useHistoryStore = defineStore('history', () => {
  const undoStack = reactive<Command[]>([]);
  const redoStack = reactive<Command[]>([]);
  const maxHistorySize = ref(100); // 最大历史记录数
  const isExecutingCommand = ref(false); // 防止在执行命令时记录历史

  // 执行命令并记录到历史
  function executeCommand(command: Command) {
    if (isExecutingCommand.value) return;

    isExecutingCommand.value = true;
    try {
      command.execute();

      // 添加到撤销栈
      undoStack.push(command);

      // 清空重做栈
      redoStack.splice(0, redoStack.length);

      // 限制历史记录大小
      if (undoStack.length > maxHistorySize.value) {
        undoStack.shift();
      }
    } finally {
      isExecutingCommand.value = false;
    }
  }

  // 撤销
  function undo(): boolean {
    if (undoStack.length === 0 || isExecutingCommand.value) return false;

    isExecutingCommand.value = true;
    try {
      const command = undoStack.pop();
      if (command) {
        command.undo();
        redoStack.push(command);
        return true;
      }
    } finally {
      isExecutingCommand.value = false;
    }
    return false;
  }

  // 重做
  function redo(): boolean {
    if (redoStack.length === 0 || isExecutingCommand.value) return false;

    isExecutingCommand.value = true;
    try {
      const command = redoStack.pop();
      if (command) {
        command.execute();
        undoStack.push(command);
        return true;
      }
    } finally {
      isExecutingCommand.value = false;
    }
    return false;
  }

  // 清空历史
  function clearHistory() {
    undoStack.splice(0, undoStack.length);
    redoStack.splice(0, redoStack.length);
  }

  // 获取历史信息
  const canUndo = () => undoStack.length > 0 && !isExecutingCommand.value;
  const canRedo = () => redoStack.length > 0 && !isExecutingCommand.value;
  const getUndoDescription = () => undoStack.length > 0 ? undoStack[undoStack.length - 1].description : '';
  const getRedoDescription = () => redoStack.length > 0 ? redoStack[redoStack.length - 1].description : '';

  return {
    undoStack,
    redoStack,
    maxHistorySize,
    isExecutingCommand,
    executeCommand,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    getUndoDescription,
    getRedoDescription
  };
});
