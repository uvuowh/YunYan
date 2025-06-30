<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-base-content mb-2">
          {{ appName }}
        </h1>
        <p class="text-base-content/70">
          {{ subtitle }}
        </p>
      </div>
      
      <BaseCard variant="bordered" shadow="xl" class="bg-base-100">
        <slot />
      </BaseCard>
      
      <div class="text-center mt-6">
        <slot name="footer" />
      </div>
    </div>
    
    <!-- Background decoration -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-40 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-32 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'

interface Props {
  appName?: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  appName: 'YunYan',
  subtitle: 'Welcome back',
})
</script>
