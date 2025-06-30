<template>
  <div 
    class="document-item"
    :class="{ 'document-item-selected': isSelected }"
    @click="$emit('select', document.id)"
  >
    <div class="flex items-start justify-between p-3 hover:bg-base-200 rounded-lg cursor-pointer transition-colors">
      <div class="flex-1 min-w-0">
        <!-- Title -->
        <h3 class="font-medium text-base-content truncate mb-1">
          {{ document.title || 'Untitled Document' }}
        </h3>
        
        <!-- Content Preview -->
        <p class="text-sm text-base-content/60 line-clamp-2 mb-2">
          {{ contentPreview }}
        </p>
        
        <!-- Metadata -->
        <div class="flex items-center gap-4 text-xs text-base-content/50">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {{ document.metadata.wordCount }} words
          </span>
          
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ document.metadata.readingTime }} min read
          </span>
          
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7" />
            </svg>
            {{ formatDate(document.updatedAt) }}
          </span>
        </div>
        
        <!-- Tags -->
        <div v-if="document.metadata.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span 
            v-for="tag in document.metadata.tags.slice(0, 3)"
            :key="tag"
            class="badge badge-sm badge-outline"
          >
            {{ tag }}
          </span>
          <span 
            v-if="document.metadata.tags.length > 3"
            class="badge badge-sm badge-ghost"
          >
            +{{ document.metadata.tags.length - 3 }}
          </span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="dropdown dropdown-end">
          <button 
            class="btn btn-xs btn-ghost"
            tabindex="0"
            @click.stop
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a @click.stop="$emit('select', document.id)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Open
              </a>
            </li>
            <li>
              <a @click.stop="$emit('duplicate', document.id)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </a>
            </li>
            <li>
              <a @click.stop="exportDocument">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </a>
            </li>
            <li class="divider"></li>
            <li>
              <a @click.stop="$emit('delete', document.id)" class="text-error">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Document } from '@/types'

interface Props {
  document: Document
  isSelected: boolean
}

interface Emits {
  (e: 'select', documentId: string): void
  (e: 'delete', documentId: string): void
  (e: 'duplicate', documentId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed
const contentPreview = computed(() => {
  if (!props.document.content) return 'No content'
  
  // Remove markdown formatting for preview
  const plainText = props.document.content
    .replace(/#{1,6}\s/g, '') // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/!\[.*?\]\(.*?\)/g, '[Image]') // Replace images
    .replace(/>\s/g, '') // Remove quote markers
    .replace(/[-*+]\s/g, '') // Remove list markers
    .replace(/\d+\.\s/g, '') // Remove numbered list markers
    .trim()
  
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText
})

// Methods
function formatDate(date: Date): string {
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

function exportDocument() {
  // Create a blob with the document content
  const blob = new Blob([props.document.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  
  // Create a temporary link and trigger download
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.document.title || 'document'}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.document-item {
  /* group class applied directly in template */
}

.document-item-selected {
  @apply bg-primary/10 border-l-4 border-primary;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.badge {
  @apply text-xs;
}
</style>
