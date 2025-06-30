<template>
  <div class="main-layout" :class="{ 'dark': isDarkMode }">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <h1 class="app-title">云雁</h1>
        <nav class="view-switcher">
          <router-link
            v-for="view in views"
            :key="view.key"
            :to="view.path"
            :class="['view-btn', { active: $route.path === view.path }]"
          >
            {{ view.label }}
          </router-link>
        </nav>
      </div>
      <div class="header-right">
        <button class="icon-btn" @click="toggleTheme" title="切换主题">
          <span v-if="isDarkMode">🌙</span>
          <span v-else>☀️</span>
        </button>
        <router-link to="/settings" class="icon-btn" title="设置">
          ⚙️
        </router-link>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Sidebar -->
      <aside class="sidebar" v-if="showSidebar">
        <slot name="sidebar">
          <div class="sidebar-content">
            <h3>侧边栏</h3>
            <p>这里是侧边栏内容</p>
          </div>
        </slot>
      </aside>

      <!-- Content -->
      <section class="content-area">
        <slot name="content">
          <router-view />
        </slot>
      </section>

      <!-- Right Panel (optional) -->
      <aside class="right-panel" v-if="showRightPanel">
        <slot name="right-panel">
          <div class="panel-content">
            <h3>右侧面板</h3>
            <p>这里是右侧面板内容</p>
          </div>
        </slot>
      </aside>
    </main>

    <!-- Status Bar -->
    <footer class="status-bar">
      <div class="status-left">
        <span class="status-item">{{ $route.meta?.title || $route.name }}</span>
        <span class="status-item" v-if="isLoading">加载中...</span>
      </div>
      <div class="status-right">
        <span class="status-item">{{ new Date().toLocaleTimeString() }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'

interface Props {
  showSidebar?: boolean
  showRightPanel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSidebar: true,
  showRightPanel: false
})

const appStore = useAppStore()

const views = [
  { key: 'notes', label: '笔记', path: '/notes' },
  { key: 'whiteboard', label: '白板', path: '/whiteboard' },
  { key: 'hybrid', label: '混合', path: '/hybrid' }
] as const

// Computed properties
const isDarkMode = computed(() => appStore.isDarkMode)
const isLoading = computed(() => appStore.isLoading)

// Actions
const { toggleTheme } = appStore
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  min-height: 3rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.view-switcher {
  display: flex;
  gap: 0.25rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

.view-btn.active {
  background-color: var(--accent-color);
  color: white;
}

.header-right {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.icon-btn:hover {
  background-color: var(--bg-hover);
}

/* Main Content */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 250px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.sidebar-content {
  padding: 1rem;
}

.content-area {
  flex: 1;
  overflow: auto;
  background-color: var(--bg-primary);
}

.default-content {
  padding: 2rem;
  text-align: center;
}

.right-panel {
  width: 300px;
  background-color: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
}

.panel-content {
  padding: 1rem;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 1rem;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 0.875rem;
  min-height: 1.5rem;
}

.status-left,
.status-right {
  display: flex;
  gap: 1rem;
}

.status-item {
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-left {
    gap: 1rem;
  }
  
  .view-switcher {
    display: none;
  }
  
  .sidebar {
    width: 200px;
  }
  
  .right-panel {
    display: none;
  }
}

@media (max-width: 640px) {
  .sidebar {
    position: absolute;
    left: -250px;
    height: 100%;
    z-index: 10;
    transition: left 0.3s ease;
  }
  
  .sidebar.open {
    left: 0;
  }
}
</style>
