<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
      <span v-if="required" class="label-text-alt text-error">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        :value="modelValue"
        :class="inputClasses"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
      
      <div v-if="$slots.suffix" class="absolute inset-y-0 right-0 flex items-center pr-3">
        <slot name="suffix" />
      </div>
    </div>
    
    <label v-if="error || hint" class="label">
      <span v-if="error" class="label-text-alt text-error">{{ error }}</span>
      <span v-else-if="hint" class="label-text-alt">{{ hint }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { clsx } from 'clsx'

interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'bordered' | 'ghost'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
  autocomplete?: string
}

interface Emits {
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  input: [event: Event]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  variant: 'bordered',
  disabled: false,
  readonly: false,
  required: false,
})

const emit = defineEmits<Emits>()

const isFocused = ref(false)
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  return clsx(
    'input w-full',
    {
      // Variants
      'input-bordered': props.variant === 'bordered',
      'input-ghost': props.variant === 'ghost',
      
      // Sizes
      'input-xs': props.size === 'xs',
      'input-sm': props.size === 'sm',
      'input-md': props.size === 'md',
      'input-lg': props.size === 'lg',
      
      // States
      'input-error': props.error,
      'input-disabled': props.disabled,
      'focus:input-primary': isFocused.value && !props.error,
    }
  )
})

function handleBlur(event: FocusEvent): void {
  isFocused.value = false
  emit('blur', event)
}

function handleFocus(event: FocusEvent): void {
  isFocused.value = true
  emit('focus', event)
}

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
  emit('input', event)
}
</script>
