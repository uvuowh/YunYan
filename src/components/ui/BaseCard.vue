<template>
  <div :class="cardClasses" @click="handleClick">
    <figure v-if="$slots.image" class="card-image">
      <slot name="image" />
    </figure>
    
    <div class="card-body">
      <h2 v-if="title || $slots.title" class="card-title">
        <slot name="title">{{ title }}</slot>
      </h2>
      
      <p v-if="description || $slots.description" class="text-base-content/70">
        <slot name="description">{{ description }}</slot>
      </p>
      
      <div v-if="$slots.default" class="flex-1">
        <slot />
      </div>
      
      <div v-if="$slots.actions" class="card-actions justify-end mt-4">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { clsx } from 'clsx'

interface Props {
  title?: string
  description?: string
  variant?: 'default' | 'bordered' | 'compact' | 'side'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hoverable?: boolean
  clickable?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  shadow: 'md',
  hoverable: false,
  clickable: false,
})

const emit = defineEmits<Emits>()

const cardClasses = computed(() => {
  return clsx(
    'card bg-base-100',
    {
      // Variants
      'card-bordered': props.variant === 'bordered',
      'card-compact': props.variant === 'compact',
      'card-side': props.variant === 'side',
      
      // Shadows
      'shadow-sm': props.shadow === 'sm',
      'shadow-md': props.shadow === 'md',
      'shadow-lg': props.shadow === 'lg',
      'shadow-xl': props.shadow === 'xl',
      
      // Interactive states
      'hover:shadow-lg transition-shadow duration-300': props.hoverable,
      'cursor-pointer': props.clickable,
    }
  )
})

function handleClick(event: MouseEvent): void {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>
