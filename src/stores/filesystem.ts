import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Document, Block, DocumentMetadata } from '@/types'
import { useAppStore } from './app'

export const useFileSystemStore = defineStore('filesystem', () => {
  // State
  const documents = ref<Document[]>([])
  const currentDocument = ref<Document | undefined>()
  const searchResults = ref<Document[]>([])
  const recentDocuments = ref<Document[]>([])
  const selectedBlocks = ref<string[]>([])

  // Getters
  const documentCount = computed(() => documents.value.length)
  const hasCurrentDocument = computed(() => !!currentDocument.value)
  const currentDocumentBlocks = computed(() => currentDocument.value?.blocks || [])
  
  const sortedDocuments = computed(() => 
    [...documents.value].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  )

  // Actions
  function createDocument(title: string = 'Untitled Document'): Document {
    const now = new Date()
    const document: Document = {
      id: uuidv4(),
      title,
      content: '',
      blocks: [],
      metadata: {
        tags: [],
        category: 'general',
        author: 'user',
        wordCount: 0,
        readingTime: 0,
        lastModified: now
      },
      createdAt: now,
      updatedAt: now,
      path: `/${title.toLowerCase().replace(/\s+/g, '-')}.md`
    }

    documents.value.push(document)
    setCurrentDocument(document.id)
    addToRecentDocuments(document)
    
    return document
  }

  function setCurrentDocument(documentId: string) {
    const document = documents.value.find(doc => doc.id === documentId)
    if (document) {
      currentDocument.value = document
      addToRecentDocuments(document)
    }
  }

  function updateDocument(documentId: string, updates: Partial<Document>) {
    const index = documents.value.findIndex(doc => doc.id === documentId)
    if (index > -1) {
      const updatedDocument = {
        ...documents.value[index],
        ...updates,
        updatedAt: new Date()
      }
      
      // Update word count and reading time
      if (updates.content !== undefined) {
        updatedDocument.metadata.wordCount = countWords(updates.content)
        updatedDocument.metadata.readingTime = calculateReadingTime(updatedDocument.metadata.wordCount)
        updatedDocument.metadata.lastModified = new Date()
      }
      
      documents.value[index] = updatedDocument
      
      // Update current document if it's the one being updated
      if (currentDocument.value?.id === documentId) {
        currentDocument.value = updatedDocument
      }
    }
  }

  function deleteDocument(documentId: string) {
    const index = documents.value.findIndex(doc => doc.id === documentId)
    if (index > -1) {
      documents.value.splice(index, 1)
      
      // Clear current document if it was deleted
      if (currentDocument.value?.id === documentId) {
        currentDocument.value = undefined
      }
      
      // Remove from recent documents
      removeFromRecentDocuments(documentId)
    }
  }

  function createBlock(type: Block['type'], content: string = '', parentId?: string): Block {
    const block: Block = {
      id: uuidv4(),
      type,
      content,
      properties: {},
      children: [],
      parentId,
      position: 0
    }

    if (currentDocument.value) {
      if (parentId) {
        // Add as child block
        const parentBlock = findBlock(currentDocument.value.blocks, parentId)
        if (parentBlock) {
          block.position = parentBlock.children.length
          parentBlock.children.push(block)
        }
      } else {
        // Add as root block
        block.position = currentDocument.value.blocks.length
        currentDocument.value.blocks.push(block)
      }
      
      updateDocumentContent()
    }

    return block
  }

  function updateBlock(blockId: string, updates: Partial<Block>) {
    if (!currentDocument.value) return

    const block = findBlock(currentDocument.value.blocks, blockId)
    if (block) {
      Object.assign(block, updates)
      updateDocumentContent()
    }
  }

  function deleteBlock(blockId: string) {
    if (!currentDocument.value) return

    removeBlockFromTree(currentDocument.value.blocks, blockId)
    updateDocumentContent()
  }

  function moveBlock(blockId: string, newParentId?: string, newPosition?: number) {
    if (!currentDocument.value) return

    const block = findBlock(currentDocument.value.blocks, blockId)
    if (!block) return

    // Remove from current position
    removeBlockFromTree(currentDocument.value.blocks, blockId)

    // Add to new position
    if (newParentId) {
      const newParent = findBlock(currentDocument.value.blocks, newParentId)
      if (newParent) {
        block.parentId = newParentId
        block.position = newPosition ?? newParent.children.length
        newParent.children.splice(block.position, 0, block)
      }
    } else {
      block.parentId = undefined
      block.position = newPosition ?? currentDocument.value.blocks.length
      currentDocument.value.blocks.splice(block.position, 0, block)
    }

    updateDocumentContent()
  }

  function searchDocuments(query: string) {
    const lowercaseQuery = query.toLowerCase()
    searchResults.value = documents.value.filter(doc =>
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.content.toLowerCase().includes(lowercaseQuery) ||
      doc.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  function addToRecentDocuments(document: Document) {
    // Remove if already exists
    removeFromRecentDocuments(document.id)
    
    // Add to beginning
    recentDocuments.value.unshift(document)
    
    // Keep only last 10
    if (recentDocuments.value.length > 10) {
      recentDocuments.value = recentDocuments.value.slice(0, 10)
    }
  }

  function removeFromRecentDocuments(documentId: string) {
    const index = recentDocuments.value.findIndex(doc => doc.id === documentId)
    if (index > -1) {
      recentDocuments.value.splice(index, 1)
    }
  }

  // Helper functions
  function findBlock(blocks: Block[], blockId: string): Block | undefined {
    for (const block of blocks) {
      if (block.id === blockId) {
        return block
      }
      const found = findBlock(block.children, blockId)
      if (found) {
        return found
      }
    }
    return undefined
  }

  function removeBlockFromTree(blocks: Block[], blockId: string): boolean {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].id === blockId) {
        blocks.splice(i, 1)
        return true
      }
      if (removeBlockFromTree(blocks[i].children, blockId)) {
        return true
      }
    }
    return false
  }

  function updateDocumentContent() {
    if (!currentDocument.value) return

    // Generate content from blocks
    const content = blocksToMarkdown(currentDocument.value.blocks)
    updateDocument(currentDocument.value.id, { content })
  }

  function blocksToMarkdown(blocks: Block[]): string {
    return blocks.map(block => blockToMarkdown(block)).join('\n\n')
  }

  function blockToMarkdown(block: Block): string {
    let markdown = ''
    
    switch (block.type) {
      case 'heading':
        const level = block.properties.level || 1
        markdown = '#'.repeat(level) + ' ' + block.content
        break
      case 'paragraph':
        markdown = block.content
        break
      case 'list':
        markdown = '- ' + block.content
        break
      case 'code':
        markdown = '```\n' + block.content + '\n```'
        break
      case 'quote':
        markdown = '> ' + block.content
        break
      default:
        markdown = block.content
    }

    if (block.children.length > 0) {
      const childrenMarkdown = block.children.map(child => blockToMarkdown(child)).join('\n')
      markdown += '\n' + childrenMarkdown
    }

    return markdown
  }

  function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  function calculateReadingTime(wordCount: number): number {
    // Average reading speed: 200 words per minute
    return Math.ceil(wordCount / 200)
  }

  return {
    // State
    documents,
    currentDocument,
    searchResults,
    recentDocuments,
    selectedBlocks,
    
    // Getters
    documentCount,
    hasCurrentDocument,
    currentDocumentBlocks,
    sortedDocuments,
    
    // Actions
    createDocument,
    setCurrentDocument,
    updateDocument,
    deleteDocument,
    createBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    searchDocuments,
    addToRecentDocuments,
    removeFromRecentDocuments
  }
})
