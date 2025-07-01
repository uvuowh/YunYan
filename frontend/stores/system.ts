// 系统状态管理
import type {
    DiskUsageEvent,
    ErrorEvent,
    NetworkStatusEvent,
    SystemInfoResponse,
} from '@shared/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useSystemStore = defineStore('system', () => {
  // 状态
  const systemInfo = ref<SystemInfoResponse | null>(null)
  const diskUsage = ref({
    total: 0,
    used: 0,
    available: 0,
    percentage: 0,
  })
  const networkStatus = ref({
    online: true,
    connectionType: 'unknown' as 'wifi' | 'ethernet' | 'cellular' | 'unknown',
  })
  const errors = ref<ErrorEvent[]>([])
  const isLoading = ref(false)

  // 计算属性
  const isOnline = computed(() => networkStatus.value.online)
  const diskUsageFormatted = computed(() => {
    const { total, used, available, percentage } = diskUsage.value
    return {
      total: formatBytes(total),
      used: formatBytes(used),
      available: formatBytes(available),
      percentage: `${percentage.toFixed(1)}%`,
    }
  })
  const hasErrors = computed(() => errors.value.length > 0)
  const criticalErrors = computed(() =>
    errors.value.filter(error => error.payload.severity === 'critical')
  )

  // 工具函数
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  // 动作
  async function loadSystemInfo() {
    isLoading.value = true
    try {
      // TODO: 实现 get_system_info 命令后启用
      // const response = await commands.getSystemInfo()
      // if (response.success && response.data) {
      //   systemInfo.value = response.data
      // }

      // 暂时使用模拟数据
      systemInfo.value = {
        platform: 'darwin',
        arch: 'x64',
        version: '1.0.0',
        totalMemory: 16 * 1024 * 1024 * 1024, // 16GB
        availableMemory: 8 * 1024 * 1024 * 1024, // 8GB
        cpuCount: 8,
      }
    } catch (error) {
      console.error('Failed to load system info:', error)
    } finally {
      isLoading.value = false
    }
  }

  function updateDiskUsage(event: DiskUsageEvent) {
    diskUsage.value = event.payload
  }

  function updateNetworkStatus(event: NetworkStatusEvent) {
    networkStatus.value = {
      online: event.payload.online,
      connectionType: event.payload.connectionType || 'unknown',
    }
  }

  function addError(event: ErrorEvent) {
    errors.value.unshift(event)
    // 保持最多 100 个错误记录
    if (errors.value.length > 100) {
      errors.value = errors.value.slice(0, 100)
    }
  }

  function clearErrors() {
    errors.value = []
  }

  function removeError(index: number) {
    errors.value.splice(index, 1)
  }

  // 初始化事件监听
  async function setupEventListeners() {
    try {
      // TODO: 实现事件系统后启用
      // await events.onDiskUsageUpdate(updateDiskUsage)
      // await events.onNetworkStatus(updateNetworkStatus)
      // await events.onError(addError)

      console.log('System event listeners setup successfully (mock)')
    } catch (error) {
      console.error('Failed to setup system event listeners:', error)
    }
  }

  // 初始化
  async function initialize() {
    await Promise.all([loadSystemInfo(), setupEventListeners()])
  }

  return {
    // 状态
    systemInfo,
    diskUsage,
    networkStatus,
    errors,
    isLoading,

    // 计算属性
    isOnline,
    diskUsageFormatted,
    hasErrors,
    criticalErrors,

    // 动作
    loadSystemInfo,
    updateDiskUsage,
    updateNetworkStatus,
    addError,
    clearErrors,
    removeError,
    setupEventListeners,
    initialize,
  }
})
