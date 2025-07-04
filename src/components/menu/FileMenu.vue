<template>
  <div class="file-menu">
    <button @click="fileManager.newFile" class="menu-button">New</button>
    <button @click="fileManager.openFile" class="menu-button" :disabled="fileManager.isLoading">Open</button>
    <button @click="fileManager.saveFile" class="menu-button" :disabled="fileManager.isLoading">Save</button>
    <button @click="fileManager.saveAsFile" class="menu-button" :disabled="fileManager.isLoading">Save As</button>
  </div>
</template>

<script setup lang="ts">
import { useFileManagerStore } from '@/store/fileManager';

const fileManager = useFileManagerStore();
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