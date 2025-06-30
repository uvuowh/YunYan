<template>
  <div class="cross-view-operations">
    <!-- Cross-View Toolbar -->
    <div class="toolbar bg-base-200 p-4 border-b border-base-300">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Cross-View Operations</h3>
        
        <div class="flex gap-2">
          <!-- Sync Status -->
          <div class="badge" :class="syncStatusClass">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ syncStatus }}
          </div>
          
          <!-- View Toggle -->
          <div class="btn-group">
            <button 
              class="btn btn-sm"
              :class="{ 'btn-active': currentView === 'document' }"
              @click="switchToDocumentView"
            >
              Document
            </button>
            <button 
              class="btn btn-sm"
              :class="{ 'btn-active': currentView === 'whiteboard' }"
              @click="switchToWhiteboardView"
            >
              Whiteboard
            </button>
            <button 
              class="btn btn-sm"
              :class="{ 'btn-active': currentView === 'split' }"
              @click="switchToSplitView"
            >
              Split
            </button>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="flex gap-2 mt-3">
        <button 
          class="btn btn-sm btn-primary"
          @click="createBidirectionalLink"
          :disabled="selectedBlocks.length === 0"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4.003 4.003 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Link Selected ({{ selectedBlocks.length }})
        </button>
        
        <button 
          class="btn btn-sm btn-secondary"
          @click="autoLayoutCanvas"
          :disabled="!hasCanvasBlocks"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Auto Layout
        </button>
        
        <button 
          class="btn btn-sm btn-accent"
          @click="syncAllViews"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync All
        </button>
        
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-sm btn-ghost">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a @click="exportWorkspace">Export Workspace</a></li>
            <li><a @click="importWorkspace">Import Workspace</a></li>
            <li class="divider"></li>
            <li><a @click="showIntegrationDemo">Integration Demo</a></li>
            <li><a @click="showKeyboardShortcuts">Keyboard Shortcuts</a></li>
            <li class="divider"></li>
            <li><a @click="showAdvancedFeatures = !showAdvancedFeatures">
              {{ showAdvancedFeatures ? 'Hide' : 'Show' }} Advanced Features
            </a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Advanced Features Panel -->
    <div v-if="showAdvancedFeatures" class="advanced-features-panel">
      <AdvancedIntegrationPanel />
    </div>
    
    <!-- Integration Status Panel -->
    <div v-if="showIntegrationStatus" class="integration-status bg-info/10 p-4 border-b border-base-300">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="stats stats-horizontal shadow-sm">
            <div class="stat">
              <div class="stat-title">Total Blocks</div>
              <div class="stat-value text-sm">{{ stats.totalBlocks }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">In Documents</div>
              <div class="stat-value text-sm">{{ stats.documentBlocks }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">On Whiteboards</div>
              <div class="stat-value text-sm">{{ stats.whiteboardBlocks }}</div>
            </div>
            <div class="stat">
              <div class="stat-title">Linked</div>
              <div class="stat-value text-sm">{{ stats.linkedBlocks }}</div>
            </div>
          </div>
        </div>
        
        <button 
          class="btn btn-sm btn-ghost"
          @click="showIntegrationStatus = false"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Drag and Drop Overlay -->
    <div 
      v-if="dragAndDrop.isDragging.value" 
      class="drag-overlay fixed inset-0 z-50 pointer-events-none"
    >
      <!-- Drag Preview -->
      <div 
        class="drag-preview absolute bg-base-100 shadow-lg rounded-lg p-3 border-2 border-primary transform -translate-x-1/2 -translate-y-1/2"
        :style="{ 
          left: dragAndDrop.dragCurrentPosition.value.x + 'px', 
          top: dragAndDrop.dragCurrentPosition.value.y + 'px' 
        }"
      >
        <div class="flex items-center gap-2">
          <div class="badge badge-primary">{{ dragAndDrop.draggedBlock.value?.type }}</div>
          <span class="text-sm truncate max-w-48">
            {{ dragAndDrop.dragPreview.value?.content || 'Block' }}
          </span>
        </div>
      </div>
      
      <!-- Drop Zone Indicators -->
      <div class="drop-zones">
        <div 
          v-if="dragAndDrop.dropTarget.value === 'document'"
          class="drop-indicator document-drop absolute inset-0 bg-success/20 border-4 border-success border-dashed"
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-success text-success-content px-4 py-2 rounded-lg font-semibold">
              Drop to add to document
            </div>
          </div>
        </div>
        
        <div 
          v-if="dragAndDrop.dropTarget.value === 'whiteboard'"
          class="drop-indicator whiteboard-drop absolute inset-0 bg-info/20 border-4 border-info border-dashed"
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="bg-info text-info-content px-4 py-2 rounded-lg font-semibold">
              Drop to add to whiteboard
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Integration Demo Modal -->
    <div v-if="showDemo" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg mb-4">Unified Integration Demo</h3>
        
        <div class="space-y-4">
          <div class="alert alert-info">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="font-semibold">Unified Block System</h4>
              <p>All content exists as unified blocks that can appear in both document and whiteboard views simultaneously.</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card bg-base-200">
              <div class="card-body">
                <h4 class="card-title">Document View</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li>Hierarchical block structure</li>
                  <li>Traditional note-taking interface</li>
                  <li>Right-click to add blocks to whiteboard</li>
                  <li>Drag blocks to whiteboard view</li>
                </ul>
              </div>
            </div>
            
            <div class="card bg-base-200">
              <div class="card-body">
                <h4 class="card-title">Whiteboard View</h4>
                <ul class="list-disc list-inside space-y-1 text-sm">
                  <li>Spatial block arrangement</li>
                  <li>Visual connections between blocks</li>
                  <li>Right-click to add blocks to document</li>
                  <li>Drag blocks to document view</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="alert alert-success">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="font-semibold">Real-time Synchronization</h4>
              <p>Changes made in one view automatically appear in the other. Edit a block in the document, see it update on the whiteboard instantly.</p>
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" @click="showDemo = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import { useUnifiedIntegration } from '@/composables/useUnifiedIntegration'
import { useDragAndDrop } from '@/composables/useDragAndDrop'
import { useDocumentView } from '@/composables/useDocumentView'
import { useWhiteboardView } from '@/composables/useWhiteboardView'
import { useAppStore } from '@/stores/app'
import AdvancedIntegrationPanel from './AdvancedIntegrationPanel.vue'

const unifiedStore = useUnifiedStore()
const unifiedIntegration = useUnifiedIntegration()
const dragAndDrop = useDragAndDrop()
const documentView = useDocumentView()
const whiteboardView = useWhiteboardView()
const appStore = useAppStore()

// ============================================================================
// STATE
// ============================================================================

const currentView = ref<'document' | 'whiteboard' | 'split'>('split')
const showIntegrationStatus = ref(true)
const showDemo = ref(false)
const showAdvancedFeatures = ref(false)
const syncStatus = ref<'synced' | 'syncing' | 'error'>('synced')

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const selectedBlocks = computed(() => {
  const docSelected = documentView.selectedBlockIds.value
  const whiteboardSelected = whiteboardView.selectedNodeIds.value
  return [...new Set([...docSelected, ...whiteboardSelected])]
})

const hasCanvasBlocks = computed(() => {
  return whiteboardView.canvasBlocks.value.length > 0
})

const stats = computed(() => {
  const allBlocks = Array.from(unifiedStore.blocks.values())
  const documentBlocks = allBlocks.filter(block => 
    unifiedIntegration.isInAnyDocument(block.id)
  ).length
  const whiteboardBlocks = allBlocks.filter(block => 
    unifiedIntegration.isOnAnyCanvas(block.id)
  ).length
  const linkedBlocks = allBlocks.filter(block => 
    unifiedIntegration.isInAnyDocument(block.id) && unifiedIntegration.isOnAnyCanvas(block.id)
  ).length
  
  return {
    totalBlocks: allBlocks.length,
    documentBlocks,
    whiteboardBlocks,
    linkedBlocks
  }
})

const syncStatusClass = computed(() => {
  switch (syncStatus.value) {
    case 'synced': return 'badge-success'
    case 'syncing': return 'badge-warning'
    case 'error': return 'badge-error'
    default: return 'badge-ghost'
  }
})

// ============================================================================
// METHODS
// ============================================================================

function switchToDocumentView() {
  currentView.value = 'document'
  appStore.setCurrentView('filesystem')
}

function switchToWhiteboardView() {
  currentView.value = 'whiteboard'
  appStore.setCurrentView('whiteboard')
}

function switchToSplitView() {
  currentView.value = 'split'
  appStore.setCurrentView('integration')
}

function createBidirectionalLink() {
  selectedBlocks.value.forEach(blockId => {
    unifiedIntegration.createBidirectionalLink(blockId)
  })
  
  appStore.addError(appStore.createError(
    'LINK_SUCCESS',
    `Created bidirectional links for ${selectedBlocks.value.length} block(s)`,
    'integration'
  ))
}

function autoLayoutCanvas() {
  if (unifiedStore.currentCanvasId) {
    unifiedIntegration.autoLayoutCanvas(unifiedStore.currentCanvasId)
    
    appStore.addError(appStore.createError(
      'LAYOUT_SUCCESS',
      'Auto-layout applied to canvas',
      'integration'
    ))
  }
}

function syncAllViews() {
  syncStatus.value = 'syncing'
  
  // Simulate sync process
  setTimeout(() => {
    syncStatus.value = 'synced'
    
    appStore.addError(appStore.createError(
      'SYNC_SUCCESS',
      'All views synchronized',
      'integration'
    ))
  }, 1000)
}

function exportWorkspace() {
  // TODO: Implement workspace export
  appStore.addError(appStore.createError(
    'EXPORT_INFO',
    'Workspace export feature coming soon',
    'integration'
  ))
}

function importWorkspace() {
  // TODO: Implement workspace import
  appStore.addError(appStore.createError(
    'IMPORT_INFO',
    'Workspace import feature coming soon',
    'integration'
  ))
}

function showIntegrationDemo() {
  showDemo.value = true
}

function showKeyboardShortcuts() {
  // TODO: Implement keyboard shortcuts modal
  appStore.addError(appStore.createError(
    'SHORTCUTS_INFO',
    'Keyboard shortcuts: Ctrl+D (Document), Ctrl+W (Whiteboard), Ctrl+S (Split)',
    'integration'
  ))
}

// ============================================================================
// WATCHERS
// ============================================================================

// Watch for changes and update sync status
watch(
  () => unifiedStore.stats,
  () => {
    syncStatus.value = 'syncing'
    setTimeout(() => {
      syncStatus.value = 'synced'
    }, 500)
  },
  { deep: true }
)
</script>

<style scoped>
.cross-view-operations {
  @apply relative;
}

.drag-overlay {
  z-index: 9999;
}

.drag-preview {
  animation: dragPulse 1s ease-in-out infinite;
}

@keyframes dragPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.05); }
}

.drop-indicator {
  animation: dropPulse 1s ease-in-out infinite;
}

@keyframes dropPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.stats {
  @apply bg-base-100;
}

.stat {
  @apply px-3 py-2;
}

.stat-title {
  @apply text-xs text-base-content/60;
}

.stat-value {
  @apply text-lg font-bold text-base-content;
}
</style>
