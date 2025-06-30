<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-container" :class="{ 'has-error': error }">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <div v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    
    <div v-if="error || hint" class="input-message">
      <span v-if="error" class="error-message">{{ error }}</span>
      <span v-else-if="hint" class="hint-message">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
}

interface Emits {
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<Emits>()

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => [
  'input',
  `input-${props.size}`,
  {
    'input-disabled': props.disabled,
    'input-readonly': props.readonly,
    'input-error': props.error
  }
])

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.input-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.required-mark {
  color: var(--error-color);
  margin-left: 0.125rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  outline: none;
}

.input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.input:hover:not(.input-disabled):not(.input-readonly) {
  border-color: var(--border-hover);
}

/* Sizes */
.input-sm {
  padding: 0.375rem 0.75rem;
  font-size: var(--font-size-sm);
  line-height: 1.25;
}

.input-md {
  padding: 0.5rem 0.75rem;
  font-size: var(--font-size-base);
  line-height: 1.5;
}

.input-lg {
  padding: 0.75rem 1rem;
  font-size: var(--font-size-lg);
  line-height: 1.75;
}

/* States */
.input-disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.input-readonly {
  background-color: var(--bg-secondary);
  cursor: default;
}

.input-error {
  border-color: var(--error-color);
}

.input-error:focus {
  border-color: var(--error-color);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.has-error .input {
  border-color: var(--error-color);
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.input-suffix > * {
  pointer-events: auto;
}

.input-message {
  font-size: var(--font-size-sm);
  line-height: 1.25;
}

.error-message {
  color: var(--error-color);
}

.hint-message {
  color: var(--text-secondary);
}

/* Placeholder */
.input::placeholder {
  color: var(--text-tertiary);
}
</style>
