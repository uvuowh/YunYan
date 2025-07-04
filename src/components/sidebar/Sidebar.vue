<template>
  <aside class="sidebar" v-if="selectedCard">
    <div class="sidebar-content">
      <h2>{{ selectedCard.title }}</h2>
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
  }
}, { immediate: true });

/**
 * Debounced function to update the card's content in the store.
 * This prevents excessive updates while the user is typing.
 */
const debouncedUpdate = debounce((newContent: string) => {
  if (selectedCard.value) {
    store.updateCard({ id: selectedCard.value.id, content: newContent });
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
  debouncedUpdate(newContent);
};
</script>

<style scoped>
.sidebar {
  width: 300px;
  border-left: 1px solid #e0e0e0;
  padding: 20px;
  background-color: #fdfdfd;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

h2 {
  margin-top: 0;
  font-size: 1.2em;
  color: #333;
}

textarea {
  width: 100%;
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  font-size: 1em;
  font-family: inherit;
  resize: none;
  box-sizing: border-box;
}
</style> 