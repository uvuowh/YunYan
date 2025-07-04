<template>
  <aside class="sidebar" v-if="selectedCard">
    <div class="sidebar-header">
      <h3>Node Properties</h3>
      <button @click="handleDelete" class="delete-button" aria-label="Delete Node">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
    <div class="sidebar-content">
      <label for="title-input">Title</label>
      <input
        id="title-input"
        type="text"
        v-model="editableTitle"
        @input="onTitleChange"
        class="styled-input"
        placeholder="Enter title..."
      />
      <label for="content-textarea">Content</label>
      <textarea
        id="content-textarea"
        v-model="editableContent"
        @input="onContentChange"
        placeholder="Enter content..."
      ></textarea>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import { debounce } from 'lodash';

const store = useCanvasStore();
const { cards, selectedCardId } = storeToRefs(store);

const editableContent = ref('');
const editableTitle = ref('');

/**
 * Finds the currently selected card from the store based on selectedCardId.
 * @returns {Card | undefined} The selected card object or undefined if no card is selected.
 */
const selectedCard = computed(() => {
  if (selectedCardId.value === null) return undefined;
  return cards.value.find(card => card.id === selectedCardId.value);
});

/**
 * Watches for changes in the selected card and updates the local
 * editable content to reflect the new card's content.
 */
watch(selectedCard, (newCard) => {
  if (newCard) {
    editableContent.value = newCard.content;
    editableTitle.value = newCard.title;
  }
}, { immediate: true });

/**
 * Debounced function to update the card's content in the store.
 * This prevents excessive updates while the user is typing.
 */
const debouncedContentUpdate = debounce((newContent: string) => {
  if (selectedCard.value) {
    store.updateCard({ id: selectedCard.value.id, content: newContent });
  }
}, 300);

/**
 * Debounced function to update the card's title in the store.
 */
const debouncedTitleUpdate = debounce((newTitle: string) => {
  if (selectedCard.value) {
    store.updateCard({ id: selectedCard.value.id, title: newTitle });
  }
}, 300);

/**
 * Handles the input event from the textarea.
 * It calls the debounced update function to save the changes.
 * @param {Event} event The input event from the textarea.
 */
const onContentChange = (event: Event) => {
  const newContent = (event.target as HTMLTextAreaElement).value;
  editableContent.value = newContent;
  debouncedContentUpdate(newContent);
};

/**
 * Handles the input event from the title input field.
 * It calls the debounced update function to save the title changes.
 * @param {Event} event The input event from the title input.
 */
const onTitleChange = (event: Event) => {
    const newTitle = (event.target as HTMLInputElement).value;
    editableTitle.value = newTitle;
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
</script>

<style scoped>
.sidebar {
  width: 300px;
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
  resize: none;
}
</style> 