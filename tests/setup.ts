import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Tauri API
vi.mock('@tauri-apps/api', () => ({
  invoke: vi.fn(),
  event: {
    listen: vi.fn(),
    emit: vi.fn()
  },
  fs: {
    readTextFile: vi.fn(),
    writeTextFile: vi.fn(),
    exists: vi.fn()
  },
  dialog: {
    open: vi.fn(),
    save: vi.fn()
  }
}))

// Mock vue-konva components
vi.mock('vue-konva', () => ({
  Stage: {
    name: 'v-stage',
    template: '<div class="mock-stage"><slot /></div>'
  },
  Layer: {
    name: 'v-layer',
    template: '<div class="mock-layer"><slot /></div>'
  },
  Group: {
    name: 'v-group',
    template: '<div class="mock-group"><slot /></div>'
  },
  Rect: {
    name: 'v-rect',
    template: '<div class="mock-rect"></div>'
  },
  Text: {
    name: 'v-text',
    template: '<div class="mock-text"></div>'
  },
  Line: {
    name: 'v-line',
    template: '<div class="mock-line"></div>'
  }
}))

// Mock Konva
vi.mock('konva', () => ({
  Stage: vi.fn(() => ({
    add: vi.fn(),
    draw: vi.fn(),
    destroy: vi.fn(),
    getPointerPosition: vi.fn(() => ({ x: 0, y: 0 }))
  })),
  Layer: vi.fn(() => ({
    add: vi.fn(),
    draw: vi.fn()
  })),
  Rect: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    x: vi.fn(),
    y: vi.fn(),
    width: vi.fn(),
    height: vi.fn()
  })),
  Text: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    text: vi.fn()
  })),
  Line: vi.fn(() => ({
    points: vi.fn(),
    stroke: vi.fn()
  }))
}))

// Configure Vue Test Utils to handle vue-konva components
config.global.stubs = {
  'v-stage': {
    template: '<div class="mock-stage"><slot /></div>'
  },
  'v-layer': {
    template: '<div class="mock-layer"><slot /></div>'
  },
  'v-group': {
    template: '<div class="mock-group"><slot /></div>'
  },
  'v-rect': {
    template: '<div class="mock-rect"></div>'
  },
  'v-text': {
    template: '<div class="mock-text"></div>'
  },
  'v-line': {
    template: '<div class="mock-line"></div>'
  }
}

// Global test utilities
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})
