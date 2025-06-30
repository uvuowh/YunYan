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
import { useFileSystemStore } from '@/stores/filesystem'
import { useAppStore } from '@/stores/app'
import type { Block, BlockType } from '@/types'
import { parseMarkdownToBlocks, blocksToMarkdown, renderMarkdown, getWordCount, calculateReadingTime } from '@/utils/markdown'
import BlockEditor from './BlockEditor.vue'

const fileSystemStore = useFileSystemStore()
const appStore = useAppStore()

// State
const showPreview = ref(false)
const hasChanges = ref(false)

// Computed
const currentDocument = computed(() => fileSystemStore.currentDocument)
const documentTitle = ref('')
const blocks = ref<Block[]>([])

const wordCount = computed(() => getWordCount(blocks.value))
const readingTime = computed(() => calculateReadingTime(wordCount.value))

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

function addBlock(type: BlockType) {
  const newBlock = fileSystemStore.createBlock(type)
  blocks.value.push(newBlock)
  markAsChanged()
}

function addBlockAfter(index: number, type: BlockType = 'paragraph') {
  const newBlock = fileSystemStore.createBlock(type)
  blocks.value.splice(index + 1, 0, newBlock)
  markAsChanged()
}

function updateBlock(blockId: string, updates: Partial<Block>) {
  const index = blocks.value.findIndex(b => b.id === blockId)
  if (index > -1) {
    blocks.value[index] = { ...blocks.value[index], ...updates }
    markAsChanged()
  }
}

function deleteBlock(blockId: string) {
  const index = blocks.value.findIndex(b => b.id === blockId)
  if (index > -1) {
    blocks.value.splice(index, 1)
    markAsChanged()
  }
}

function moveBlockUp(index: number) {
  if (index > 0) {
    const block = blocks.value.splice(index, 1)[0]
    blocks.value.splice(index - 1, 0, block)
    markAsChanged()
  }
}

function moveBlockDown(index: number) {
  if (index < blocks.value.length - 1) {
    const block = blocks.value.splice(index, 1)[0]
    blocks.value.splice(index + 1, 0, block)
    markAsChanged()
  }
}

async function saveDocument() {
  if (!currentDocument.value) return

  try {
    appStore.setLoading(true)
    
    // Update document with current content
    const content = blocksToMarkdown(blocks.value)
    fileSystemStore.updateDocument(currentDocument.value.id, {
      title: documentTitle.value,
      content,
      blocks: blocks.value
    })

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

onMounted(() => {
  // Initialize with empty document if none selected
  if (!currentDocument.value) {
    fileSystemStore.createDocument()
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
