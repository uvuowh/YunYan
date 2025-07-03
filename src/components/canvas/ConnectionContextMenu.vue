<template>
  <div
    v-if="visible"
    class="connection-context-menu"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <div class="menu-header">
      <span class="menu-title">Create Connection</span>
    </div>

    <div class="menu-options">
      <button
        v-for="option in connectionOptions"
        :key="option.type"
        class="menu-option"
        :class="`option-${option.type}`"
        @click="handleOptionClick(option.type)"
      >
        <div class="option-icon" :style="{ color: option.color }">
          <svg
            v-if="option.type === 'reference'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"
            />
            <path
              d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"
            />
          </svg>
          <svg
            v-else-if="option.type === 'dependency'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <svg
            v-else-if="option.type === 'related'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div class="option-content">
          <span class="option-name">{{ option.name }}</span>
          <span class="option-description">{{ option.description }}</span>
        </div>
      </button>
    </div>
  </div>

  <!-- Backdrop to close menu -->
  <div v-if="visible" class="menu-backdrop" @click="$emit('close')"></div>
</template>

<script setup lang="ts">
import type { Connection } from '../../types/canvas'

export interface Props {
  visible: boolean
  position: { x: number; y: number }
}

export interface Emits {
  (e: 'select', type: Connection['type']): void
  (e: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const connectionOptions = [
  {
    type: 'reference' as const,
    name: 'Reference',
    description: 'Points to related information',
    color: '#3b82f6',
  },
  {
    type: 'dependency' as const,
    name: 'Dependency',
    description: 'Requires or depends on',
    color: '#ef4444',
  },
  {
    type: 'related' as const,
    name: 'Related',
    description: 'Generally connected or similar',
    color: '#10b981',
  },
]

const handleOptionClick = (type: Connection['type']) => {
  emit('select', type)
}
</script>

<style scoped>
.connection-context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  overflow: hidden;
  animation: menuFadeIn 0.15s ease-out;
}

.menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

.menu-header {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.menu-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.menu-options {
  padding: 8px 0;
}

.menu-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.15s ease;
  text-align: left;
}

.menu-option:hover {
  background: #f3f4f6;
}

.option-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
}

.menu-option:hover .option-icon {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.option-description {
  font-size: 12px;
  color: #6b7280;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Dark mode styles */
[data-theme='dark'] .connection-context-menu {
  background: #1f2937;
  border-color: #374151;
}

[data-theme='dark'] .menu-header {
  background: #111827;
  border-bottom-color: #374151;
}

[data-theme='dark'] .menu-title {
  color: #f9fafb;
}

[data-theme='dark'] .menu-option:hover {
  background: #374151;
}

[data-theme='dark'] .menu-option:hover .option-icon {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme='dark'] .option-icon {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .option-name {
  color: #f9fafb;
}

[data-theme='dark'] .option-description {
  color: #9ca3af;
}
</style>
