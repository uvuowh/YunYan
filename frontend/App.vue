<script setup lang="ts">
import { useAppStore, useSystemStore } from '@/stores'
import { commands } from '@/tauri'
import { onMounted, ref } from 'vue'

const appStore = useAppStore()
const systemStore = useSystemStore()

const greetMsg = ref('')
const name = ref('')

async function greet() {
  if (!name.value.trim()) {
    appStore.notifyWarning('输入错误', '请输入姓名')
    return
  }

  try {
    const response = await commands.greet({ name: name.value })
    if (response.success && response.data) {
      greetMsg.value = response.data.message
      appStore.notifySuccess('问候成功', `已向 ${name.value} 发送问候`)
    } else {
      appStore.notifyError('问候失败', response.error || '未知错误')
    }
  } catch (error) {
    console.error('Greet failed:', error)
    appStore.notifyError('问候失败', '网络或系统错误')
  }
}

onMounted(async () => {
  try {
    await appStore.initialize()
  } catch (error) {
    console.error('App initialization failed:', error)
  }
})
</script>

<template>
  <main class="container">
    <!-- 加载状态 -->
    <div v-if="appStore.isLoading" class="loading">
      <p>正在初始化应用...</p>
    </div>

    <!-- 主要内容 -->
    <div v-else>
      <h1>Welcome to YunYan</h1>
      <p class="subtitle">基于 Tauri + Vue + TypeScript 的现代化桌面应用</p>

      <!-- 系统信息 -->
      <div v-if="systemStore.systemInfo" class="system-info">
        <h3>系统信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">平台:</span>
            <span class="value">{{ systemStore.systemInfo.platform }}</span>
          </div>
          <div class="info-item">
            <span class="label">架构:</span>
            <span class="value">{{ systemStore.systemInfo.arch }}</span>
          </div>
          <div class="info-item">
            <span class="label">在线状态:</span>
            <span
              class="value"
              :class="{ online: systemStore.isOnline, offline: !systemStore.isOnline }"
            >
              {{ systemStore.isOnline ? '在线' : '离线' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 问候功能 -->
      <div class="greet-section">
        <h3>问候功能演示</h3>
        <form class="row" @submit.prevent="greet">
          <input
            id="greet-input"
            v-model="name"
            placeholder="请输入姓名..."
            :disabled="appStore.isLoading"
          />
          <button type="submit" :disabled="appStore.isLoading || !name.trim()">问候</button>
        </form>
        <p v-if="greetMsg" class="greet-result">{{ greetMsg }}</p>
      </div>

      <!-- 通知区域 -->
      <div v-if="appStore.hasNotifications" class="notifications">
        <h3>通知</h3>
        <div
          v-for="notification in appStore.notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type"
        >
          <div class="notification-content">
            <strong>{{ notification.title }}</strong>
            <p>{{ notification.message }}</p>
          </div>
          <button class="close-btn" @click="appStore.removeNotification(notification.id)">×</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.system-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.system-info h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  font-family: monospace;
  color: #333;
}

.value.online {
  color: #28a745;
  font-weight: 500;
}

.value.offline {
  color: #dc3545;
  font-weight: 500;
}

.greet-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.greet-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.greet-result {
  margin-top: 1rem;
  padding: 1rem;
  background: #e8f5e8;
  border-radius: 4px;
  color: #2d5a2d;
  border-left: 4px solid #28a745;
}

.notifications {
  margin-top: 2rem;
}

.notifications h3 {
  margin-bottom: 1rem;
  color: #333;
}

.notification {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border-left: 4px solid;
}

.notification.success {
  background: #e8f5e8;
  border-left-color: #28a745;
  color: #2d5a2d;
}

.notification.error {
  background: #f8e8e8;
  border-left-color: #dc3545;
  color: #5a2d2d;
}

.notification.warning {
  background: #fff3cd;
  border-left-color: #ffc107;
  color: #856404;
}

.notification.info {
  background: #e8f4f8;
  border-left-color: #17a2b8;
  color: #2d5a5a;
}

.notification-content {
  flex: 1;
}

.notification-content strong {
  display: block;
  margin-bottom: 0.25rem;
}

.notification-content p {
  margin: 0;
  font-size: 0.9rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0;
  margin-left: 1rem;
}

.close-btn:hover {
  opacity: 1;
}
</style>
<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 10vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: 0.75s;
}

.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #24c8db);
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}

#greet-input {
  margin-right: 5px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}
</style>
