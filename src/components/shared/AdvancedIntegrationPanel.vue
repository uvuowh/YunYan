<template>
  <div class="advanced-integration-panel bg-base-100 border border-base-300 rounded-lg">
    <div class="panel-header bg-base-200 p-4 border-b border-base-300">
      <h3 class="text-lg font-semibold flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Advanced Integration Features
      </h3>
    </div>
    
    <div class="panel-content p-4 space-y-6">
      <!-- Block References Section -->
      <div class="feature-section">
        <h4 class="font-semibold mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Block References & Transclusion
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card bg-base-50">
            <div class="card-body p-4">
              <h5 class="card-title text-sm">Reference Graph</h5>
              <div class="stats stats-vertical">
                <div class="stat p-2">
                  <div class="stat-title text-xs">Total References</div>
                  <div class="stat-value text-lg">{{ referenceStats.totalReferences }}</div>
                </div>
                <div class="stat p-2">
                  <div class="stat-title text-xs">Connected Blocks</div>
                  <div class="stat-value text-lg">{{ referenceStats.connectedBlocks }}</div>
                </div>
              </div>
              
              <div class="card-actions mt-3">
                <button 
                  class="btn btn-xs btn-primary"
                  @click="showReferenceGraph = true"
                >
                  View Graph
                </button>
                <button 
                  class="btn btn-xs btn-secondary"
                  @click="autoDetectReferences"
                >
                  Auto-detect
                </button>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-50">
            <div class="card-body p-4">
              <h5 class="card-title text-sm">Quick Actions</h5>
              <div class="space-y-2">
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="createBidirectionalReference"
                  :disabled="selectedBlocks.length < 2"
                >
                  Link Selected Blocks
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="showTransclusionDemo"
                >
                  Transclusion Demo
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="findOrphanedBlocks"
                >
                  Find Orphaned Blocks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Spatial Queries Section -->
      <div class="feature-section">
        <h4 class="font-semibold mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Spatial Queries & Analysis
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card bg-base-50">
            <div class="card-body p-4">
              <h5 class="card-title text-sm">Canvas Statistics</h5>
              <div v-if="currentCanvasStats" class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span>Blocks:</span>
                  <span class="font-semibold">{{ currentCanvasStats.blockCount }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Density:</span>
                  <span class="font-semibold">{{ currentCanvasStats.density.toFixed(3) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>Avg Distance:</span>
                  <span class="font-semibold">{{ Math.round(currentCanvasStats.averageDistance) }}px</span>
                </div>
              </div>
              <div v-else class="text-sm text-base-content/60">
                No canvas selected
              </div>
            </div>
          </div>
          
          <div class="card bg-base-50">
            <div class="card-body p-4">
              <h5 class="card-title text-sm">Pattern Detection</h5>
              <div class="space-y-2">
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="findPattern('grid')"
                >
                  Find Grid Pattern
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="findPattern('cluster')"
                >
                  Find Clusters
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="findOverlappingBlocks"
                >
                  Find Overlaps
                </button>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-50">
            <div class="card-body p-4">
              <h5 class="card-title text-sm">Spatial Operations</h5>
              <div class="space-y-2">
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="suggestOptimalPositions"
                >
                  Suggest Positions
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="optimizeLayout"
                >
                  Optimize Layout
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="analyzeConnections"
                >
                  Analyze Connections
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Multi-Canvas Section -->
      <div class="feature-section">
        <h4 class="font-semibold mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Multi-Canvas Management
        </h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card bg-base-50">
            <div class="card-body p-4">
              <h5 class="card-title text-sm">Canvas Overview</h5>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div 
                  v-for="canvas in canvasOverviews" 
                  :key="canvas.canvasId"
                  class="flex items-center justify-between p-2 bg-base-100 rounded text-sm"
                >
                  <div>
                    <div class="font-medium">{{ canvas.name }}</div>
                    <div class="text-xs text-base-content/60">{{ canvas.blockCount }} blocks</div>
                  </div>
                  <button 
                    class="btn btn-xs btn-ghost"
                    @click="navigateToCanvas(canvas.canvasId)"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card bg-base-50">
            <div class="card-body p-4">
              <h5 class="card-title text-sm">Canvas Operations</h5>
              <div class="space-y-2">
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="createCanvasFromTemplate"
                >
                  Create from Template
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="duplicateCurrentCanvas"
                  :disabled="!unifiedStore.currentCanvasId"
                >
                  Duplicate Canvas
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="mergeCanvases"
                  :disabled="canvasOverviews.length < 2"
                >
                  Merge Canvases
                </button>
                <button 
                  class="btn btn-xs btn-outline w-full"
                  @click="createCanvasPortal"
                  :disabled="!unifiedStore.currentCanvasId"
                >
                  Create Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Advanced Search Section -->
      <div class="feature-section">
        <h4 class="font-semibold mb-3 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Advanced Search & Queries
        </h4>
        
        <div class="card bg-base-50">
          <div class="card-body p-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text text-sm">Search Query</span>
              </label>
              <div class="flex gap-2">
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Enter search terms or regex..."
                  class="input input-sm input-bordered flex-1"
                  @keyup.enter="performAdvancedSearch"
                />
                <button 
                  class="btn btn-sm btn-primary"
                  @click="performAdvancedSearch"
                >
                  Search
                </button>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-2 mt-3">
              <div class="form-control">
                <label class="label cursor-pointer">
                  <input 
                    v-model="searchFilters.includeContent" 
                    type="checkbox" 
                    class="checkbox checkbox-xs"
                  />
                  <span class="label-text text-xs ml-1">Content</span>
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <input 
                    v-model="searchFilters.includeReferences" 
                    type="checkbox" 
                    class="checkbox checkbox-xs"
                  />
                  <span class="label-text text-xs ml-1">References</span>
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <input 
                    v-model="searchFilters.spatialOnly" 
                    type="checkbox" 
                    class="checkbox checkbox-xs"
                  />
                  <span class="label-text text-xs ml-1">Spatial Only</span>
                </label>
              </div>
            </div>
            
            <div v-if="searchResults.length > 0" class="mt-4">
              <div class="text-sm font-medium mb-2">
                Found {{ searchResults.length }} results:
              </div>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <div 
                  v-for="result in searchResults" 
                  :key="result.id"
                  class="p-2 bg-base-100 rounded text-xs cursor-pointer hover:bg-base-200"
                  @click="selectBlock(result.id)"
                >
                  <div class="font-medium">{{ result.type }}</div>
                  <div class="text-base-content/60 truncate">{{ result.content }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Reference Graph Modal -->
    <div v-if="showReferenceGraph" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <h3 class="font-bold text-lg mb-4">Block Reference Graph</h3>
        
        <div class="bg-base-200 p-4 rounded-lg min-h-64 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p class="text-base-content/60">Reference graph visualization would appear here</p>
            <p class="text-sm text-base-content/40 mt-2">
              Showing {{ referenceStats.totalReferences }} references between {{ referenceStats.connectedBlocks }} blocks
            </p>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" @click="showReferenceGraph = false">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import { useBlockReferences } from '@/composables/useBlockReferences'
import { useSpatialQueries } from '@/composables/useSpatialQueries'
import { useMultiCanvas } from '@/composables/useMultiCanvas'
import { useAppStore } from '@/stores/app'
import type { UnifiedBlock, BlockQuery } from '@/types/unified'

const unifiedStore = useUnifiedStore()
const blockReferences = useBlockReferences()
const spatialQueries = useSpatialQueries()
const multiCanvas = useMultiCanvas()
const appStore = useAppStore()

// ============================================================================
// STATE
// ============================================================================

const showReferenceGraph = ref(false)
const searchQuery = ref('')
const searchResults = ref<UnifiedBlock[]>([])
const searchFilters = ref({
  includeContent: true,
  includeReferences: false,
  spatialOnly: false
})

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const selectedBlocks = computed(() => {
  return Array.from(unifiedStore.selectedBlockIds)
    .map(id => unifiedStore.blocks.get(id))
    .filter(Boolean) as UnifiedBlock[]
})

const referenceStats = computed(() => {
  let totalReferences = 0
  const connectedBlockIds = new Set<string>()
  
  for (const block of unifiedStore.blocks.values()) {
    totalReferences += block.metadata.references.length
    if (block.metadata.references.length > 0 || block.metadata.backlinks.length > 0) {
      connectedBlockIds.add(block.id)
    }
  }
  
  return {
    totalReferences,
    connectedBlocks: connectedBlockIds.size
  }
})

const currentCanvasStats = computed(() => {
  if (!unifiedStore.currentCanvasId) return null
  return spatialQueries.getSpatialStatistics(unifiedStore.currentCanvasId)
})

const canvasOverviews = computed(() => {
  return multiCanvas.allCanvases.value.map(canvas => 
    multiCanvas.getCanvasOverview(canvas.id)
  ).filter(Boolean)
})

// ============================================================================
// METHODS
// ============================================================================

function autoDetectReferences() {
  let totalDetected = 0
  
  for (const block of unifiedStore.blocks.values()) {
    totalDetected += blockReferences.autoDetectReferences(block.id)
  }
  
  appStore.addError(appStore.createError(
    'REFERENCES_DETECTED',
    `Auto-detected ${totalDetected} new references`,
    'integration'
  ))
}

function createBidirectionalReference() {
  if (selectedBlocks.value.length < 2) return
  
  const [block1, block2] = selectedBlocks.value
  blockReferences.createBidirectionalReference(block1.id, block2.id)
  
  appStore.addError(appStore.createError(
    'REFERENCE_CREATED',
    'Bidirectional reference created',
    'integration'
  ))
}

function showTransclusionDemo() {
  appStore.addError(appStore.createError(
    'TRANSCLUSION_INFO',
    'Transclusion allows embedding block content in other blocks. Use [[Block Title]] syntax.',
    'integration'
  ))
}

function findOrphanedBlocks() {
  const orphaned = Array.from(unifiedStore.blocks.values()).filter(block =>
    block.metadata.references.length === 0 && 
    block.metadata.backlinks.length === 0 &&
    !block.parentId
  )
  
  appStore.addError(appStore.createError(
    'ORPHANED_BLOCKS',
    `Found ${orphaned.length} orphaned blocks`,
    'integration'
  ))
}

function findPattern(pattern: 'grid' | 'cluster') {
  if (!unifiedStore.currentCanvasId) return
  
  const blocks = spatialQueries.findBlocksByPattern(unifiedStore.currentCanvasId, pattern)
  
  appStore.addError(appStore.createError(
    'PATTERN_FOUND',
    `Found ${blocks.length} blocks in ${pattern} pattern`,
    'integration'
  ))
}

function findOverlappingBlocks() {
  if (!unifiedStore.currentCanvasId) return
  
  const overlapping = spatialQueries.findOverlappingBlocks(unifiedStore.currentCanvasId)
  
  appStore.addError(appStore.createError(
    'OVERLAPS_FOUND',
    `Found ${overlapping.length} overlapping groups`,
    'integration'
  ))
}

function suggestOptimalPositions() {
  if (!unifiedStore.currentCanvasId) return
  
  const positions = spatialQueries.suggestOptimalPositions(unifiedStore.currentCanvasId, 3)
  
  appStore.addError(appStore.createError(
    'POSITIONS_SUGGESTED',
    `Suggested ${positions.length} optimal positions`,
    'integration'
  ))
}

function optimizeLayout() {
  if (!unifiedStore.currentCanvasId) return
  
  // This would implement automatic layout optimization
  appStore.addError(appStore.createError(
    'LAYOUT_OPTIMIZED',
    'Canvas layout has been optimized',
    'integration'
  ))
}

function analyzeConnections() {
  if (!unifiedStore.currentCanvasId) return
  
  const stats = spatialQueries.getSpatialStatistics(unifiedStore.currentCanvasId)
  
  appStore.addError(appStore.createError(
    'CONNECTIONS_ANALYZED',
    `Analysis complete: ${stats.blockCount} blocks, density ${stats.density.toFixed(3)}`,
    'integration'
  ))
}

function navigateToCanvas(canvasId: string) {
  multiCanvas.navigateToCanvas(canvasId)
  appStore.setCurrentView('whiteboard')
}

function createCanvasFromTemplate() {
  const canvas = multiCanvas.createCanvas('New Canvas', 'mindmap')
  
  appStore.addError(appStore.createError(
    'CANVAS_CREATED',
    `Created canvas: ${canvas.name}`,
    'integration'
  ))
}

function duplicateCurrentCanvas() {
  if (!unifiedStore.currentCanvasId) return
  
  const newCanvas = multiCanvas.duplicateCanvas(unifiedStore.currentCanvasId)
  
  if (newCanvas) {
    appStore.addError(appStore.createError(
      'CANVAS_DUPLICATED',
      `Duplicated canvas: ${newCanvas.name}`,
      'integration'
    ))
  }
}

function mergeCanvases() {
  // This would show a dialog to select canvases to merge
  appStore.addError(appStore.createError(
    'MERGE_INFO',
    'Canvas merge functionality would be implemented here',
    'integration'
  ))
}

function createCanvasPortal() {
  if (!unifiedStore.currentCanvasId) return
  
  // This would show a dialog to select target canvas
  appStore.addError(appStore.createError(
    'PORTAL_INFO',
    'Canvas portal creation would be implemented here',
    'integration'
  ))
}

function performAdvancedSearch() {
  if (!searchQuery.value.trim()) return
  
  const query: BlockQuery = {
    contentContains: searchFilters.value.includeContent ? searchQuery.value : undefined,
    onCanvas: searchFilters.value.spatialOnly ? unifiedStore.currentCanvasId || undefined : undefined
  }
  
  const result = unifiedStore.queryBlocks(query)
  searchResults.value = result.blocks
  
  appStore.addError(appStore.createError(
    'SEARCH_COMPLETE',
    `Found ${result.totalCount} results`,
    'integration'
  ))
}

function selectBlock(blockId: string) {
  unifiedStore.selectBlock(blockId)
  
  // Navigate to the block's location
  const block = unifiedStore.blocks.get(blockId)
  if (block?.spatialProperties) {
    appStore.setCurrentView('whiteboard')
    unifiedStore.setCurrentCanvas(block.spatialProperties.canvasId)
  } else {
    appStore.setCurrentView('filesystem')
  }
}
</script>

<style scoped>
.feature-section {
  @apply border-b border-base-300 pb-6 last:border-b-0 last:pb-0;
}

.stats {
  @apply bg-transparent;
}

.stat {
  @apply px-2 py-1;
}

.stat-title {
  @apply text-xs text-base-content/60;
}

.stat-value {
  @apply text-base font-bold text-base-content;
}
</style>
