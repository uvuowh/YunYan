import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export interface Card {
  id: number;
  x: number;
  y: number;
  title: string;
  content: string;
  width: number;
  height: number;
}

export interface Connection {
    id: string;
    id1: number; // Always the smaller ID
    id2: number; // Always the larger ID
    direction: '1->2' | '2->1' | 'both';
}

export const useCanvasStore = defineStore('canvas', () => {
  const cards = reactive<Card[]>([]);
  const connections = reactive<Connection[]>([]);
  const selectedCardId = ref<number | null>(null);
  let nextCardId = 0;

  /**
   * Adds a new card to the canvas at the specified coordinates.
   * The new card is initialized with a default title, content, and size.
   * @param {number} x The x-coordinate for the new card.
   * @param {number} y The y-coordinate for the new card.
   */
  function addCard(x: number, y: number) {
    const newCardId = nextCardId++;
    cards.push({
      id: newCardId,
      x,
      y,
      title: `Node ${newCardId}`,
      content: 'This is the content for the new node.',
      width: 150,
      height: 60,
    });
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
  
  function manageConnection(targetId: number) {
    const selectedId = selectedCardId.value;
    if (selectedId === null || selectedId === targetId) return;

    const id1 = Math.min(selectedId, targetId);
    const id2 = Math.max(selectedId, targetId);
    
    const existingConnection = connections.find(c => c.id1 === id1 && c.id2 === id2);

    if (!existingConnection) {
      // Rule 1: No connection -> Create a --> b
      connections.push({
        id: `${id1}-${id2}`,
        id1,
        id2,
        direction: selectedId === id1 ? '1->2' : '2->1',
      });
    } else {
      const isAction1to2 = selectedId === id1;
      
      if (existingConnection.direction === '1->2' && isAction1to2) {
        // Rule 2: a --> b exists, action is a->b -> remove
        connections.splice(connections.indexOf(existingConnection), 1);
      } else if (existingConnection.direction === '2->1' && !isAction1to2) {
        // Rule 2: b --> a exists, action is b->a -> remove
        connections.splice(connections.indexOf(existingConnection), 1);
      } else if (existingConnection.direction === '2->1' && isAction1to2) {
        // Rule 3: b --> a exists, action is a->b -> upgrade to a <--> b
        existingConnection.direction = 'both';
      } else if (existingConnection.direction === '1->2' && !isAction1to2) {
        // Rule 3: a --> b exists, action is b->a -> upgrade to a <--> b
        existingConnection.direction = 'both';
      } else if (existingConnection.direction === 'both') {
        // Rule 4: a <--> b exists -> downgrade
        existingConnection.direction = isAction1to2 ? '2->1' : '1->2'; // action a->b leaves b->a, action b->a leaves a->b
      }
    }
    // By not resetting the selectedCardId, we keep the focus on the source
    // node, allowing for chaining multiple connections from the same node.
    // selectedCardId.value = null; // Deselect after action
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
      Object.assign(card, data);
    }
  }

  // Initialize with some default data
  addCard(50, 50);
  addCard(250, 150);

  return { cards, connections, selectedCardId, addCard, selectCard, updateCard, manageConnection };
}); 