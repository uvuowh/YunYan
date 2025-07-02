<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner">
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray="32"
          stroke-dashoffset="32"
        >
          <animate
            attributeName="stroke-dasharray"
            dur="2s"
            values="0 32;16 16;0 32;0 32"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dashoffset"
            dur="2s"
            values="0;-16;-32;-32"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </span>
    
    <span v-if="icon && !loading" :class="iconClasses">
      <component :is="icon" />
    </span>
    
    <span v-if="$slots.default" :class="textClasses">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: Component
  iconPosition?: 'left' | 'right'
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  iconPosition: 'left',
  type: 'button',
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = [
    'btn',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ]

  // Variant classes
  const variantClasses = {
    primary: [
      'bg-blue-600',
      'text-white',
      'hover:bg-blue-700',
      'focus:ring-blue-500',
    ],
    secondary: [
      'bg-gray-600',
      'text-white',
      'hover:bg-gray-700',
      'focus:ring-gray-500',
    ],
    outline: [
      'border',
      'border-gray-300',
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-50',
      'focus:ring-gray-500',
    ],
    ghost: [
      'bg-transparent',
      'text-gray-700',
      'hover:bg-gray-100',
      'focus:ring-gray-500',
    ],
    danger: [
      'bg-red-600',
      'text-white',
      'hover:bg-red-700',
      'focus:ring-red-500',
    ],
  }

  // Size classes
  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm', 'rounded'],
    md: ['px-4', 'py-2', 'text-sm', 'rounded-md'],
    lg: ['px-6', 'py-3', 'text-base', 'rounded-lg'],
  }

  const classes = [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...sizeClasses[props.size],
  ]

  if (props.block) {
    classes.push('w-full')
  }

  return classes
})

const iconClasses = computed(() => {
  const classes = ['flex-shrink-0']
  
  if (props.iconPosition === 'right') {
    classes.push('ml-2', 'order-2')
  } else {
    classes.push('mr-2')
  }

  return classes
})

const textClasses = computed(() => {
  const classes = []
  
  if (props.iconPosition === 'right') {
    classes.push('order-1')
  }

  return classes
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  position: relative;
}

.btn-spinner {
  display: inline-flex;
  align-items: center;
  margin-right: 0.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode styles */
[data-theme="dark"] .btn {
  --tw-ring-offset-color: #1f2937;
}

[data-theme="dark"] .btn.outline {
  border-color: #4b5563;
  color: #d1d5db;
}

[data-theme="dark"] .btn.outline:hover {
  background-color: #374151;
}

[data-theme="dark"] .btn.ghost {
  color: #d1d5db;
}

[data-theme="dark"] .btn.ghost:hover {
  background-color: #374151;
}
</style>
