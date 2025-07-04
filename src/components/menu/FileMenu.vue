<template>
  <div class="file-menu">
    <button @click="store.clearCanvas" class="menu-button">New</button>
    <button @click="store.openFromFile" class="menu-button">Open</button>
    <button @click="store.saveToFile" class="menu-button">Save</button>
  </div>
</template>

<script setup lang="ts">
import { useCanvasStore } from '@/store/canvas';

const store = useCanvasStore();
</script>

<style scoped>
.file-menu {
  display: flex;
  gap: 0.5rem;
}

.menu-button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-button:hover {
  background-color: var(--color-bg-primary);
  border-color: var(--color-accent-secondary);
  color: var(--color-accent-secondary);
}
</style> 