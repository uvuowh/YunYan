import { ref, computed, Ref } from 'vue'
import type { ValidationRule, FormErrors } from '@/types'

/**
 * Form validation composable
 */
export function useValidation<T extends Record<string, any>>(
  formData: Ref<T>,
  rules: Record<keyof T, ValidationRule[]>
) {
  const errors = ref<FormErrors>({})

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  function validateField(field: keyof T): boolean {
    const fieldRules = rules[field] || []
    const value = formData.value[field]
    
    for (const rule of fieldRules) {
      if (!validateRule(value, rule)) {
        errors.value[field as string] = rule.message
        return false
      }
    }
    
    delete errors.value[field as string]
    return true
  }

  function validateAll(): boolean {
    errors.value = {}
    
    for (const field in rules) {
      validateField(field)
    }
    
    return isValid.value
  }

  function validateRule(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return value !== null && value !== undefined && value !== ''
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !value || emailRegex.test(value)
      
      case 'minLength':
        return !value || value.length >= rule.value
      
      case 'maxLength':
        return !value || value.length <= rule.value
      
      case 'pattern':
        return !value || new RegExp(rule.value).test(value)
      
      case 'custom':
        return !rule.validator || rule.validator(value)
      
      default:
        return true
    }
  }

  function clearErrors(): void {
    errors.value = {}
  }

  function setError(field: keyof T, message: string): void {
    errors.value[field as string] = message
  }

  return {
    errors,
    isValid,
    validateField,
    validateAll,
    clearErrors,
    setError,
  }
}
