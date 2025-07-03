<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { AppHeader, Sidebar } from '@/components/layout'
import { useAppStore } from '@/core/stores/app'

const appStore = useAppStore()

// Computed properties
const isReady = computed(() => appStore.isReady)
const hasError = computed(() => appStore.hasError)
const error = computed(() => appStore.error)

// Initialize app on mount
onMounted(async () => {
  if (!appStore.isInitialized) {
    await appStore.initialize()
  }
})
</script>

<template>
  <div class="app-layout">
    <!-- Loading state -->
    <div v-if="!isReady" class="loading-screen">
      <div class="loading-content">
        <div class="loading-spinner">
          <svg class="animate-spin" width="32" height="32" viewBox="0 0 24 24">
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
        </div>
        <p>Loading YunYan...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="hasError" class="error-screen">
      <div class="error-content">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        </div>
        <h2>Something went wrong</h2>
        <p>{{ error }}</p>
        <button @click="appStore.initialize()" class="retry-button">
          Try Again
        </button>
      </div>
    </div>

    <!-- Main app layout -->
    <template v-else>
      <AppHeader class="app-header-grid" />
      <div class="main-content">
        <!-- Mobile sidebar overlay -->
        <div
          v-if="!appStore.sidebarCollapsed"
          class="sidebar-overlay"
          @click="appStore.toggleSidebar()"
        ></div>
        <Sidebar />
        <main class="content-area">
          <router-view />
        </main>
      </div>
    </template>
  </div>
</template>

<style scoped>
.loading-screen,
.error-screen {
  @apply min-h-screen flex items-center justify-center bg-gray-50;
}

.loading-content,
.error-content {
  @apply text-center space-y-4;
}

.loading-spinner {
  @apply flex justify-center text-blue-600;
}

.loading-content p {
  @apply text-gray-600 text-lg;
}

.error-icon {
  @apply flex justify-center text-red-600;
}

.error-content h2 {
  @apply text-xl font-semibold text-gray-900;
}

.error-content p {
  @apply text-gray-600;
}

.retry-button {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors;
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

.app-layout {
  @apply min-h-screen bg-gray-50;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    'header'
    'main';
}

.main-content {
  @apply flex;
  grid-area: main;
  min-height: calc(100vh - 64px);
  overflow: hidden;
}

.content-area {
  @apply flex-1;
  padding: 0;
  overflow: hidden;
  background-color: var(--color-background);
}

.app-header-grid {
  grid-area: header;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 30;
  backdrop-filter: blur(4px);
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
  }

  .content-area {
    padding: var(--spacing-4);
  }
}

/* Dark mode styles */
[data-theme='dark'] .loading-screen,
[data-theme='dark'] .error-screen {
  @apply bg-gray-900;
}

[data-theme='dark'] .loading-content p {
  @apply text-gray-400;
}

[data-theme='dark'] .error-content h2 {
  @apply text-gray-100;
}

[data-theme='dark'] .error-content p {
  @apply text-gray-400;
}
</style>
