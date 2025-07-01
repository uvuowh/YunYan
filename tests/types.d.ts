// 测试环境类型声明
import type { MockedFunction } from 'vitest'

declare global {
  interface Window {
    mockTauri: {
      invoke: MockedFunction<any>
      listen: MockedFunction<any>
      emit: MockedFunction<any>
      reset: () => void
      setInvokeResponse: (command: string, response: any) => void
      setInvokeError: (command: string, error: any) => void
    }
  }

  var mockTauri: {
    invoke: MockedFunction<any>
    listen: MockedFunction<any>
    emit: MockedFunction<any>
    reset: () => void
    setInvokeResponse: (command: string, response: any) => void
    setInvokeError: (command: string, error: any) => void
  }
}

export {}
