<template>
  <aside class="bg-base-100 rounded-lg shadow-sm border border-base-300 p-4">
    <nav class="space-y-2">
      <div class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
        Navigation
      </div>
      
      <router-link
        v-for="item in navigationItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
        :class="isActiveRoute(item.path) ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-base-200'"
      >
        <span class="mr-3 text-lg">{{ item.icon }}</span>
        {{ item.label }}
        <span v-if="item.badge" class="ml-auto badge badge-sm">{{ item.badge }}</span>
      </router-link>
      
      <div class="divider my-4"></div>
      
      <div class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
        Tools
      </div>
      
      <router-link
        v-for="tool in toolItems"
        :key="tool.path"
        :to="tool.path"
        class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
        :class="isActiveRoute(tool.path) ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-base-200'"
      >
        <span class="mr-3 text-lg">{{ tool.icon }}</span>
        {{ tool.label }}
      </router-link>
    </nav>
    
    <!-- Quick Actions -->
    <div class="mt-8 pt-4 border-t border-base-300">
      <div class="text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-3">
        Quick Actions
      </div>
      
      <div class="space-y-2">
        <BaseButton
          variant="ghost"
          size="sm"
          block
          @click="handleNewProject"
        >
          <template #icon-left>📁</template>
          New Project
        </BaseButton>
        
        <BaseButton
          variant="ghost"
          size="sm"
          block
          @click="handleImport"
        >
          <template #icon-left>📥</template>
          Import
        </BaseButton>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAppStore } from '@/stores'

const route = useRoute()
const appStore = useAppStore()

interface NavigationItem {
  path: string
  label: string
  icon: string
  badge?: string
}

const navigationItems: NavigationItem[] = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/projects', label: 'Projects', icon: '📁', badge: '3' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
]

const toolItems: NavigationItem[] = [
  { path: '/block-system', label: 'Block System', icon: '🧩' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
  { path: '/help', label: 'Help', icon: '❓' },
  { path: '/feedback', label: 'Feedback', icon: '💬' },
]

function isActiveRoute(path: string): boolean {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

function handleNewProject(): void {
  appStore.showInfo('New Project', 'New project feature coming soon!')
}

function handleImport(): void {
  appStore.showInfo('Import', 'Import feature coming soon!')
}
</script>
