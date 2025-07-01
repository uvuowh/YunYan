// Tauri Commands 测试
import { beforeEach, describe, expect, it } from 'vitest'
import { createMockSystemInfo, expectValidApiResponse } from '../../tests/utils'
import { commands } from './commands'

describe('Tauri Commands', () => {
  beforeEach(() => {
    global.mockTauri.reset()
  })

  describe('greet command', () => {
    it('should call greet command with correct parameters', async () => {
      const mockResponse = {
        message: "Hello, Test User! You've been greeted from Rust!",
        timestamp: Date.now(),
      }

      global.mockTauri.setInvokeResponse('greet', mockResponse)

      const result = await commands.greet({ name: 'Test User' })

      expect(global.mockTauri.invoke).toHaveBeenCalledWith('greet', { name: 'Test User' })
      expectValidApiResponse(result)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
    })

    it('should handle greet command errors', async () => {
      const mockError = new Error('Name cannot be empty')
      global.mockTauri.setInvokeError('greet', mockError)

      const result = await commands.greet({ name: '' })

      expectValidApiResponse(result)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Name cannot be empty')
    })
  })

  describe('system commands', () => {
    it('should get system info successfully', async () => {
      const mockSystemInfo = createMockSystemInfo()
      global.mockTauri.setInvokeResponse('get_system_info', mockSystemInfo)

      const result = await commands.getSystemInfo()

      expect(global.mockTauri.invoke).toHaveBeenCalledWith('get_system_info', undefined)
      expectValidApiResponse(result)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSystemInfo)
    })

    it('should handle system info errors', async () => {
      const mockError = new Error('Failed to get system info')
      global.mockTauri.setInvokeError('get_system_info', mockError)

      const result = await commands.getSystemInfo()

      expectValidApiResponse(result)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to get system info')
    })
  })

  describe('config commands', () => {
    it('should get config successfully', async () => {
      const mockConfig = {
        theme: 'dark',
        language: 'en-US',
        autoSave: false,
      }

      global.mockTauri.setInvokeResponse('get_config', mockConfig)

      const result = await commands.getConfig()

      expect(global.mockTauri.invoke).toHaveBeenCalledWith('get_config', {})
      expectValidApiResponse(result)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockConfig)
    })

    it('should set config successfully', async () => {
      global.mockTauri.setInvokeResponse('set_config', undefined)

      const result = await commands.setConfig({ key: 'theme', value: 'dark' })

      expect(global.mockTauri.invoke).toHaveBeenCalledWith('set_config', {
        key: 'theme',
        value: 'dark',
      })
      expectValidApiResponse(result)
      expect(result.success).toBe(true)
    })

    it('should handle config errors', async () => {
      const mockError = new Error('Invalid config key')
      global.mockTauri.setInvokeError('set_config', mockError)

      const result = await commands.setConfig({ key: 'invalid', value: 'test' })

      expectValidApiResponse(result)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid config key')
    })
  })

  describe('file system commands', () => {
    it('should read file successfully', async () => {
      const mockContent = 'File content here'
      global.mockTauri.setInvokeResponse('read_file', mockContent)

      const result = await commands.readFile({ path: '/test/file.txt' })

      expect(global.mockTauri.invoke).toHaveBeenCalledWith('read_file', {
        path: '/test/file.txt',
      })
      expectValidApiResponse(result)
      expect(result.success).toBe(true)
      expect(result.data).toBe(mockContent)
    })

    it('should write file successfully', async () => {
      global.mockTauri.setInvokeResponse('write_file', undefined)

      const result = await commands.writeFile({
        path: '/test/file.txt',
        content: 'New content',
      })

      expect(global.mockTauri.invoke).toHaveBeenCalledWith('write_file', {
        path: '/test/file.txt',
        content: 'New content',
      })
      expectValidApiResponse(result)
      expect(result.success).toBe(true)
    })

    it('should list directory successfully', async () => {
      const mockItems = [
        { name: 'file1.txt', path: '/test/file1.txt', isDirectory: false },
        { name: 'folder1', path: '/test/folder1', isDirectory: true },
      ]

      global.mockTauri.setInvokeResponse('list_directory', mockItems)

      const result = await commands.listDirectory({ path: '/test' })

      expect(global.mockTauri.invoke).toHaveBeenCalledWith('list_directory', {
        path: '/test',
      })
      expectValidApiResponse(result)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockItems)
    })

    it('should handle file system errors', async () => {
      const mockError = new Error('File not found')
      global.mockTauri.setInvokeError('read_file', mockError)

      const result = await commands.readFile({ path: '/nonexistent/file.txt' })

      expectValidApiResponse(result)
      expect(result.success).toBe(false)
      expect(result.error).toBe('File not found')
    })
  })
})
