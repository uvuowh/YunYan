import { invoke } from '@tauri-apps/api/core'
import type {
  UnifiedWorkspace,
  UnifiedBlock,
  DocumentContainer,
  CanvasContainer,
  BlockQuery,
  QueryResult,
  UnifiedError
} from '@/types/unified'

export interface FileSystemError {
  code: string
  message: string
}

export interface TauriDocument {
  id: string
  title: string
  content: string
  path: string
  created_at: string
  updated_at: string
}

/**
 * Read file content from the file system
 */
export async function readFile(path: string): Promise<string> {
  try {
    return await invoke<string>('read_file', { path })
  } catch (error) {
    console.error('Failed to read file:', error)
    throw error
  }
}

/**
 * Write content to a file
 */
export async function writeFile(path: string, content: string): Promise<void> {
  try {
    await invoke<void>('write_file', { path, content })
  } catch (error) {
    console.error('Failed to write file:', error)
    throw error
  }
}

/**
 * Delete a file
 */
export async function deleteFile(path: string): Promise<void> {
  try {
    await invoke<void>('delete_file', { path })
  } catch (error) {
    console.error('Failed to delete file:', error)
    throw error
  }
}

/**
 * List files in a directory
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  try {
    return await invoke<string[]>('list_files', { dirPath })
  } catch (error) {
    console.error('Failed to list files:', error)
    throw error
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    return await invoke<boolean>('file_exists', { path })
  } catch (error) {
    console.error('Failed to check file existence:', error)
    return false
  }
}

/**
 * Create a directory
 */
export async function createDirectory(path: string): Promise<void> {
  try {
    await invoke<void>('create_directory', { path })
  } catch (error) {
    console.error('Failed to create directory:', error)
    throw error
  }
}

/**
 * Get the app data directory path
 */
export async function getAppDataDir(): Promise<string> {
  try {
    return await invoke<string>('get_app_data_dir')
  } catch (error) {
    console.error('Failed to get app data directory:', error)
    throw error
  }
}

/**
 * Save a document to the file system
 */
export async function saveDocument(document: {
  id: string
  title: string
  content: string
  path?: string
}): Promise<string> {
  try {
    const appDataDir = await getAppDataDir()
    const documentsDir = `${appDataDir}/documents`
    
    // Ensure documents directory exists
    await createDirectory(documentsDir)
    
    // Generate file path if not provided
    const filePath = document.path || `${documentsDir}/${document.id}.md`
    
    // Create document metadata
    const metadata = {
      id: document.id,
      title: document.title,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Combine metadata and content
    const fileContent = `---
id: ${metadata.id}
title: ${metadata.title}
created_at: ${metadata.created_at}
updated_at: ${metadata.updated_at}
---

${document.content}`
    
    await writeFile(filePath, fileContent)
    return filePath
  } catch (error) {
    console.error('Failed to save document:', error)
    throw error
  }
}

/**
 * Load a document from the file system
 */
export async function loadDocument(path: string): Promise<TauriDocument | null> {
  try {
    const content = await readFile(path)
    
    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    
    if (!frontmatterMatch) {
      // No frontmatter, create basic document
      return {
        id: path.split('/').pop()?.replace('.md', '') || 'unknown',
        title: path.split('/').pop()?.replace('.md', '') || 'Untitled',
        content: content,
        path: path,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    const [, frontmatter, documentContent] = frontmatterMatch
    const metadata: Record<string, string> = {}
    
    // Parse frontmatter
    frontmatter.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        metadata[key.trim()] = valueParts.join(':').trim()
      }
    })
    
    return {
      id: metadata.id || 'unknown',
      title: metadata.title || 'Untitled',
      content: documentContent.trim(),
      path: path,
      created_at: metadata.created_at || new Date().toISOString(),
      updated_at: metadata.updated_at || new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to load document:', error)
    return null
  }
}

/**
 * Load all documents from the documents directory
 */
export async function loadAllDocuments(): Promise<TauriDocument[]> {
  try {
    const appDataDir = await getAppDataDir()
    const documentsDir = `${appDataDir}/documents`
    
    // Ensure documents directory exists
    await createDirectory(documentsDir)
    
    const files = await listFiles(documentsDir)
    const documents: TauriDocument[] = []
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = `${documentsDir}/${file}`
        const document = await loadDocument(filePath)
        if (document) {
          documents.push(document)
        }
      }
    }
    
    return documents
  } catch (error) {
    console.error('Failed to load all documents:', error)
    return []
  }
}

/**
 * Delete a document from the file system
 */
export async function deleteDocumentFile(documentId: string): Promise<void> {
  try {
    const appDataDir = await getAppDataDir()
    const filePath = `${appDataDir}/documents/${documentId}.md`
    
    if (await fileExists(filePath)) {
      await deleteFile(filePath)
    }
  } catch (error) {
    console.error('Failed to delete document file:', error)
    throw error
  }
}

/**
 * Save canvas data to the file system
 */
export async function saveCanvas(canvas: {
  id: string
  name: string
  data: any
}): Promise<string> {
  try {
    const appDataDir = await getAppDataDir()
    const canvasDir = `${appDataDir}/canvases`
    
    // Ensure canvases directory exists
    await createDirectory(canvasDir)
    
    const filePath = `${canvasDir}/${canvas.id}.json`
    const canvasData = {
      ...canvas,
      updated_at: new Date().toISOString()
    }
    
    await writeFile(filePath, JSON.stringify(canvasData, null, 2))
    return filePath
  } catch (error) {
    console.error('Failed to save canvas:', error)
    throw error
  }
}

/**
 * Load canvas data from the file system
 */
export async function loadCanvas(canvasId: string): Promise<any | null> {
  try {
    const appDataDir = await getAppDataDir()
    const filePath = `${appDataDir}/canvases/${canvasId}.json`
    
    if (!(await fileExists(filePath))) {
      return null
    }
    
    const content = await readFile(filePath)
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to load canvas:', error)
    return null
  }
}

/**
 * Load all canvases from the canvases directory
 */
export async function loadAllCanvases(): Promise<any[]> {
  try {
    const appDataDir = await getAppDataDir()
    const canvasDir = `${appDataDir}/canvases`
    
    // Ensure canvases directory exists
    await createDirectory(canvasDir)
    
    const files = await listFiles(canvasDir)
    const canvases: any[] = []
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const canvasId = file.replace('.json', '')
        const canvas = await loadCanvas(canvasId)
        if (canvas) {
          canvases.push(canvas)
        }
      }
    }
    
    return canvases
  } catch (error) {
    console.error('Failed to load all canvases:', error)
    return []
  }
}

// ============================================================================
// UNIFIED SYSTEM API
// ============================================================================

/**
 * Load a unified workspace
 */
export async function loadWorkspace(workspaceId: string): Promise<UnifiedWorkspace> {
  try {
    return await invoke<UnifiedWorkspace>('load_workspace', { workspaceId })
  } catch (error) {
    console.error('Failed to load workspace:', error)
    throw error
  }
}

/**
 * Save a unified workspace
 */
export async function saveWorkspace(workspace: UnifiedWorkspace): Promise<void> {
  try {
    await invoke<void>('save_workspace', { workspace })
  } catch (error) {
    console.error('Failed to save workspace:', error)
    throw error
  }
}

/**
 * Save a unified block
 */
export async function saveBlock(workspaceId: string, block: UnifiedBlock): Promise<void> {
  try {
    await invoke<void>('save_block', { workspaceId, block })
  } catch (error) {
    console.error('Failed to save block:', error)
    throw error
  }
}

/**
 * Get a unified block
 */
export async function getBlock(workspaceId: string, blockId: string): Promise<UnifiedBlock | null> {
  try {
    return await invoke<UnifiedBlock | null>('get_block', { workspaceId, blockId })
  } catch (error) {
    console.error('Failed to get block:', error)
    throw error
  }
}

/**
 * Delete a unified block
 */
export async function deleteBlock(workspaceId: string, blockId: string): Promise<void> {
  try {
    await invoke<void>('delete_block', { workspaceId, blockId })
  } catch (error) {
    console.error('Failed to delete block:', error)
    throw error
  }
}

/**
 * Query unified blocks
 */
export async function queryBlocks(workspaceId: string, query: BlockQuery): Promise<QueryResult> {
  try {
    return await invoke<QueryResult>('query_blocks', { workspaceId, query })
  } catch (error) {
    console.error('Failed to query blocks:', error)
    throw error
  }
}

/**
 * Save a document container
 */
export async function saveDocumentContainer(workspaceId: string, document: DocumentContainer): Promise<void> {
  try {
    await invoke<void>('save_document', { workspaceId, document })
  } catch (error) {
    console.error('Failed to save document:', error)
    throw error
  }
}

/**
 * Get a document container
 */
export async function getDocumentContainer(workspaceId: string, documentId: string): Promise<DocumentContainer | null> {
  try {
    return await invoke<DocumentContainer | null>('get_document', { workspaceId, documentId })
  } catch (error) {
    console.error('Failed to get document:', error)
    throw error
  }
}

/**
 * Save a canvas container
 */
export async function saveCanvasContainer(workspaceId: string, canvas: CanvasContainer): Promise<void> {
  try {
    await invoke<void>('save_canvas', { workspaceId, canvas })
  } catch (error) {
    console.error('Failed to save canvas:', error)
    throw error
  }
}

/**
 * Get a canvas container
 */
export async function getCanvasContainer(workspaceId: string, canvasId: string): Promise<CanvasContainer | null> {
  try {
    return await invoke<CanvasContainer | null>('get_canvas', { workspaceId, canvasId })
  } catch (error) {
    console.error('Failed to get canvas:', error)
    throw error
  }
}
