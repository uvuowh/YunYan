import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/ui/BaseButton.vue'

describe('BaseButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn-primary')
    expect(wrapper.classes()).toContain('btn-md')
  })

  it('applies variant classes correctly', () => {
    const wrapper = mount(BaseButton, {
      props: {
        variant: 'secondary',
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.classes()).toContain('btn-secondary')
    expect(wrapper.classes()).not.toContain('btn-primary')
  })

  it('applies size classes correctly', () => {
    const wrapper = mount(BaseButton, {
      props: {
        size: 'lg',
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.classes()).toContain('btn-lg')
    expect(wrapper.classes()).not.toContain('btn-md')
  })

  it('shows loading spinner when loading', () => {
    const wrapper = mount(BaseButton, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: {
        disabled: true,
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('btn-disabled')
  })

  it('is disabled when loading', () => {
    const wrapper = mount(BaseButton, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Button',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        disabled: true,
      },
      slots: {
        default: 'Button',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click when loading', async () => {
    const wrapper = mount(BaseButton, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Button',
      },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders icon slots correctly', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        'icon-left': '👈',
        default: 'Button',
        'icon-right': '👉',
      },
    })

    const text = wrapper.text()
    expect(text).toContain('👈')
    expect(text).toContain('Button')
    expect(text).toContain('👉')
  })

  it('applies block class when block prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: {
        block: true,
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.classes()).toContain('btn-block')
  })

  it('applies circle class when circle prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: {
        circle: true,
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.classes()).toContain('btn-circle')
  })

  it('applies square class when square prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: {
        square: true,
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.classes()).toContain('btn-square')
  })

  it('sets correct button type', () => {
    const wrapper = mount(BaseButton, {
      props: {
        type: 'submit',
      },
      slots: {
        default: 'Button',
      },
    })

    expect(wrapper.attributes('type')).toBe('submit')
  })
})
