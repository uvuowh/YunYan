import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useHistoryStore, AddCardCommand, RemoveCardCommand, UpdateCardCommand, MoveCardCommand, ManageConnectionCommand } from '@/store/history';
import type { Card, Connection } from '@/store/canvas';

describe('History Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('History Store Basic Operations', () => {
    it('should initialize with empty stacks', () => {
      const historyStore = useHistoryStore();
      
      expect(historyStore.undoStack).toHaveLength(0);
      expect(historyStore.redoStack).toHaveLength(0);
      expect(historyStore.canUndo()).toBe(false);
      expect(historyStore.canRedo()).toBe(false);
    });

    it('should execute command and add to undo stack', () => {
      const historyStore = useHistoryStore();
      const mockStore = { cards: [], nextCardId: 0 };
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card',
        content: 'Test content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };

      const command = new AddCardCommand(mockStore, mockCard);
      historyStore.executeCommand(command);

      expect(historyStore.undoStack).toHaveLength(1);
      expect(historyStore.redoStack).toHaveLength(0);
      expect(historyStore.canUndo()).toBe(true);
      expect(historyStore.canRedo()).toBe(false);
      expect(mockStore.cards).toHaveLength(1);
    });

    it('should undo command and move to redo stack', () => {
      const historyStore = useHistoryStore();
      const mockStore = { cards: [], nextCardId: 0 };
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card',
        content: 'Test content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };

      const command = new AddCardCommand(mockStore, mockCard);
      historyStore.executeCommand(command);
      
      const undoResult = historyStore.undo();

      expect(undoResult).toBe(true);
      expect(historyStore.undoStack).toHaveLength(0);
      expect(historyStore.redoStack).toHaveLength(1);
      expect(historyStore.canUndo()).toBe(false);
      expect(historyStore.canRedo()).toBe(true);
      expect(mockStore.cards).toHaveLength(0);
    });

    it('should redo command and move back to undo stack', () => {
      const historyStore = useHistoryStore();
      const mockStore = { cards: [], nextCardId: 0 };
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card',
        content: 'Test content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };

      const command = new AddCardCommand(mockStore, mockCard);
      historyStore.executeCommand(command);
      historyStore.undo();
      
      const redoResult = historyStore.redo();

      expect(redoResult).toBe(true);
      expect(historyStore.undoStack).toHaveLength(1);
      expect(historyStore.redoStack).toHaveLength(0);
      expect(historyStore.canUndo()).toBe(true);
      expect(historyStore.canRedo()).toBe(false);
      expect(mockStore.cards).toHaveLength(1);
    });

    it('should clear redo stack when new command is executed', () => {
      const historyStore = useHistoryStore();
      const mockStore = { cards: [], nextCardId: 0 };
      const mockCard1: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card 1',
        content: 'Test content 1',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };
      const mockCard2: Card = {
        id: 2,
        x: 200,
        y: 200,
        title: 'Test Card 2',
        content: 'Test content 2',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };

      const command1 = new AddCardCommand(mockStore, mockCard1);
      const command2 = new AddCardCommand(mockStore, mockCard2);
      
      historyStore.executeCommand(command1);
      historyStore.undo();
      expect(historyStore.redoStack).toHaveLength(1);
      
      historyStore.executeCommand(command2);
      expect(historyStore.redoStack).toHaveLength(0);
    });

    it('should limit history size', () => {
      const historyStore = useHistoryStore();
      historyStore.maxHistorySize = 2;
      const mockStore = { cards: [], nextCardId: 0 };

      // Add 3 commands
      for (let i = 0; i < 3; i++) {
        const mockCard: Card = {
          id: i,
          x: 100,
          y: 100,
          title: `Test Card ${i}`,
          content: `Test content ${i}`,
          width: 200,
          height: 150,
          blocks: [],
          created: new Date(),
          lastModified: new Date(),
          version: 1
        };
        const command = new AddCardCommand(mockStore, mockCard);
        historyStore.executeCommand(command);
      }

      expect(historyStore.undoStack).toHaveLength(2);
    });
  });

  describe('AddCardCommand', () => {
    it('should add card when executed', () => {
      const mockStore = { cards: [], nextCardId: 0 };
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card',
        content: 'Test content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };

      const command = new AddCardCommand(mockStore, mockCard);
      command.execute();

      expect(mockStore.cards).toHaveLength(1);
      expect(mockStore.cards[0]).toBe(mockCard);
      expect(mockStore.nextCardId).toBe(2);
    });

    it('should remove card when undone', () => {
      const mockStore = { cards: [], nextCardId: 0, selectedCardId: null };
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card',
        content: 'Test content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };

      const command = new AddCardCommand(mockStore, mockCard);
      command.execute();
      command.undo();

      expect(mockStore.cards).toHaveLength(0);
    });
  });

  describe('RemoveCardCommand', () => {
    it('should remove card and connections when executed', () => {
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card',
        content: 'Test content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };
      const mockConnection: Connection = {
        id: '1-2',
        id1: 1,
        id2: 2,
        direction: '1->2'
      };
      const mockStore = { 
        cards: [mockCard], 
        connections: [mockConnection], 
        selectedCardId: 1 
      };

      const command = new RemoveCardCommand(mockStore, mockCard);
      command.execute();

      expect(mockStore.cards).toHaveLength(0);
      expect(mockStore.connections).toHaveLength(0);
      expect(mockStore.selectedCardId).toBe(null);
    });

    it('should restore card and connections when undone', () => {
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Test Card',
        content: 'Test content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };
      const mockConnection: Connection = {
        id: '1-2',
        id1: 1,
        id2: 2,
        direction: '1->2'
      };
      const mockStore = { 
        cards: [mockCard], 
        connections: [mockConnection], 
        selectedCardId: 1 
      };

      const command = new RemoveCardCommand(mockStore, mockCard);
      command.execute();
      command.undo();

      expect(mockStore.cards).toHaveLength(1);
      expect(mockStore.connections).toHaveLength(1);
      expect(mockStore.cards[0]).toBe(mockCard);
      expect(mockStore.connections[0]).toEqual(mockConnection);
    });
  });

  describe('UpdateCardCommand', () => {
    it('should update card properties when executed', () => {
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'Old Title',
        content: 'Old content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };
      const mockStore = { cards: [mockCard] };
      const oldData = { title: 'Old Title', content: 'Old content' };
      const newData = { title: 'New Title', content: 'New content' };

      const command = new UpdateCardCommand(mockStore, 1, oldData, newData);
      command.execute();

      expect(mockCard.title).toBe('New Title');
      expect(mockCard.content).toBe('New content');
    });

    it('should restore old properties when undone', () => {
      const mockCard: Card = {
        id: 1,
        x: 100,
        y: 100,
        title: 'New Title',
        content: 'New content',
        width: 200,
        height: 150,
        blocks: [],
        created: new Date(),
        lastModified: new Date(),
        version: 1
      };
      const mockStore = { cards: [mockCard] };
      const oldData = { title: 'Old Title', content: 'Old content' };
      const newData = { title: 'New Title', content: 'New content' };

      const command = new UpdateCardCommand(mockStore, 1, oldData, newData);
      command.undo();

      expect(mockCard.title).toBe('Old Title');
      expect(mockCard.content).toBe('Old content');
    });
  });
});
