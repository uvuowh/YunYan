<template>
  <div class="canvas-list h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-base-300">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Canvases</h2>
        <button 
          class="btn btn-sm btn-primary"
          @click="createNewCanvas"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New
        </button>
      </div>

      <!-- Search -->
      <div class="relative">
        <input
          v-model="searchQuery"
          class="input input-sm w-full pl-10"
          placeholder="Search canvases..."
          @input="handleSearch"
        />
        <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Canvas List -->
    <div class="flex-1 overflow-y-auto p-4 pt-2">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="displayedCanvases.length === 0" class="text-center py-8 text-base-content/60">
        <svg class="w-12 h-12 mx-auto mb-4 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
        <p>{{ getEmptyMessage() }}</p>
      </div>

      <div v-else class="space-y-2">
        <CanvasListItem
          v-for="canvas in displayedCanvases"
          :key="canvas.id"
          :canvas="canvas"
          :is-selected="currentCanvas?.id === canvas.id"
          @select="selectCanvas"
          @delete="deleteCanvas"
          @duplicate="duplicateCanvas"
          @rename="renameCanvas"
        />
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="p-4 border-t border-base-300 text-sm text-base-content/60">
      <div class="flex justify-between">
        <span>{{ canvasCount }} canvases</span>
        <span>{{ totalNodes }} nodes</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWhiteboardStore } from '@/stores/whiteboard'
import { useAppStore } from '@/stores/app'
import type { Canvas } from '@/types'
// import CanvasListItem from './CanvasListItem.vue'

const whiteboardStore = useWhiteboardStore()
const appStore = useAppStore()

// Temporary placeholder component
const CanvasListItem = { 
  template: `
    <div class="p-3 hover:bg-base-200 rounded-lg cursor-pointer transition-colors border border-base-300 mb-2"
         :class="{ 'bg-primary/10 border-primary': isSelected }"
         @click="$emit('select', canvas.id)">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-base-content truncate mb-1">
            {{ canvas.name || 'Untitled Canvas' }}
          </h3>
          <div class="flex items-center gap-4 text-xs text-base-content/50">
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {{ canvas.nodes?.length || 0 }} nodes
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {{ canvas.connections?.length || 0 }} connections
            </span>
            <span>{{ formatDate(canvas.updatedAt) }}</span>
          </div>
        </div>
        <div class="dropdown dropdown-end">
          <button class="btn btn-xs btn-ghost" tabindex="0" @click.stop>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a @click.stop="$emit('select', canvas.id)">Open</a></li>
            <li><a @click.stop="$emit('rename', canvas.id)">Rename</a></li>
            <li><a @click.stop="$emit('duplicate', canvas.id)">Duplicate</a></li>
            <li class="divider"></li>
            <li><a @click.stop="$emit('delete', canvas.id)" class="text-error">Delete</a></li>
          </ul>
        </div>
      </div>
    </div>
  `,
  props: ['canvas', 'isSelected'],
  emits: ['select', 'delete', 'duplicate', 'rename'],
  methods: {
    formatDate(date: Date): string {
      const now = new Date()
      const diffInHours = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`
      } else if (diffInHours < 24 * 7) {
        return `${Math.floor(diffInHours / 24)}d ago`
      } else {
        return new Date(date).toLocaleDateString()
      }
    }
  }
}

// State
const searchQuery = ref('')
const loading = ref(false)

// Computed
const currentCanvas = computed(() => whiteboardStore.currentCanvas)
const canvases = computed(() => whiteboardStore.canvases)
const canvasCount = computed(() => whiteboardStore.canvasCount)

const displayedCanvases = computed(() => {
  if (!searchQuery.value.trim()) {
    return canvases.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return canvases.value.filter(canvas =>
    canvas.name.toLowerCase().includes(query)
  )
})

const totalNodes = computed(() => {
  return canvases.value.reduce((total, canvas) => total + (canvas.nodes?.length || 0), 0)
})

// Methods
function createNewCanvas() {
  const newCanvas = whiteboardStore.createCanvas()
  selectCanvas(newCanvas.id)
}

function selectCanvas(canvasId: string) {
  whiteboardStore.setCurrentCanvas(canvasId)
}

async function deleteCanvas(canvasId: string) {
  if (confirm('Are you sure you want to delete this canvas?')) {
    try {
      loading.value = true
      whiteboardStore.deleteCanvas(canvasId)
      
      appStore.addError(appStore.createError(
        'DELETE_SUCCESS',
        'Canvas deleted successfully',
        'whiteboard'
      ))
    } catch (error) {
      console.error('Failed to delete canvas:', error)
      appStore.addError(appStore.createError(
        'DELETE_FAILED',
        'Failed to delete canvas',
        'whiteboard',
        error
      ))
    } finally {
      loading.value = false
    }
  }
}

function duplicateCanvas(canvasId: string) {
  const originalCanvas = canvases.value.find(canvas => canvas.id === canvasId)
  if (originalCanvas) {
    const newCanvas = whiteboardStore.createCanvas(`${originalCanvas.name} (Copy)`)
    
    // Copy nodes and connections
    whiteboardStore.updateCanvas(newCanvas.id, {
      nodes: originalCanvas.nodes.map(node => ({ ...node, id: crypto.randomUUID() })),
      connections: originalCanvas.connections.map(conn => ({ ...conn, id: crypto.randomUUID() })),
      settings: { ...originalCanvas.settings }
    })
    
    selectCanvas(newCanvas.id)
  }
}

async function renameCanvas(canvasId: string) {
  const canvas = canvases.value.find(c => c.id === canvasId)
  if (!canvas) return
  
  const newName = prompt('Enter new canvas name:', canvas.name)
  if (newName && newName.trim() && newName !== canvas.name) {
    try {
      whiteboardStore.updateCanvas(canvasId, { name: newName.trim() })
      
      appStore.addError(appStore.createError(
        'RENAME_SUCCESS',
        'Canvas renamed successfully',
        'whiteboard'
      ))
    } catch (error) {
      console.error('Failed to rename canvas:', error)
      appStore.addError(appStore.createError(
        'RENAME_FAILED',
        'Failed to rename canvas',
        'whiteboard',
        error
      ))
    }
  }
}

function handleSearch() {
  // Search is handled by computed property
}

function getEmptyMessage(): string {
  if (searchQuery.value.trim()) {
    return `No canvases found for "${searchQuery.value}"`
  }
  return 'No canvases yet. Create your first canvas!'
}
</script>

<style scoped>
.canvas-list {
  @apply bg-base-100;
}

.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-primary;
}
</style>
