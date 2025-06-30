<template>
  <div class="integration-demo p-6 bg-base-100 rounded-lg border border-base-300">
    <h3 class="text-lg font-semibold mb-4">Module Integration Demo</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- File System Status -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h4 class="card-title text-sm">📄 File System Module</h4>
          <div class="stats stats-vertical">
            <div class="stat">
              <div class="stat-title">Documents</div>
              <div class="stat-value text-lg">{{ fileSystemStore.documentCount }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Current Document</div>
              <div class="stat-desc">{{ currentDocumentName }}</div>
            </div>
          </div>
          
          <div class="card-actions justify-end">
            <button 
              class="btn btn-sm btn-primary"
              @click="createTestDocument"
            >
              Create Test Doc
            </button>
          </div>
        </div>
      </div>
      
      <!-- Whiteboard Status -->
      <div class="card bg-base-200">
        <div class="card-body">
          <h4 class="card-title text-sm">🎨 Whiteboard Module</h4>
          <div class="stats stats-vertical">
            <div class="stat">
              <div class="stat-title">Canvases</div>
              <div class="stat-value text-lg">{{ whiteboardStore.canvasCount }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Current Canvas</div>
              <div class="stat-desc">{{ currentCanvasName }}</div>
            </div>
          </div>
          
          <div class="card-actions justify-end">
            <button 
              class="btn btn-sm btn-primary"
              @click="createTestCanvas"
            >
              Create Test Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Synchronization Status -->
    <div class="mt-6">
      <div class="card bg-base-200">
        <div class="card-body">
          <h4 class="card-title text-sm">🔄 Data Synchronization</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="stat">
              <div class="stat-title">Links</div>
              <div class="stat-value text-lg">{{ syncStore.linkCount }}</div>
              <div class="stat-desc">Document-Node connections</div>
            </div>
            <div class="stat">
              <div class="stat-title">Pending Changes</div>
              <div class="stat-value text-lg">{{ syncStore.syncState.pendingChanges.length }}</div>
              <div class="stat-desc">Waiting for sync</div>
            </div>
            <div class="stat">
              <div class="stat-title">Status</div>
              <div class="stat-value text-sm" :class="syncStatusClass">
                {{ syncStatusText }}
              </div>
            </div>
          </div>
          
          <div class="card-actions justify-between">
            <button 
              class="btn btn-sm btn-secondary"
              @click="createDocumentNodeLink"
              :disabled="!canCreateLink"
            >
              Link Document to Node
            </button>
            <button 
              class="btn btn-sm btn-accent"
              @click="syncStore.forceSync()"
              :disabled="!syncStore.hasPendingChanges"
            >
              Force Sync
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Integration Actions -->
    <div class="mt-6">
      <div class="card bg-base-200">
        <div class="card-body">
          <h4 class="card-title text-sm">🔗 Integration Actions</h4>
          <div class="flex flex-wrap gap-2">
            <button 
              class="btn btn-sm btn-outline"
              @click="demonstrateIntegration"
            >
              Demo Integration
            </button>
            <button 
              class="btn btn-sm btn-outline"
              @click="clearAllData"
            >
              Clear All Data
            </button>
            <button 
              class="btn btn-sm btn-outline"
              @click="exportIntegrationData"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity Log -->
    <div class="mt-6" v-if="activityLog.length > 0">
      <div class="card bg-base-200">
        <div class="card-body">
          <h4 class="card-title text-sm">📋 Recent Activity</h4>
          <div class="max-h-32 overflow-y-auto">
            <div 
              v-for="(activity, index) in activityLog.slice(-5)" 
              :key="index"
              class="text-xs p-2 mb-1 bg-base-100 rounded"
            >
              <span class="font-mono text-base-content/60">{{ formatTime(activity.timestamp) }}</span>
              <span class="ml-2">{{ activity.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFileSystemStore } from '@/stores/filesystem'
import { useWhiteboardStore } from '@/stores/whiteboard'
import { useSyncStore } from '@/stores/sync'
import { useAppStore } from '@/stores/app'

const fileSystemStore = useFileSystemStore()
const whiteboardStore = useWhiteboardStore()
const syncStore = useSyncStore()
const appStore = useAppStore()

// State
const activityLog = ref<Array<{ timestamp: Date; message: string }>>([])

// Computed
const currentDocumentName = computed(() => 
  fileSystemStore.currentDocument?.title || 'None selected'
)

const currentCanvasName = computed(() => 
  whiteboardStore.currentCanvas?.name || 'None selected'
)

const syncStatusText = computed(() => {
  if (!syncStore.isOnline) return 'Offline'
  if (syncStore.syncInProgress) return 'Syncing...'
  if (syncStore.hasPendingChanges) return 'Pending'
  return 'Synced'
})

const syncStatusClass = computed(() => {
  if (!syncStore.isOnline) return 'text-error'
  if (syncStore.syncInProgress) return 'text-warning'
  if (syncStore.hasPendingChanges) return 'text-warning'
  return 'text-success'
})

const canCreateLink = computed(() => 
  fileSystemStore.currentDocument && 
  whiteboardStore.currentCanvas && 
  whiteboardStore.currentNodes.length > 0
)

// Methods
function addActivity(message: string) {
  activityLog.value.push({
    timestamp: new Date(),
    message
  })
}

function createTestDocument() {
  const doc = fileSystemStore.createDocument('Integration Test Document')
  fileSystemStore.updateDocument(doc.id, {
    content: `# Integration Test Document

This document was created to test the integration between the file system and whiteboard modules.

## Features Tested
- Document creation
- Content editing
- Cross-module synchronization

Created at: ${new Date().toISOString()}`
  })
  
  addActivity('Created test document')
}

function createTestCanvas() {
  const canvas = whiteboardStore.createCanvas('Integration Test Canvas')
  
  // Add a test node
  const node = whiteboardStore.createNode(
    'text', 
    { x: 100, y: 100 }, 
    'Integration Test Node'
  )
  
  addActivity('Created test canvas with node')
}

function createDocumentNodeLink() {
  if (!fileSystemStore.currentDocument || !whiteboardStore.currentCanvas) {
    return
  }
  
  const nodes = whiteboardStore.currentNodes
  if (nodes.length === 0) {
    appStore.addError(appStore.createError(
      'LINK_ERROR',
      'No nodes available to link',
      'integration'
    ))
    return
  }
  
  const firstNode = nodes[0]
  const link = syncStore.linkDocumentToNode(
    fileSystemStore.currentDocument.id,
    firstNode.id,
    'reference'
  )
  
  addActivity(`Linked document "${fileSystemStore.currentDocument.title}" to node "${firstNode.content}"`)
  
  appStore.addError(appStore.createError(
    'LINK_SUCCESS',
    'Document linked to whiteboard node',
    'integration'
  ))
}

async function demonstrateIntegration() {
  addActivity('Starting integration demonstration...')
  
  // Create a document
  const doc = fileSystemStore.createDocument('Demo Document')
  fileSystemStore.updateDocument(doc.id, {
    content: '# Demo Document\n\nThis demonstrates the integration between modules.'
  })
  
  // Create a canvas
  const canvas = whiteboardStore.createCanvas('Demo Canvas')
  
  // Create a node
  const node = whiteboardStore.createNode(
    'text',
    { x: 200, y: 150 },
    'Demo Node'
  )
  
  // Link them
  syncStore.linkDocumentToNode(doc.id, node.id, 'bidirectional')
  
  addActivity('Integration demonstration completed')
  
  appStore.addError(appStore.createError(
    'DEMO_SUCCESS',
    'Integration demonstration completed successfully',
    'integration'
  ))
}

function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    // Clear documents
    fileSystemStore.documents.forEach(doc => {
      fileSystemStore.deleteDocument(doc.id)
    })
    
    // Clear canvases
    whiteboardStore.canvases.forEach(canvas => {
      whiteboardStore.deleteCanvas(canvas.id)
    })
    
    // Clear sync data
    syncStore.clearPendingChanges()
    
    addActivity('All data cleared')
    
    appStore.addError(appStore.createError(
      'CLEAR_SUCCESS',
      'All data cleared successfully',
      'integration'
    ))
  }
}

function exportIntegrationData() {
  const data = {
    documents: fileSystemStore.documents,
    canvases: whiteboardStore.canvases,
    links: syncStore.documentNodeLinks,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `yunyan-integration-data-${Date.now()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
  
  addActivity('Integration data exported')
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString()
}
</script>

<style scoped>
.integration-demo {
  @apply max-w-4xl mx-auto;
}

.stat-value {
  @apply text-primary;
}
</style>
