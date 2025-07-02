// Tauri API exports
export * from './tauri/system'
export * from './tauri/files'
export * from './tauri/types'

// HTTP API exports
export * from './http'

// Re-export commonly used functions with namespace
import * as systemApi from './tauri/system'
import * as filesApi from './tauri/files'
import { httpClient } from './http'

export const api = {
  system: systemApi,
  files: filesApi,
  http: httpClient,
}
