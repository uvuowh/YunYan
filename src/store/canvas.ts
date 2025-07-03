import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export interface Card {
  id: number;
  x: number;
  y: number;
  text: string;
}

export interface Connection {
    id: string;
    from: { cardId: number; anchor: string; };
    to: { cardId: number; anchor: string; };
}

export const useCanvasStore = defineStore('canvas', () => {
  const cards = reactive<Card[]>([]);
  const connections = reactive<Connection[]>([]);
  let nextCardId = 0;

  function addCard(x: number, y: number) {
    cards.push({ id: nextCardId, x, y, text: `Card ${nextCardId}` });
    nextCardId++;
  }

  function updateCardPosition({ id, x, y }: { id: number, x: number, y: number }) {
    const card = cards.find(c => c.id === id);
    if (card) {
      card.x = x;
      card.y = y;
    }
  }

  function updateCardText({ id, text }: { id: number, text: string }) {
    const card = cards.find(c => c.id === id);
    if (card) {
      card.text = text;
    }
  }

  function addConnection(from: { cardId: number; anchor: string; }, to: { cardId: number; anchor: string; }) {
      if (from.cardId === to.cardId) return;
      
      const newConnection = {
          id: `${from.cardId}-${to.cardId}-${Date.now()}`,
          from,
          to,
      };
      connections.push(newConnection);
  }

  // Initialize with some default data
  addCard(50, 50);
  addCard(250, 150);

  return { cards, connections, addCard, updateCardPosition, updateCardText, addConnection };
}); 