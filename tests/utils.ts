// 测试工具函数
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { expect } from 'vitest'
import type { Component } from 'vue'

/**
 * 创建测试用的 Pinia 实例
 */
export function createTestPinia() {
  return createPinia()
}

/**
 * 挂载 Vue 组件用于测试
 */
export function mountComponent<T extends Component>(
  component: T,
  options: {
    props?: Record<string, any>
    slots?: Record<string, any>
    global?: {
      plugins?: any[]
      provide?: Record<string, any>
      mocks?: Record<string, any>
    }
  } = {}
): VueWrapper<any> {
  const pinia = createTestPinia()

  const globalOptions: any = {
    plugins: [pinia, ...(options.global?.plugins || [])],
  }

  if (options.global?.provide) {
    globalOptions.provide = options.global.provide
  }

  if (options.global?.mocks) {
    globalOptions.mocks = options.global.mocks
  }

  const mountOptions: any = {
    global: globalOptions,
  }

  if (options.props) {
    mountOptions.props = options.props
  }

  if (options.slots) {
    mountOptions.slots = options.slots
  }

  return mount(component, mountOptions)
}

/**
 * 等待 Vue 的下一个 tick
 */
export async function nextTick() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 创建模拟的 API 响应
 */
export function createMockApiResponse<T>(data: T, success = true) {
  return {
    success,
    data: success ? data : undefined,
    error: success ? undefined : 'Mock error',
    timestamp: Date.now(),
  }
}

/**
 * 创建模拟的系统信息
 */
export function createMockSystemInfo() {
  return {
    platform: 'darwin',
    arch: 'x64',
    version: '1.0.0',
    totalMemory: 16 * 1024 * 1024 * 1024, // 16GB
    availableMemory: 8 * 1024 * 1024 * 1024, // 8GB
    cpuCount: 8,
  }
}

/**
 * 创建模拟的配置数据
 */
export function createMockConfig() {
  return {
    theme: 'light' as const,
    language: 'zh-CN' as const,
    autoSave: true,
  }
}

/**
 * 创建模拟的文件信息
 */
export function createMockFileInfo(overrides: Partial<any> = {}) {
  return {
    id: 'test-file-id',
    name: 'test.txt',
    path: '/test/test.txt',
    size: 1024,
    mimeType: 'text/plain',
    createdAt: Date.now() - 86400000, // 1 day ago
    modifiedAt: Date.now(),
    ...overrides,
  }
}

/**
 * 断言函数 - 检查是否为有效的 API 响应
 */
export function expectValidApiResponse(response: any) {
  expect(response).toHaveProperty('success')
  expect(response).toHaveProperty('timestamp')
  expect(typeof response.success).toBe('boolean')
  expect(typeof response.timestamp).toBe('number')

  if (response.success) {
    expect(response).toHaveProperty('data')
    expect(response.error).toBeUndefined()
  } else {
    expect(response).toHaveProperty('error')
    expect(typeof response.error).toBe('string')
  }
}

/**
 * 模拟用户交互
 */
export const userInteraction = {
  /**
   * 模拟点击事件
   */
  async click(wrapper: VueWrapper<any>, selector: string) {
    const element = wrapper.find(selector)
    expect(element.exists()).toBe(true)
    await element.trigger('click')
    await nextTick()
  },

  /**
   * 模拟输入事件
   */
  async type(wrapper: VueWrapper<any>, selector: string, value: string) {
    const input = wrapper.find(selector)
    expect(input.exists()).toBe(true)
    await input.setValue(value)
    await nextTick()
  },

  /**
   * 模拟表单提交
   */
  async submit(wrapper: VueWrapper<any>, selector: string) {
    const form = wrapper.find(selector)
    expect(form.exists()).toBe(true)
    await form.trigger('submit')
    await nextTick()
  },
}
