<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary">404</h1>
        <div class="text-6xl mb-4">🔍</div>
        <h2 class="text-3xl font-bold mb-4">Page Not Found</h2>
        <p class="text-lg text-base-content/70 mb-8 max-w-md">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      <div class="space-x-4">
        <BaseButton variant="primary" size="lg" @click="goHome">
          <template #icon-left>🏠</template>
          Go Home
        </BaseButton>
        <BaseButton variant="outline" size="lg" @click="goBack">
          <template #icon-left">⬅️</template>
          Go Back
        </BaseButton>
      </div>

      <div class="mt-12">
        <p class="text-sm text-base-content/50">
          If you think this is an error, please 
          <a href="#" class="link link-primary">contact support</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()

function goHome(): void {
  router.push('/')
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
