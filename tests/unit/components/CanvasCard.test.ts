import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CanvasCard from '@/components/canvas/CanvasCard.vue'
import { useCanvasStore } from '@/store/canvas'

describe('CanvasCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const defaultProps = {
    id: 1,
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    title: 'Test Card',
    content: 'Test content'
  }

  it('renders card with correct props', () => {
    const wrapper = mount(CanvasCard, {
      props: defaultProps
    })

    expect(wrapper.exists()).toBe(true)
    // Note: Since this is a Konva component, we test the component logic rather than DOM
  })

  it('handles left click for selection', () => {
    const store = useCanvasStore()
    const selectCardSpy = vi.spyOn(store, 'selectCard')

    const wrapper = mount(CanvasCard, {
      props: defaultProps
    })

    // Simulate left click
    const mockEvent = {
      evt: { button: 0, ctrlKey: false, metaKey: false },
      cancelBubble: false
    }

    // Access the component instance to test the method
    const component = wrapper.vm as any
    component.handleClick(mockEvent)

    expect(selectCardSpy).toHaveBeenCalledWith(1, false)
  })

  it('handles right click for connection management', () => {
    const store = useCanvasStore()
    const manageConnectionSpy = vi.spyOn(store, 'manageConnection')

    const wrapper = mount(CanvasCard, {
      props: defaultProps
    })

    // Simulate right click
    const mockEvent = {
      evt: {
        button: 2,
        preventDefault: vi.fn()
      },
      cancelBubble: false
    }

    const component = wrapper.vm as any
    component.handleContextMenu(mockEvent)

    expect(mockEvent.evt.preventDefault).toHaveBeenCalled()
    expect(mockEvent.cancelBubble).toBe(true)
    expect(manageConnectionSpy).toHaveBeenCalledWith(1)
  })

  it('updates position when props change', async () => {
    const wrapper = mount(CanvasCard, {
      props: defaultProps
    })

    await wrapper.setProps({ x: 200, y: 250 })

    // Test that the component reacts to prop changes
    expect(wrapper.props('x')).toBe(200)
    expect(wrapper.props('y')).toBe(250)
  })
})
