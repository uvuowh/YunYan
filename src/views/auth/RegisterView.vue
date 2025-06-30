<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold">Create your account</h2>
      <p class="text-base-content/70 mt-2">
        Join us today! Please fill in your details.
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput
        v-model="form.name"
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        required
        :error="errors.name"
        autocomplete="name"
      />

      <BaseInput
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        required
        :error="errors.email"
        autocomplete="email"
      />

      <BaseInput
        v-model="form.password"
        label="Password"
        type="password"
        placeholder="Create a password"
        required
        :error="errors.password"
        autocomplete="new-password"
        :hint="passwordHint"
      />

      <BaseInput
        v-model="form.confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        required
        :error="errors.confirmPassword"
        autocomplete="new-password"
      />

      <div class="form-control">
        <label class="label cursor-pointer justify-start">
          <input
            v-model="form.acceptTerms"
            type="checkbox"
            class="checkbox checkbox-primary checkbox-sm"
            required
          />
          <span class="label-text ml-2">
            I agree to the
            <a href="#" class="link link-primary">Terms of Service</a>
            and
            <a href="#" class="link link-primary">Privacy Policy</a>
          </span>
        </label>
        <div v-if="errors.acceptTerms" class="text-error text-sm mt-1">
          {{ errors.acceptTerms }}
        </div>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="isLoading"
        :disabled="!isFormValid"
      >
        Create Account
      </BaseButton>
    </form>

    <div class="divider">OR</div>

    <div class="space-y-3">
      <BaseButton
        variant="outline"
        size="lg"
        block
        @click="handleSocialLogin('google')"
      >
        <template #icon-left>
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </template>
        Sign up with Google
      </BaseButton>

      <BaseButton
        variant="outline"
        size="lg"
        block
        @click="handleSocialLogin('github')"
      >
        <template #icon-left>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </template>
        Sign up with GitHub
      </BaseButton>
    </div>

    <div class="text-center mt-6">
      <p class="text-sm text-base-content/70">
        Already have an account?
        <router-link to="/login" class="link link-primary">
          Sign in
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useUserStore, useAppStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  acceptTerms?: string
}

const form = reactive<RegisterForm>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const errors = reactive<FormErrors>({})
const isLoading = computed(() => userStore.isLoading)

const passwordHint = computed(() => {
  if (form.password.length === 0) return 'At least 8 characters with uppercase, lowercase, and number'
  if (form.password.length < 8) return 'Password too short'
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) return 'Include uppercase, lowercase, and number'
  return 'Strong password!'
})

const isFormValid = computed(() => {
  return form.name.length > 0 && 
         form.email.length > 0 && 
         form.password.length > 0 && 
         form.confirmPassword.length > 0 &&
         form.acceptTerms &&
         Object.keys(errors).length === 0
})

function validateForm(): boolean {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors])

  // Name validation
  if (!form.name.trim()) {
    errors.name = 'Full name is required'
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Password must contain uppercase, lowercase, and number'
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  // Terms validation
  if (!form.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions'
  }

  return Object.keys(errors).length === 0
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    return
  }

  try {
    // TODO: Implement actual registration logic
    appStore.setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    appStore.showSuccess('Account created!', 'Welcome to YunYan! Please sign in to continue.')
    await router.push('/login')
  } catch (error) {
    console.error('Registration error:', error)
    appStore.showError('Registration failed', 'An unexpected error occurred')
  } finally {
    appStore.setLoading(false)
  }
}

function handleSocialLogin(provider: 'google' | 'github'): void {
  appStore.showInfo(
    'Social Registration', 
    `${provider.charAt(0).toUpperCase() + provider.slice(1)} registration will be available soon!`
  )
}
</script>
