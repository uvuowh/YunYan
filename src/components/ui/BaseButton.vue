<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
    <slot name="icon-left" />
    <span v-if="$slots.default" :class="{ 'ml-2': $slots['icon-left'], 'mr-2': $slots['icon-right'] }">
      <slot />
    </span>
    <slot name="icon-right" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { clsx } from 'clsx'

interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'outline' | 'error'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  circle?: boolean
  square?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  block: false,
  circle: false,
  square: false,
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => {
  return clsx(
    'btn',
    {
      // Variants
      'btn-primary': props.variant === 'primary',
      'btn-secondary': props.variant === 'secondary',
      'btn-accent': props.variant === 'accent',
      'btn-ghost': props.variant === 'ghost',
      'btn-link': props.variant === 'link',
      'btn-outline': props.variant === 'outline',
      'btn-error': props.variant === 'error',
      
      // Sizes
      'btn-xs': props.size === 'xs',
      'btn-sm': props.size === 'sm',
      'btn-md': props.size === 'md',
      'btn-lg': props.size === 'lg',
      
      // Modifiers
      'btn-block': props.block,
      'btn-circle': props.circle,
      'btn-square': props.square,
      'btn-disabled': props.disabled,
    }
  )
})

function handleClick(event: MouseEvent): void {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>
