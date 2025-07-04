<template>
  <aside class="sidebar" v-if="selectedCard">
    <div class="sidebar-content">
      <input
        type="text"
        v-model="editableTitle"
        @input="onTitleChange"
        class="title-input"
        placeholder="Enter title..."
      />
      <textarea
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

.sidebar-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.title-input {
  border: none;
  background: transparent;
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0.5rem 0.25rem;
  margin: -0.5rem -0.25rem 1rem;
  width: calc(100% + 0.5rem);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-family: inherit;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.title-input:focus {
  outline: none;
  background-color: var(--color-bg-primary);
  box-shadow: inset 0 0 0 1px var(--color-border);
}

textarea {
  width: 100%;
  flex-grow: 1;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
  font-family: inherit;
  resize: none;
  box-sizing: border-box;
  background-color: var(--color-bg-primary);
  color: var(--color-text-secondary);
}

textarea:focus {
  outline: none;
  border-color: var(--color-accent-secondary);
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
}
</style> 