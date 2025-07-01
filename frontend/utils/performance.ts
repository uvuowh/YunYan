// 性能优化工具函数

/**
 * 节流函数 - 限制函数调用频率
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null
  let lastExecTime = 0

  return (...args: Parameters<T>) => {
    const currentTime = Date.now()

    if (currentTime - lastExecTime > delay) {
      func(...args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        func(...args)
        lastExecTime = Date.now()
        timeoutId = null
      }, delay - (currentTime - lastExecTime))
    }
  }
}

/**
 * 防抖函数 - 延迟执行，重复调用会重置延迟
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * RAF节流 - 使用requestAnimationFrame限制调用频率
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return (...args: Parameters<T>) => {
    if (rafId) {
      return
    }

    rafId = requestAnimationFrame(() => {
      func(...args)
      rafId = null
    })
  }
}

/**
 * 检查矩形是否在视口内
 */
export function isRectInViewport(
  rect: { x: number; y: number; width: number; height: number },
  viewport: { x: number; y: number; zoom: number },
  canvasSize: { width: number; height: number }
): boolean {
  const screenRect = {
    x: rect.x * viewport.zoom + viewport.x,
    y: rect.y * viewport.zoom + viewport.y,
    width: rect.width * viewport.zoom,
    height: rect.height * viewport.zoom
  }

  return !(
    screenRect.x + screenRect.width < 0 ||
    screenRect.y + screenRect.height < 0 ||
    screenRect.x > canvasSize.width ||
    screenRect.y > canvasSize.height
  )
}

/**
 * 计算两点之间的距离
 */
export function distance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 限制数值在指定范围内
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 线性插值
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

/**
 * 缓动函数 - easeOutCubic
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * 动画帧管理器
 */
export class AnimationManager {
  private animations = new Map<string, {
    startTime: number
    duration: number
    from: number
    to: number
    onUpdate: (value: number) => void
    onComplete?: () => void
    easing?: (t: number) => number
  }>()

  private rafId: number | null = null

  animate(
    id: string,
    from: number,
    to: number,
    duration: number,
    onUpdate: (value: number) => void,
    options: {
      onComplete?: () => void
      easing?: (t: number) => number
    } = {}
  ) {
    this.animations.set(id, {
      startTime: performance.now(),
      duration,
      from,
      to,
      onUpdate,
      ...(options.onComplete && { onComplete: options.onComplete }),
      easing: options.easing || easeOutCubic
    })

    if (!this.rafId) {
      this.tick()
    }
  }

  stop(id: string) {
    this.animations.delete(id)
    if (this.animations.size === 0 && this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  stopAll() {
    this.animations.clear()
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private tick = () => {
    const now = performance.now()
    const toRemove: string[] = []

    for (const [id, animation] of this.animations) {
      const elapsed = now - animation.startTime
      const progress = Math.min(elapsed / animation.duration, 1)
      const easedProgress = animation.easing ? animation.easing(progress) : progress
      const value = lerp(animation.from, animation.to, easedProgress)

      animation.onUpdate(value)

      if (progress >= 1) {
        animation.onComplete?.()
        toRemove.push(id)
      }
    }

    toRemove.forEach(id => this.animations.delete(id))

    if (this.animations.size > 0) {
      this.rafId = requestAnimationFrame(this.tick)
    } else {
      this.rafId = null
    }
  }
}

/**
 * 全局动画管理器实例
 */
export const animationManager = new AnimationManager()

/**
 * 内存优化 - 对象池
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn

    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn())
    }
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  release(obj: T) {
    this.resetFn(obj)
    this.pool.push(obj)
  }

  clear() {
    this.pool.length = 0
  }
}
