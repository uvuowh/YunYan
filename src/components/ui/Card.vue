<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-body">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CardProps {
  title?: string
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false,
})

const cardClasses = computed(() => {
  const baseClasses = [
    'card',
    'bg-white',
    'rounded-lg',
    'transition-all',
    'duration-200',
  ]

  // Variant classes
  const variantClasses = {
    default: ['border', 'border-gray-200'],
    outlined: ['border-2', 'border-gray-300'],
    elevated: ['shadow-lg', 'border', 'border-gray-100'],
  }

  // Padding classes
  const paddingClasses = {
    none: [],
    sm: ['p-3'],
    md: ['p-4'],
    lg: ['p-6'],
  }

  const classes = [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...paddingClasses[props.padding],
  ]

  if (props.hoverable) {
    classes.push('hover:shadow-md', 'cursor-pointer')
  }

  return classes
})
</script>

<style scoped>
.card-header {
  @apply border-b border-gray-200 pb-3 mb-4;
}

.card-title {
  @apply text-lg font-semibold text-gray-900;
}

.card-body {
  @apply text-gray-700;
}

.card-footer {
  @apply border-t border-gray-200 pt-3 mt-4;
}

/* Dark mode styles */
[data-theme="dark"] .card {
  @apply bg-gray-800 border-gray-700;
}

[data-theme="dark"] .card-header {
  @apply border-gray-700;
}

[data-theme="dark"] .card-title {
  @apply text-gray-100;
}

[data-theme="dark"] .card-body {
  @apply text-gray-300;
}

[data-theme="dark"] .card-footer {
  @apply border-gray-700;
}

[data-theme="dark"] .card.elevated {
  @apply shadow-2xl border-gray-600;
}
</style>
