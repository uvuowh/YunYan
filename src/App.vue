<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import MainLayout from '@/layouts/MainLayout.vue'

const appStore = useAppStore()

onMounted(() => {
  // Initialize app
  appStore.loadConfig()
})
</script>

<template>
  <div id="app" class="h-screen">
    <MainLayout />
  </div>
</template>

