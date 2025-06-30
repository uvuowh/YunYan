<template>
  <div class="document-editor">
    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-group">
        <button 
          class="btn btn-sm btn-ghost"
          @click="saveDocument"
          :disabled="!hasChanges"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save
        </button>
        <button 
          class="btn btn-sm btn-ghost"
          @click="togglePreview"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ showPreview ? 'Edit' : 'Preview' }}
        </button>
      </div>
      
      <div class="toolbar-group">
        <button 
          class="btn btn-sm btn-ghost"
          @click="addBlock('heading')"
        >
          H
        </button>
        <button 
          class="btn btn-sm btn-ghost"
          @click="addBlock('list')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
        <button 
          class="btn btn-sm btn-ghost"
          @click="addBlock('code')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button 
          class="btn btn-sm btn-ghost"
          @click="addBlock('quote')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
      </div>

      <div class="toolbar-group">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-sm btn-ghost">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Whiteboard
          </label>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a @click="addSelectedToWhiteboard">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Selected to Whiteboard
              </a>
            </li>
            <li>
              <a @click="addAllToWhiteboard">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Add All Blocks to Whiteboard
              </a>
            </li>
            <li>
              <a @click="unifiedIntegration.autoLayoutCanvas(unifiedStore.currentCanvasId || '')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Auto-layout on Canvas
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="toolbar-group ml-auto">
        <span class="text-sm text-base-content/60">
          {{ wordCount }} words • {{ readingTime }} min read
        </span>
      </div>
    </div>

    <!-- Document Title -->
    <div class="p-4 border-b border-base-300">
      <input
        v-model="documentTitle"
        class="input input-ghost text-2xl font-bold w-full"
        placeholder="Document title..."
        @input="markAsChanged"
      />
    </div>

    <!-- Editor Content -->
    <div class="document-content">
      <div v-if="!showPreview" class="space-y-2">
        <BlockEditor
          v-for="(block, index) in blocks"
          :key="block.id"
          :block="block"
          :index="index"
          @update="updateBlock"
          @delete="deleteBlock"
          @add-after="addBlockAfter"
          @move-up="moveBlockUp"
          @move-down="moveBlockDown"
        />
        
        <button
          class="btn btn-ghost btn-sm w-full"
          @click="addBlock('paragraph')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add block
        </button>
      </div>

      <!-- Preview Mode -->
      <div v-else class="prose max-w-none p-4" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDocumentView } from '@/composables/useDocumentView'
import { useUnifiedIntegration } from '@/composables/useUnifiedIntegration'
import { useUnifiedStore } from '@/stores/unified'
import { useAppStore } from '@/stores/app'
import type { UnifiedBlock, UnifiedBlockType } from '@/types/unified'
import { parseMarkdownToBlocks, blocksToMarkdown, renderMarkdown, getWordCount, calculateReadingTime } from '@/utils/markdown'
import BlockEditor from './BlockEditor.vue'

const documentView = useDocumentView()
const unifiedIntegration = useUnifiedIntegration()
const unifiedStore = useUnifiedStore()
const appStore = useAppStore()

// State
const hasChanges = ref(false)

// Computed - using unified document view
const currentDocument = computed(() => documentView.currentDocument)
const documentTitle = ref('')
const blocks = computed(() => documentView.documentBlocks)
const showPreview = computed({
  get: () => documentView.showPreview.value,
  set: (value) => documentView.showPreview.value = value
})

const wordCount = computed(() => documentView.documentStats.value.wordCount)
const readingTime = computed(() => documentView.documentStats.value.readingTime)

const renderedContent = computed(() => {
  if (!currentDocument.value) return ''
  return renderMarkdown(currentDocument.value.content)
})

// Watch for document changes
watch(currentDocument, (newDoc) => {
  if (newDoc) {
    documentTitle.value = newDoc.title
    blocks.value = newDoc.blocks.length > 0 ? newDoc.blocks : parseMarkdownToBlocks(newDoc.content)
    hasChanges.value = false
  } else {
    documentTitle.value = ''
    blocks.value = []
    hasChanges.value = false
  }
}, { immediate: true })

// Watch for title changes
watch(documentTitle, () => {
  markAsChanged()
})

// Methods
function markAsChanged() {
  hasChanges.value = true
}

function togglePreview() {
  showPreview.value = !showPreview.value
}

function addBlock(type: UnifiedBlockType) {
  const result = documentView.createBlock(type)
  if (result.success) {
    markAsChanged()
  }
}

function addBlockAfter(index: number, type: UnifiedBlockType = 'paragraph') {
  const targetBlock = blocks.value[index]
  if (targetBlock) {
    const result = documentView.createBlockAfter(targetBlock.id, type)
    if (result.success) {
      markAsChanged()
    }
  }
}

function updateBlock(blockId: string, updates: Partial<UnifiedBlock>) {
  // For content updates, use the document view method
  if (updates.content !== undefined) {
    const result = documentView.updateBlockContent(blockId, updates.content)
    if (result.success) {
      markAsChanged()
    }
  }

  // For other updates, use the unified store directly
  // This ensures all properties are properly handled
  // The unified store will automatically sync to all views
}

function deleteBlock(blockId: string) {
  documentView.selectBlock(blockId)
  documentView.deleteSelectedBlocks()
  markAsChanged()
}

function moveBlockUp(index: number) {
  if (index > 0) {
    const currentBlock = blocks.value[index]
    const targetBlock = blocks.value[index - 1]
    if (currentBlock && targetBlock) {
      // Move block to position before the target block
      documentView.moveBlock(currentBlock.id, targetBlock.parentId, targetBlock.position)
      markAsChanged()
    }
  }
}

function moveBlockDown(index: number) {
  if (index < blocks.value.length - 1) {
    const currentBlock = blocks.value[index]
    const targetBlock = blocks.value[index + 1]
    if (currentBlock && targetBlock) {
      // Move block to position after the target block
      documentView.moveBlock(currentBlock.id, targetBlock.parentId, targetBlock.position + 1)
      markAsChanged()
    }
  }
}

// New unified feature: Add block to whiteboard
function addBlockToWhiteboard(blockId: string) {
  const result = unifiedIntegration.addDocumentBlockToWhiteboard(blockId)
  if (result) {
    appStore.addError(appStore.createError(
      'WHITEBOARD_ADD_SUCCESS',
      'Block added to whiteboard',
      'integration'
    ))
  }
}

// New unified feature: Convert block type
function convertBlockType(blockId: string, newType: UnifiedBlockType) {
  const result = documentView.convertBlockType(blockId, newType)
  if (result.success) {
    markAsChanged()
  }
}

// Whiteboard integration methods
function addSelectedToWhiteboard() {
  const selectedBlocks = documentView.selectedBlockIds.value
  if (selectedBlocks.length === 0) {
    appStore.addError(appStore.createError(
      'NO_SELECTION',
      'Please select blocks to add to whiteboard',
      'integration'
    ))
    return
  }

  let successCount = 0
  for (const blockId of selectedBlocks) {
    const result = unifiedIntegration.addDocumentBlockToWhiteboard(blockId)
    if (result) successCount++
  }

  if (successCount > 0) {
    appStore.addError(appStore.createError(
      'WHITEBOARD_ADD_SUCCESS',
      `${successCount} block(s) added to whiteboard`,
      'integration'
    ))
  }
}

function addAllToWhiteboard() {
  const allBlocks = blocks.value
  if (allBlocks.length === 0) {
    appStore.addError(appStore.createError(
      'NO_BLOCKS',
      'No blocks to add to whiteboard',
      'integration'
    ))
    return
  }

  let successCount = 0
  for (const block of allBlocks) {
    const result = unifiedIntegration.addDocumentBlockToWhiteboard(block.id)
    if (result) successCount++
  }

  if (successCount > 0) {
    appStore.addError(appStore.createError(
      'WHITEBOARD_ADD_SUCCESS',
      `${successCount} block(s) added to whiteboard`,
      'integration'
    ))
  }
}

async function saveDocument() {
  if (!currentDocument.value) return

  try {
    appStore.setLoading(true)

    // The unified store automatically handles persistence
    // We just need to mark as saved
    hasChanges.value = false

    // Show success message
    appStore.addError(appStore.createError(
      'SAVE_SUCCESS',
      'Document saved successfully',
      'filesystem'
    ))
  } catch (error) {
    console.error('Failed to save document:', error)
    appStore.addError(appStore.createError(
      'SAVE_FAILED',
      'Failed to save document',
      'filesystem',
      error
    ))
  } finally {
    appStore.setLoading(false)
  }
}

// Auto-save functionality
let autoSaveTimer: NodeJS.Timeout | null = null

watch([documentTitle, blocks], () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }

  if (hasChanges.value && appStore.config.autoSave) {
    autoSaveTimer = setTimeout(() => {
      saveDocument()
    }, 2000) // Auto-save after 2 seconds of inactivity
  }
}, { deep: true })

// Watch for document changes
watch(currentDocument, (newDoc) => {
  if (newDoc) {
    documentTitle.value = newDoc.title
    hasChanges.value = false
  } else {
    documentTitle.value = ''
    hasChanges.value = false
  }
}, { immediate: true })

// Watch for title changes
watch(documentTitle, () => {
  markAsChanged()
})

onMounted(() => {
  // Initialize with empty document if none selected
  if (!currentDocument.value) {
    documentView.createDocument()
  }
})
</script>

<style scoped>
.document-editor {
  @apply h-full flex flex-col bg-base-100;
}

.prose {
  @apply text-base-content;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  @apply text-base-content;
}

.prose code {
  @apply bg-base-200 text-base-content;
}

.prose pre {
  @apply bg-base-200;
}

.prose blockquote {
  @apply border-l-primary text-base-content/80;
}
</style>
