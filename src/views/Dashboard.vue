<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Welcome to your YunYan dashboard</p>
    </div>

    <div class="dashboard-grid">
      <Card title="System Information" class="system-info">
        <div v-if="systemInfo" class="info-grid">
          <div class="info-item">
            <span class="info-label">Operating System:</span>
            <span class="info-value">{{ systemInfo.os }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Architecture:</span>
            <span class="info-value">{{ systemInfo.arch }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Hostname:</span>
            <span class="info-value">{{ systemInfo.hostname }}</span>
          </div>
        </div>
        <div v-else class="loading">
          Loading system information...
        </div>
      </Card>

      <Card title="Application Info" class="app-info">
        <div v-if="appVersion" class="info-grid">
          <div class="info-item">
            <span class="info-label">Version:</span>
            <span class="info-value">{{ appVersion.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Build:</span>
            <span class="info-value">{{ appVersion.build }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Mode:</span>
            <span class="info-value">{{ isDev ? 'Development' : 'Production' }}</span>
          </div>
        </div>
      </Card>

      <Card title="Quick Actions" class="quick-actions">
        <div class="actions-grid">
          <Button @click="handleCreateFile" variant="primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Create File
          </Button>
          
          <Button @click="handleOpenFiles" variant="outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
            </svg>
            Browse Files
          </Button>
          
          <Button @click="handleSettings" variant="ghost">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
            Settings
          </Button>
        </div>
      </Card>

      <Card title="Recent Activity" class="recent-activity">
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-title">Created new document</div>
              <div class="activity-time">2 minutes ago</div>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3M19,19H5V5H16V8H19V19Z"/>
              </svg>
            </div>
            <div class="activity-content">
              <div class="activity-title">Updated settings</div>
              <div class="activity-time">1 hour ago</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Card, Button } from '@/components/ui'
import { useAppStore } from '@/core/stores/app'

const router = useRouter()
const appStore = useAppStore()

// Computed properties
const systemInfo = computed(() => appStore.systemInfo)
const appVersion = computed(() => appStore.appVersion)
const isDev = computed(() => appStore.isDev)

// Action handlers
const handleCreateFile = () => {
  console.log('Create file action')
  // In a real app, this would open a file creation dialog
}

const handleOpenFiles = () => {
  router.push('/files')
}

const handleSettings = () => {
  router.push('/settings')
}

// Initialize data on mount
onMounted(async () => {
  if (!systemInfo.value || !appVersion.value) {
    await appStore.fetchSystemInfo()
  }
})
</script>

<style scoped>
.dashboard {
  @apply space-y-6;
}

.dashboard-header h1 {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.dashboard-header p {
  @apply text-gray-600;
}

.dashboard-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.system-info,
.app-info {
  @apply md:col-span-1;
}

.quick-actions,
.recent-activity {
  @apply md:col-span-1;
}

.info-grid {
  @apply space-y-3;
}

.info-item {
  @apply flex justify-between items-center;
}

.info-label {
  @apply font-medium text-gray-700;
}

.info-value {
  @apply text-gray-900 font-mono text-sm;
}

.loading {
  @apply text-gray-500 italic;
}

.actions-grid {
  @apply grid grid-cols-1 gap-3;
}

.activity-list {
  @apply space-y-4;
}

.activity-item {
  @apply flex items-start space-x-3;
}

.activity-icon {
  @apply flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center;
}

.activity-icon svg {
  @apply text-blue-600;
}

.activity-content {
  @apply flex-1 min-w-0;
}

.activity-title {
  @apply text-sm font-medium text-gray-900;
}

.activity-time {
  @apply text-xs text-gray-500;
}

/* Dark mode styles */
[data-theme="dark"] .dashboard-header h1 {
  @apply text-gray-100;
}

[data-theme="dark"] .dashboard-header p {
  @apply text-gray-400;
}

[data-theme="dark"] .info-label {
  @apply text-gray-300;
}

[data-theme="dark"] .info-value {
  @apply text-gray-100;
}

[data-theme="dark"] .loading {
  @apply text-gray-400;
}

[data-theme="dark"] .activity-icon {
  @apply bg-blue-900;
}

[data-theme="dark"] .activity-icon svg {
  @apply text-blue-400;
}

[data-theme="dark"] .activity-title {
  @apply text-gray-100;
}

[data-theme="dark"] .activity-time {
  @apply text-gray-400;
}
</style>
