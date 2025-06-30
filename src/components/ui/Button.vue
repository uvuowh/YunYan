<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <slot v-if="!loading"></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'btn-disabled': props.disabled || props.loading,
    'btn-loading': props.loading,
    'btn-full-width': props.fullWidth
  }
])

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  outline: none;
  position: relative;
}

.btn:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Sizes */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--font-size-sm);
  line-height: 1.25;
}

.btn-md {
  padding: 0.5rem 1rem;
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: var(--font-size-lg);
  line-height: 1.75;
}

/* Variants */
.btn-primary {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.btn-secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

.btn-outline {
  background-color: transparent;
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.btn-outline:hover:not(.btn-disabled) {
  background-color: var(--accent-color);
  color: white;
}

.btn-ghost {
  background-color: transparent;
  color: var(--text-primary);
  border-color: transparent;
}

.btn-ghost:hover:not(.btn-disabled) {
  background-color: var(--bg-hover);
}

.btn-danger {
  background-color: var(--error-color);
  color: white;
  border-color: var(--error-color);
}

.btn-danger:hover:not(.btn-disabled) {
  background-color: #dc2626;
  border-color: #dc2626;
}

/* States */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  cursor: wait;
}

.btn-full-width {
  width: 100%;
}

/* Loading Spinner */
.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
