<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal modal-open" @click="handleBackdropClick">
      <div :class="modalClasses" @click.stop>
        <div v-if="title || $slots.header" class="modal-header mb-4">
          <h3 v-if="title" class="font-bold text-lg">{{ title }}</h3>
          <slot name="header" />
          
          <button
            v-if="closable"
            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            @click="handleClose"
          >
            ✕
          </button>
        </div>
        
        <div class="modal-body">
          <slot />
        </div>
        
        <div v-if="$slots.footer" class="modal-action">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { clsx } from 'clsx'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<Emits>()

const modalClasses = computed(() => {
  return clsx(
    'modal-box relative',
    {
      'max-w-sm': props.size === 'sm',
      'max-w-2xl': props.size === 'md',
      'max-w-4xl': props.size === 'lg',
      'max-w-6xl': props.size === 'xl',
    }
  )
})

function handleClose(): void {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick(): void {
  if (props.closeOnBackdrop) {
    handleClose()
  }
}

// Handle escape key
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && props.closable) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }
  return undefined
})
</script>
