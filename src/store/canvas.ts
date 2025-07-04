import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';

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

  /**
   * Resets the canvas to a blank state.
   */
  function clearCanvas() {
    cards.splice(0, cards.length);
    connections.splice(0, connections.length);
    selectedCardId.value = null;
    nextCardId = 0;
  }

  /**
   * Saves the current canvas state to a JSON file.
   */
  async function saveToFile() {
    try {
      const filePath = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: 'canvas.json'
      });
      if (!filePath) return;

      const state = {
        cards: Array.from(cards),
        connections: Array.from(connections),
      };
      await writeTextFile(filePath, JSON.stringify(state, null, 2));
      console.log(`Saved to ${filePath}`);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  /**
   * Opens a JSON file and restores the canvas state.
   */
  async function openFromFile() {
    try {
      const filePath = await open({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      });
      if (!filePath) return;

      const content = await readTextFile(filePath.path);
      const state = JSON.parse(content);

      if (state.cards && state.connections) {
        clearCanvas();
        // Use nextTick if needed, but for raw array replacement it's often fine
        Object.assign(cards, state.cards);
        Object.assign(connections, state.connections);
        
        // Find the max ID to continue numbering correctly
        const maxId = Math.max(...state.cards.map((c: Card) => c.id), -1);
        nextCardId = maxId + 1;
      }
    } catch (error) {
      console.error('Failed to open or parse file:', error);
    }
  }

  // Initialize with some default data
  addCard(50, 50);
  addCard(250, 150);

  return { cards, connections, selectedCardId, addCard, removeCard, selectCard, updateCard, manageConnection, clearCanvas, saveToFile, openFromFile };
}); 