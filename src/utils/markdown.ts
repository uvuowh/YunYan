import { marked } from 'marked'
import { v4 as uuidv4 } from 'uuid'
import type { Block, BlockType } from '@/types'

/**
 * Parse markdown content into blocks
 */
export function parseMarkdownToBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let currentBlock: Block | null = null
  let position = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Skip empty lines unless we're in a code block
    if (!trimmedLine && (!currentBlock || currentBlock.type !== 'code')) {
      if (currentBlock) {
        blocks.push(currentBlock)
        currentBlock = null
        position++
      }
      continue
    }

    // Detect block type
    const blockType = detectBlockType(line)

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (currentBlock && currentBlock.type === 'code') {
        // End of code block
        blocks.push(currentBlock)
        currentBlock = null
        position++
      } else {
        // Start of code block
        if (currentBlock) {
          blocks.push(currentBlock)
          position++
        }
        currentBlock = createBlock('code', '', position)
        const language = trimmedLine.substring(3).trim()
        if (language) {
          currentBlock.properties.language = language
        }
      }
      continue
    }

    // If we're in a code block, just add the line
    if (currentBlock && currentBlock.type === 'code') {
      currentBlock.content += (currentBlock.content ? '\n' : '') + line
      continue
    }

    // Handle other block types
    if (blockType !== 'paragraph' || !currentBlock || currentBlock.type !== 'paragraph') {
      // Start new block
      if (currentBlock) {
        blocks.push(currentBlock)
        position++
      }
      currentBlock = createBlock(blockType, getBlockContent(line, blockType), position)
      
      // Set block properties
      setBlockProperties(currentBlock, line)
    } else {
      // Continue paragraph
      currentBlock.content += (currentBlock.content ? '\n' : '') + line
    }
  }

  // Add the last block
  if (currentBlock) {
    blocks.push(currentBlock)
  }

  return blocks
}

/**
 * Convert blocks back to markdown
 */
export function blocksToMarkdown(blocks: Block[]): string {
  return blocks.map(block => blockToMarkdown(block)).join('\n\n')
}

/**
 * Convert a single block to markdown
 */
export function blockToMarkdown(block: Block): string {
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
      const listType = block.properties.listType || 'unordered'
      const prefix = listType === 'ordered' ? '1. ' : '- '
      markdown = prefix + block.content
      break
    case 'code':
      const language = block.properties.language || ''
      markdown = '```' + language + '\n' + block.content + '\n```'
      break
    case 'quote':
      markdown = '> ' + block.content.split('\n').join('\n> ')
      break
    case 'table':
      markdown = block.content // Tables are stored as markdown
      break
    case 'image':
      const alt = block.properties.alt || ''
      const src = block.properties.src || ''
      markdown = `![${alt}](${src})`
      break
    default:
      markdown = block.content
  }

  // Add children if any
  if (block.children.length > 0) {
    const childrenMarkdown = block.children.map(child => blockToMarkdown(child)).join('\n')
    markdown += '\n' + childrenMarkdown
  }

  return markdown
}

/**
 * Render markdown to HTML
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown) as string
}

/**
 * Render a single block to HTML
 */
export function renderBlock(block: Block): string {
  const markdown = blockToMarkdown(block)
  return marked.parse(markdown) as string
}

/**
 * Create a new block
 */
function createBlock(type: BlockType, content: string, position: number): Block {
  return {
    id: uuidv4(),
    type,
    content,
    properties: {},
    children: [],
    position
  }
}

/**
 * Detect block type from a line
 */
function detectBlockType(line: string): BlockType {
  const trimmed = line.trim()

  // Heading
  if (trimmed.match(/^#{1,6}\s/)) {
    return 'heading'
  }

  // List items
  if (trimmed.match(/^[-*+]\s/) || trimmed.match(/^\d+\.\s/)) {
    return 'list'
  }

  // Quote
  if (trimmed.startsWith('> ')) {
    return 'quote'
  }

  // Image
  if (trimmed.match(/^!\[.*\]\(.*\)$/)) {
    return 'image'
  }

  // Table (simple detection)
  if (trimmed.includes('|') && trimmed.split('|').length > 2) {
    return 'table'
  }

  // Default to paragraph
  return 'paragraph'
}

/**
 * Extract content from a line based on block type
 */
function getBlockContent(line: string, type: BlockType): string {
  const trimmed = line.trim()

  switch (type) {
    case 'heading':
      return trimmed.replace(/^#{1,6}\s/, '')
    case 'list':
      return trimmed.replace(/^[-*+]\s/, '').replace(/^\d+\.\s/, '')
    case 'quote':
      return trimmed.replace(/^>\s?/, '')
    case 'image':
      // Extract alt text
      const altMatch = trimmed.match(/^!\[(.*?)\]/)
      return altMatch ? altMatch[1] : ''
    default:
      return line
  }
}

/**
 * Set block properties based on the line content
 */
function setBlockProperties(block: Block, line: string): void {
  const trimmed = line.trim()

  switch (block.type) {
    case 'heading':
      const headingMatch = trimmed.match(/^(#{1,6})\s/)
      if (headingMatch) {
        block.properties.level = headingMatch[1].length
      }
      break
    case 'list':
      if (trimmed.match(/^\d+\.\s/)) {
        block.properties.listType = 'ordered'
      } else {
        block.properties.listType = 'unordered'
      }
      break
    case 'image':
      const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
      if (imageMatch) {
        block.properties.alt = imageMatch[1]
        block.properties.src = imageMatch[2]
      }
      break
  }
}

/**
 * Search for text within blocks
 */
export function searchBlocks(blocks: Block[], query: string): Block[] {
  const lowercaseQuery = query.toLowerCase()
  const results: Block[] = []

  function searchInBlock(block: Block): void {
    if (block.content.toLowerCase().includes(lowercaseQuery)) {
      results.push(block)
    }
    
    // Search in children
    block.children.forEach(child => searchInBlock(child))
  }

  blocks.forEach(block => searchInBlock(block))
  return results
}

/**
 * Get word count from blocks
 */
export function getWordCount(blocks: Block[]): number {
  let wordCount = 0

  function countWordsInBlock(block: Block): void {
    const words = block.content.trim().split(/\s+/).filter(word => word.length > 0)
    wordCount += words.length
    
    // Count words in children
    block.children.forEach(child => countWordsInBlock(child))
  }

  blocks.forEach(block => countWordsInBlock(block))
  return wordCount
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(wordCount: number): number {
  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200)
}

/**
 * Extract headings from blocks for table of contents
 */
export function extractHeadings(blocks: Block[]): Array<{ id: string; level: number; text: string }> {
  const headings: Array<{ id: string; level: number; text: string }> = []

  function extractFromBlock(block: Block): void {
    if (block.type === 'heading') {
      headings.push({
        id: block.id,
        level: block.properties.level || 1,
        text: block.content
      })
    }
    
    // Extract from children
    block.children.forEach(child => extractFromBlock(child))
  }

  blocks.forEach(block => extractFromBlock(block))
  return headings
}
