import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useHistoryStore } from '@/store/history'
import { useCanvasStore } from '@/store/canvas'

// 测试组件
const TestComponent = defineComponent({
  setup() {
    const shortcuts = useKeyboardShortcuts()
    return { shortcuts }
  },
  template: '<div>Test Component</div>',
})

describe('useKeyboardShortcuts', () => {
  let historyStore: any

  beforeEach(() => {
    setActivePinia(createPinia())
    historyStore = useHistoryStore()

    // Mock history store methods
    vi.spyOn(historyStore, 'undo').mockImplementation(() => true)
    vi.spyOn(historyStore, 'redo').mockImplementation(() => true)
    vi.spyOn(historyStore, 'canUndo').mockReturnValue(true)
    vi.spyOn(historyStore, 'canRedo').mockReturnValue(true)

    // Mock canvas store methods
    const canvasStore = useCanvasStore()
    vi.spyOn(canvasStore, 'saveToLocalStorage').mockImplementation(() => {})
    vi.spyOn(canvasStore, 'loadFromLocalStorage').mockImplementation(() => {})
    vi.spyOn(canvasStore, 'clearCanvas').mockImplementation(() => {})
    vi.spyOn(canvasStore, 'removeCard').mockImplementation(() => {})
    vi.spyOn(canvasStore, 'removeSelectedCards').mockImplementation(() => {})
    vi.spyOn(canvasStore, 'selectCard').mockImplementation(() => {})
    vi.spyOn(canvasStore, 'getSelectedCount').mockReturnValue(1)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle Ctrl+Z for undo', () => {
    const wrapper = mount(TestComponent)

    // 模拟 Ctrl+Z 按键事件
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.undo).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should handle Ctrl+Y for redo', () => {
    const wrapper = mount(TestComponent)

    // 模拟 Ctrl+Y 按键事件
    const event = new KeyboardEvent('keydown', {
      key: 'y',
      ctrlKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.redo).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should handle Ctrl+Shift+Z for redo', () => {
    const wrapper = mount(TestComponent)

    // 模拟 Ctrl+Shift+Z 按键事件
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.redo).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should not handle shortcuts when focus is on input elements', () => {
    const wrapper = mount(TestComponent)

    // 创建一个输入框并设置焦点
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    // 模拟 Ctrl+Z 按键事件，目标是输入框
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })

    Object.defineProperty(event, 'target', {
      value: input,
      enumerable: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.undo).not.toHaveBeenCalled()

    document.body.removeChild(input)
    wrapper.unmount()
  })

  it('should not handle shortcuts when focus is on textarea elements', () => {
    const wrapper = mount(TestComponent)

    // 创建一个文本区域并设置焦点
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    // 模拟 Ctrl+Z 按键事件，目标是文本区域
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })

    Object.defineProperty(event, 'target', {
      value: textarea,
      enumerable: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.undo).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
    wrapper.unmount()
  })

  it('should not handle shortcuts when focus is on contentEditable elements', () => {
    const wrapper = mount(TestComponent)

    // 创建一个可编辑元素并设置焦点
    const div = document.createElement('div')
    div.contentEditable = 'true'
    document.body.appendChild(div)
    div.focus()

    // 模拟 Ctrl+Z 按键事件，目标是可编辑元素
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })

    Object.defineProperty(event, 'target', {
      value: div,
      enumerable: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.undo).not.toHaveBeenCalled()

    document.body.removeChild(div)
    wrapper.unmount()
  })

  it('should not call undo when canUndo returns false', () => {
    historyStore.canUndo.mockReturnValue(false)

    const wrapper = mount(TestComponent)

    // 模拟 Ctrl+Z 按键事件
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.undo).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should not call redo when canRedo returns false', () => {
    historyStore.canRedo.mockReturnValue(false)

    const wrapper = mount(TestComponent)

    // 模拟 Ctrl+Y 按键事件
    const event = new KeyboardEvent('keydown', {
      key: 'y',
      ctrlKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.redo).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should add custom shortcuts', () => {
    const wrapper = mount(TestComponent)
    const customAction = vi.fn()

    wrapper.vm.shortcuts.addShortcut({
      key: 'x',
      ctrlKey: true,
      action: customAction,
      description: 'Custom Action',
      preventDefault: true,
    })

    // 模拟 Ctrl+X 按键事件
    const event = new KeyboardEvent('keydown', {
      key: 'x',
      ctrlKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(customAction).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should remove shortcuts', () => {
    const wrapper = mount(TestComponent)

    // 移除默认的 Ctrl+Z 快捷键
    wrapper.vm.shortcuts.removeShortcut('z', { ctrlKey: true })

    // 模拟 Ctrl+Z 按键事件
    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(historyStore.undo).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should format shortcuts correctly', () => {
    const wrapper = mount(TestComponent)

    const shortcut = {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: () => {},
      description: 'Test',
    }

    const formatted = wrapper.vm.shortcuts.formatShortcut(shortcut)
    expect(formatted).toBe('Ctrl+Shift+Z')

    wrapper.unmount()
  })

  it('should get all shortcuts', () => {
    const wrapper = mount(TestComponent)

    const shortcuts = wrapper.vm.shortcuts.getShortcuts()
    expect(shortcuts.length).toBeGreaterThan(10) // 现在有更多快捷键

    wrapper.unmount()
  })

  it('should handle save shortcut (Ctrl+S)', () => {
    const wrapper = mount(TestComponent)
    const canvasStore = useCanvasStore()

    // Simulate Ctrl+S
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(canvasStore.saveToLocalStorage).toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should handle delete shortcut', () => {
    const wrapper = mount(TestComponent)
    const canvasStore = useCanvasStore()

    // Set a selected card
    canvasStore.selectedCardId = 1

    // Mock confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    // Simulate Delete key
    const event = new KeyboardEvent('keydown', {
      key: 'Delete',
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(canvasStore.removeSelectedCards).toHaveBeenCalled()

    // Cleanup
    vi.restoreAllMocks()
    wrapper.unmount()
  })

  it('should handle escape to deselect', () => {
    const wrapper = mount(TestComponent)
    const canvasStore = useCanvasStore()

    // Set a selected card
    canvasStore.selectedCardId = 1

    // Simulate Escape key
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    })

    document.dispatchEvent(event)

    expect(canvasStore.selectCard).toHaveBeenCalledWith(null)

    wrapper.unmount()
  })
})
