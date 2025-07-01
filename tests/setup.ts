// 测试环境设置
import { vi } from 'vitest'

// Mock Tauri API
const mockInvoke = vi.fn()
const mockListen = vi.fn()
const mockEmit = vi.fn()

// 模拟 Tauri 核心 API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: mockInvoke,
}))

// 模拟 Tauri 事件 API
vi.mock('@tauri-apps/api/event', () => ({
  listen: mockListen,
  emit: mockEmit,
}))

// 模拟 Tauri 插件
vi.mock('@tauri-apps/plugin-opener', () => ({
  open: vi.fn(),
}))

// 全局测试工具
global.mockTauri = {
  invoke: mockInvoke,
  listen: mockListen,
  emit: mockEmit,

  // 重置所有 mock
  reset: () => {
    mockInvoke.mockReset()
    mockListen.mockReset()
    mockEmit.mockReset()
  },

  // 设置 invoke 返回值
  setInvokeResponse: (command: string, response: any) => {
    mockInvoke.mockImplementation((cmd: string) => {
      if (cmd === command) {
        return Promise.resolve(response)
      }
      return Promise.reject(new Error(`Unmocked command: ${cmd}`))
    })
  },

  // 设置 invoke 错误
  setInvokeError: (command: string, error: any) => {
    mockInvoke.mockImplementation((cmd: string) => {
      if (cmd === command) {
        return Promise.reject(error)
      }
      return Promise.reject(new Error(`Unmocked command: ${cmd}`))
    })
  },
}

// 模拟浏览器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟 IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 设置测试环境变量
process.env['NODE_ENV'] = 'test'
