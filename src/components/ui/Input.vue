<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="input-container">
      <div v-if="$slots.prefix || prefixIcon" class="input-prefix">
        <component v-if="prefixIcon" :is="prefixIcon" class="input-icon" />
        <slot name="prefix" />
      </div>
      
      <input
        :id="inputId"
        ref="inputRef"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      />
      
      <div v-if="$slots.suffix || suffixIcon || clearable" class="input-suffix">
        <button
          v-if="clearable && modelValue"
          type="button"
          class="input-clear"
          @click="handleClear"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        
        <component v-if="suffixIcon" :is="suffixIcon" class="input-icon" />
        <slot name="suffix" />
      </div>
    </div>
    
    <div v-if="error || hint" class="input-message">
      <span v-if="error" class="input-error">{{ error }}</span>
      <span v-else-if="hint" class="input-hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'

export interface InputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  prefixIcon?: Component
  suffixIcon?: Component
  clearable?: boolean
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md',
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
  clear: []
}>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

// Generate unique ID for accessibility
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  const baseClasses = [
    'input-field',
    'w-full',
    'border',
    'rounded-md',
    'transition-colors',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'readonly:bg-gray-50',
  ]

  // Size classes
  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-3', 'py-2', 'text-sm'],
    lg: ['px-4', 'py-3', 'text-base'],
  }

  // State classes
  const stateClasses = []
  if (props.error) {
    stateClasses.push(
      'border-red-300',
      'focus:border-red-500',
      'focus:ring-red-500'
    )
  } else {
    stateClasses.push(
      'border-gray-300',
      'focus:border-blue-500',
      'focus:ring-blue-500'
    )
  }

  // Prefix/suffix padding adjustments
  if (props.prefixIcon || props.$slots?.prefix) {
    stateClasses.push('pl-10')
  }
  if (props.suffixIcon || props.$slots?.suffix || props.clearable) {
    stateClasses.push('pr-10')
  }

  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...stateClasses,
  ]
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  if (props.type === 'number') {
    value = target.valueAsNumber || 0
  }

  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<style scoped>
.input-wrapper {
  @apply space-y-1;
}

.input-label {
  @apply block text-sm font-medium text-gray-700;
}

.input-container {
  @apply relative;
}

.input-field {
  @apply bg-white text-gray-900;
}

.input-prefix,
.input-suffix {
  @apply absolute inset-y-0 flex items-center px-3 pointer-events-none;
}

.input-prefix {
  @apply left-0;
}

.input-suffix {
  @apply right-0;
}

.input-icon {
  @apply w-4 h-4 text-gray-400;
}

.input-clear {
  @apply pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors;
}

.input-message {
  @apply text-sm;
}

.input-error {
  @apply text-red-600;
}

.input-hint {
  @apply text-gray-500;
}

/* Dark mode styles */
[data-theme="dark"] .input-label {
  @apply text-gray-300;
}

[data-theme="dark"] .input-field {
  @apply bg-gray-800 text-gray-100 border-gray-600;
}

[data-theme="dark"] .input-field:focus {
  @apply border-blue-400 ring-blue-400;
}

[data-theme="dark"] .input-field.readonly {
  @apply bg-gray-700;
}

[data-theme="dark"] .input-icon {
  @apply text-gray-500;
}

[data-theme="dark"] .input-clear {
  @apply text-gray-500 hover:text-gray-300;
}

[data-theme="dark"] .input-hint {
  @apply text-gray-400;
}

[data-theme="dark"] .input-error {
  @apply text-red-400;
}
</style>
