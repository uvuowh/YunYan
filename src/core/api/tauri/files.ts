import { invoke } from '@tauri-apps/api/core'
import type { DirectoryListing } from './types'

/**
 * Read a text file from the app data directory
 */
export const readTextFile = async (filePath: string): Promise<string> => {
  try {
    return await invoke<string>('read_text_file', { filePath })
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error)
    throw error
  }
}

/**
 * Write a text file to the app data directory
 */
export const writeTextFile = async (filePath: string, content: string): Promise<void> => {
  try {
    await invoke<void>('write_text_file', { filePath, content })
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error)
    throw error
  }
}

/**
 * List files in a directory within the app data directory
 */
export const listDirectory = async (dirPath: string): Promise<DirectoryListing> => {
  try {
    return await invoke<DirectoryListing>('list_directory', { dirPath })
  } catch (error) {
    console.error(`Failed to list directory ${dirPath}:`, error)
    throw error
  }
}

/**
 * Check if a file exists in the app data directory
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    return await invoke<boolean>('file_exists', { filePath })
  } catch (error) {
    console.error(`Failed to check if file exists ${filePath}:`, error)
    throw error
  }
}

/**
 * Utility function to ensure directory exists before writing
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    // Try to list the directory to see if it exists
    await listDirectory(dirPath)
  } catch (error) {
    // If listing fails, the directory might not exist
    // We'll let the write operation create it
    console.warn(`Directory ${dirPath} might not exist, will be created on write`)
  }
}

/**
 * Read JSON file and parse it
 */
export const readJsonFile = async <T>(filePath: string): Promise<T> => {
  try {
    const content = await readTextFile(filePath)
    return JSON.parse(content) as T
  } catch (error) {
    console.error(`Failed to read JSON file ${filePath}:`, error)
    throw error
  }
}

/**
 * Write object as JSON file
 */
export const writeJsonFile = async <T>(filePath: string, data: T): Promise<void> => {
  try {
    const content = JSON.stringify(data, null, 2)
    await writeTextFile(filePath, content)
  } catch (error) {
    console.error(`Failed to write JSON file ${filePath}:`, error)
    throw error
  }
}
