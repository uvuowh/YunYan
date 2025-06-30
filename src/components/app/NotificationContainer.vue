<template>
  <Teleport to="body">
    <div class="toast toast-top toast-end z-50">
      <TransitionGroup
        name="notification"
        tag="div"
        class="space-y-2"
      >
        <div
          v-for="notification in appStore.notifications"
          :key="notification.id"
          :class="notificationClasses(notification)"
          class="alert shadow-lg max-w-sm cursor-pointer"
          @click="handleNotificationClick(notification)"
        >
          <div class="flex items-start">
            <span class="text-lg mr-2">{{ getNotificationIcon(notification.type) }}</span>
            
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm">{{ notification.title }}</div>
              <div class="text-xs opacity-90 mt-1">{{ notification.message }}</div>
              <div class="text-xs opacity-70 mt-1">
                {{ formatTime(notification.timestamp) }}
              </div>
            </div>
            
            <button
              class="btn btn-ghost btn-xs ml-2"
              @click.stop="appStore.removeNotification(notification.id)"
            >
              ✕
            </button>
          </div>
          
          <!-- Progress bar for timed notifications -->
          <div
            v-if="notification.duration && notification.duration > 0"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-100"
            :style="{ width: getProgressWidth(notification) }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useAppStore } from '@/stores'
import type { Notification } from '@/stores/app'

const appStore = useAppStore()
const currentTime = ref(Date.now())

let timeInterval: number | null = null

onMounted(() => {
  // Update current time every second for progress bars
  timeInterval = window.setInterval(() => {
    currentTime.value = Date.now()
  }, 100)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

function notificationClasses(notification: Notification): string {
  const baseClasses = 'alert'
  
  switch (notification.type) {
    case 'success':
      return `${baseClasses} alert-success`
    case 'error':
      return `${baseClasses} alert-error`
    case 'warning':
      return `${baseClasses} alert-warning`
    case 'info':
      return `${baseClasses} alert-info`
    default:
      return baseClasses
  }
}

function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'warning':
      return '⚠️'
    case 'info':
      return 'ℹ️'
    default:
      return 'ℹ️'
  }
}

function formatTime(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now'
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  } else {
    return timestamp.toLocaleDateString()
  }
}

function getProgressWidth(notification: Notification): string {
  if (!notification.duration || notification.duration <= 0) {
    return '0%'
  }
  
  const elapsed = currentTime.value - notification.timestamp.getTime()
  const progress = Math.max(0, Math.min(100, (elapsed / notification.duration) * 100))
  
  return `${progress}%`
}

function handleNotificationClick(notification: Notification): void {
  // Optional: Handle notification click (e.g., navigate to related page)
  console.log('Notification clicked:', notification)
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
