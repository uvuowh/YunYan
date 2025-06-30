<template>
  <div class="document-list h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-base-300">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">Documents</h2>
        <button 
          class="btn btn-sm btn-primary"
          @click="createNewDocument"
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
          placeholder="Search documents..."
          @input="handleSearch"
        />
        <svg class="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="tabs tabs-boxed m-4 mb-0">
      <button 
        class="tab"
        :class="{ 'tab-active': activeFilter === 'all' }"
        @click="setFilter('all')"
      >
        All ({{ documentCount }})
      </button>
      <button 
        class="tab"
        :class="{ 'tab-active': activeFilter === 'recent' }"
        @click="setFilter('recent')"
      >
        Recent
      </button>
      <button 
        class="tab"
        :class="{ 'tab-active': activeFilter === 'search' }"
        @click="setFilter('search')"
        v-if="searchQuery"
      >
        Search Results ({{ searchResults.length }})
      </button>
    </div>

    <!-- Document List -->
    <div class="flex-1 overflow-y-auto p-4 pt-2">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="displayedDocuments.length === 0" class="text-center py-8 text-base-content/60">
        <svg class="w-12 h-12 mx-auto mb-4 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>{{ getEmptyMessage() }}</p>
      </div>

      <div v-else class="space-y-2">
        <DocumentListItem
          v-for="document in displayedDocuments"
          :key="document.id"
          :document="document"
          :is-selected="currentDocument?.id === document.id"
          @select="selectDocument"
          @delete="deleteDocument"
          @duplicate="duplicateDocument"
        />
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="p-4 border-t border-base-300 text-sm text-base-content/60">
      <div class="flex justify-between">
        <span>{{ documentCount }} documents</span>
        <span>{{ totalWordCount }} words</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFileSystemStore } from '@/stores/filesystem'
import { useAppStore } from '@/stores/app'
import type { Document } from '@/types'
import DocumentListItem from './DocumentListItem.vue'

const fileSystemStore = useFileSystemStore()
const appStore = useAppStore()

// State
const searchQuery = ref('')
const activeFilter = ref<'all' | 'recent' | 'search'>('all')
const loading = ref(false)

// Computed
const currentDocument = computed(() => fileSystemStore.currentDocument)
const documents = computed(() => fileSystemStore.sortedDocuments)
const recentDocuments = computed(() => fileSystemStore.recentDocuments)
const searchResults = computed(() => fileSystemStore.searchResults)
const documentCount = computed(() => fileSystemStore.documentCount)

const displayedDocuments = computed(() => {
  switch (activeFilter.value) {
    case 'recent':
      return recentDocuments.value
    case 'search':
      return searchResults.value
    default:
      return documents.value
  }
})

const totalWordCount = computed(() => {
  return documents.value.reduce((total, doc) => total + doc.metadata.wordCount, 0)
})

// Methods
function createNewDocument() {
  const newDoc = fileSystemStore.createDocument()
  selectDocument(newDoc.id)
}

function selectDocument(documentId: string) {
  fileSystemStore.setCurrentDocument(documentId)
}

async function deleteDocument(documentId: string) {
  if (confirm('Are you sure you want to delete this document?')) {
    try {
      loading.value = true
      fileSystemStore.deleteDocument(documentId)
      
      appStore.addError(appStore.createError(
        'DELETE_SUCCESS',
        'Document deleted successfully',
        'filesystem'
      ))
    } catch (error) {
      console.error('Failed to delete document:', error)
      appStore.addError(appStore.createError(
        'DELETE_FAILED',
        'Failed to delete document',
        'filesystem',
        error
      ))
    } finally {
      loading.value = false
    }
  }
}

function duplicateDocument(documentId: string) {
  const originalDoc = documents.value.find(doc => doc.id === documentId)
  if (originalDoc) {
    const newDoc = fileSystemStore.createDocument(`${originalDoc.title} (Copy)`)
    fileSystemStore.updateDocument(newDoc.id, {
      content: originalDoc.content,
      blocks: originalDoc.blocks.map(block => ({ ...block }))
    })
    selectDocument(newDoc.id)
  }
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    fileSystemStore.searchDocuments(searchQuery.value)
    setFilter('search')
  } else {
    setFilter('all')
  }
}

function setFilter(filter: 'all' | 'recent' | 'search') {
  activeFilter.value = filter
}

function getEmptyMessage(): string {
  switch (activeFilter.value) {
    case 'recent':
      return 'No recent documents'
    case 'search':
      return searchQuery.value ? `No documents found for "${searchQuery.value}"` : 'Enter a search query'
    default:
      return 'No documents yet. Create your first document!'
  }
}

// Watch for search query changes
watch(searchQuery, (newQuery) => {
  if (!newQuery.trim() && activeFilter.value === 'search') {
    setFilter('all')
  }
})
</script>

<style scoped>
.document-list {
  @apply bg-base-100;
}

.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-primary;
}
</style>
