<template>
  <div class="main-layout h-full flex flex-col">
    <!-- Top Navigation -->
    <nav class="navbar bg-base-200 border-b border-base-300 px-4">
      <div class="navbar-start">
        <button 
          class="btn btn-ghost btn-sm"
          @click="appStore.toggleSidebar()"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 class="text-xl font-bold ml-2">YunYan</h1>
      </div>
      
      <div class="navbar-center">
        <div class="tabs tabs-boxed">
          <button
            class="tab"
            :class="{ 'tab-active': appStore.currentView === 'filesystem' }"
            @click="appStore.setCurrentView('filesystem')"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Documents
          </button>
          <button
            class="tab"
            :class="{ 'tab-active': appStore.currentView === 'whiteboard' }"
            @click="appStore.setCurrentView('whiteboard')"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            Whiteboard
          </button>
          <button
            class="tab"
            :class="{ 'tab-active': appStore.currentView === 'integration' }"
            @click="appStore.setCurrentView('integration')"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Integration
          </button>
        </div>
      </div>
      
      <div class="navbar-end">
        <div class="flex items-center gap-2">
          <!-- Sync Status -->
          <div class="tooltip" :data-tip="syncStatus">
            <div 
              class="w-3 h-3 rounded-full"
              :class="syncStatusClass"
            ></div>
          </div>
          
          <!-- Theme Toggle -->
          <button 
            class="btn btn-ghost btn-sm"
            @click="appStore.toggleTheme()"
          >
            <svg v-if="appStore.isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <!-- Settings -->
          <div class="dropdown dropdown-end">
            <button class="btn btn-ghost btn-sm" tabindex="0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a @click="openSettings">Settings</a></li>
              <li><a @click="openAbout">About</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside
        v-if="!appStore.sidebarCollapsed && appStore.currentView !== 'integration'"
        class="sidebar transition-all duration-300"
        :class="{ 'w-0': appStore.sidebarCollapsed }"
      >
        <DocumentList v-if="appStore.currentView === 'filesystem'" />
        <CanvasList v-else-if="appStore.currentView === 'whiteboard'" />
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden">
        <!-- File System View -->
        <DocumentEditor v-if="appStore.currentView === 'filesystem'" />

        <!-- Whiteboard View -->
        <WhiteboardCanvas v-else-if="appStore.currentView === 'whiteboard'" />

        <!-- Integration Demo View -->
        <div v-else-if="appStore.currentView === 'integration'" class="h-full overflow-y-auto p-6">
          <IntegrationDemo />
        </div>

        <!-- Default/Loading View -->
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-center">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-base-content/60">Loading...</p>
          </div>
        </div>
      </main>
    </div>

    <!-- Error Toast -->
    <div v-if="appStore.hasErrors" class="toast toast-top toast-end">
      <div 
        v-for="error in appStore.errors" 
        :key="error.code"
        class="alert"
        :class="getErrorClass(error.code)"
      >
        <div>
          <span>{{ error.message }}</span>
          <button 
            class="btn btn-sm btn-ghost ml-2"
            @click="appStore.removeError(error.code)"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="appStore.loading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-base-100 rounded-lg p-6 flex items-center gap-4">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useSyncStore } from '@/stores/sync'
import DocumentList from '@/components/filesystem/DocumentList.vue'
import DocumentEditor from '@/components/filesystem/DocumentEditor.vue'
import CanvasList from '@/components/whiteboard/CanvasList.vue'
import WhiteboardCanvas from '@/components/whiteboard/WhiteboardCanvas.vue'
import IntegrationDemo from '@/components/shared/IntegrationDemo.vue'

const appStore = useAppStore()
const syncStore = useSyncStore()

// Computed
const syncStatus = computed(() => {
  if (!syncStore.isOnline) return 'Offline'
  if (syncStore.syncInProgress) return 'Syncing...'
  if (syncStore.hasPendingChanges) return 'Changes pending'
  return 'All changes saved'
})

const syncStatusClass = computed(() => {
  if (!syncStore.isOnline) return 'bg-error'
  if (syncStore.syncInProgress) return 'bg-warning animate-pulse'
  if (syncStore.hasPendingChanges) return 'bg-warning'
  return 'bg-success'
})

// Methods
function getErrorClass(errorCode: string): string {
  if (errorCode.includes('SUCCESS')) return 'alert-success'
  if (errorCode.includes('WARNING')) return 'alert-warning'
  return 'alert-error'
}

function openSettings() {
  // TODO: Implement settings modal
  console.log('Open settings')
}

function openAbout() {
  // TODO: Implement about modal
  console.log('Open about')
}
</script>

<style scoped>
.main-layout {
  @apply bg-base-100;
}

.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-primary;
}

.toast {
  @apply z-50;
}

.sidebar {
  @apply border-r border-base-300;
}
</style>
