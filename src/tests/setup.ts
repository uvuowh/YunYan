// Test setup file for YunYan Desktop Application
import { vi } from 'vitest'

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue('mocked response')
}))

// Mock vue-konva
vi.mock('vue-konva', () => ({
  Stage: { template: '<div></div>' },
  Layer: { template: '<div></div>' },
  Rect: { template: '<div></div>' },
  Circle: { template: '<div></div>' },
  Line: { template: '<div></div>' },
  Text: { template: '<div></div>' }
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
})

// Mock crypto.randomUUID for older environments
if (!globalThis.crypto) {
  globalThis.crypto = {
    randomUUID: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  } as any
}

// Mock document methods
Object.defineProperty(document, 'documentElement', {
  value: {
    setAttribute: vi.fn(),
    getAttribute: vi.fn()
  },
  writable: true
})

// Global test utilities
globalThis.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}
