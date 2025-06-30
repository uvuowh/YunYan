<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold text-base-content">
          Welcome back, {{ userStore.userName }}!
        </h1>
        <p class="text-base-content/70 mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <BaseButton variant="primary" @click="handleNewProject">
          <template #icon-left>➕</template>
          New Project
        </BaseButton>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <BaseCard
        v-for="stat in stats"
        :key="stat.label"
        variant="bordered"
        class="text-center"
      >
        <div class="text-3xl mb-2">{{ stat.icon }}</div>
        <div class="text-2xl font-bold text-primary">{{ stat.value }}</div>
        <div class="text-sm text-base-content/70">{{ stat.label }}</div>
      </BaseCard>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Projects -->
      <div class="lg:col-span-2">
        <BaseCard title="Recent Projects" variant="bordered">
          <template #actions>
            <BaseButton variant="ghost" size="sm" @click="router.push('/projects')">
              View All
            </BaseButton>
          </template>

          <div class="space-y-3">
            <div
              v-for="project in recentProjects"
              :key="project.id"
              class="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors cursor-pointer"
              @click="handleProjectClick(project)"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span class="text-lg">{{ project.icon }}</span>
                </div>
                <div>
                  <div class="font-medium">{{ project.name }}</div>
                  <div class="text-sm text-base-content/70">{{ project.description }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium">{{ project.progress }}%</div>
                <div class="text-xs text-base-content/70">{{ project.lastUpdated }}</div>
              </div>
            </div>

            <div v-if="recentProjects.length === 0" class="text-center py-8 text-base-content/70">
              <span class="text-4xl block mb-2">📁</span>
              No projects yet. Create your first project to get started!
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Activity Feed -->
      <div>
        <BaseCard title="Recent Activity" variant="bordered">
          <div class="space-y-3">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-sm">{{ activity.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm">{{ activity.message }}</div>
                <div class="text-xs text-base-content/70">{{ activity.timestamp }}</div>
              </div>
            </div>

            <div v-if="recentActivity.length === 0" class="text-center py-8 text-base-content/70">
              <span class="text-4xl block mb-2">📊</span>
              No recent activity
            </div>
          </div>
        </BaseCard>
      </div>
    </div>

    <!-- Quick Actions -->
    <BaseCard title="Quick Actions" variant="bordered">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <BaseButton
          v-for="action in quickActions"
          :key="action.label"
          variant="ghost"
          class="h-20 flex-col"
          @click="action.handler"
        >
          <span class="text-2xl mb-1">{{ action.icon }}</span>
          <span class="text-sm">{{ action.label }}</span>
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useUserStore, useAppStore } from '@/stores'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

interface Project {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  lastUpdated: string
}

interface Activity {
  id: string
  message: string
  icon: string
  timestamp: string
}

interface QuickAction {
  label: string
  icon: string
  handler: () => void
}

// Mock data - replace with real data from your stores/API
const stats = computed(() => [
  { label: 'Total Projects', value: '12', icon: '📁' },
  { label: 'Active Tasks', value: '24', icon: '✅' },
  { label: 'Completed', value: '156', icon: '🎉' },
  { label: 'Team Members', value: '8', icon: '👥' },
])

const recentProjects = computed<Project[]>(() => [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Modern UI/UX improvements',
    icon: '🎨',
    progress: 75,
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Cross-platform mobile application',
    icon: '📱',
    progress: 45,
    lastUpdated: '1 day ago',
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Third-party service integration',
    icon: '🔌',
    progress: 90,
    lastUpdated: '3 days ago',
  },
])

const recentActivity = computed<Activity[]>(() => [
  {
    id: '1',
    message: 'Completed task "Update user interface"',
    icon: '✅',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    message: 'Created new project "Dashboard Analytics"',
    icon: '📊',
    timestamp: '1 hour ago',
  },
  {
    id: '3',
    message: 'Team member joined project',
    icon: '👥',
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    message: 'Deployed version 2.1.0',
    icon: '🚀',
    timestamp: '1 day ago',
  },
])

const quickActions = computed<QuickAction[]>(() => [
  {
    label: 'New Task',
    icon: '➕',
    handler: () => appStore.showInfo('New Task', 'Task creation feature coming soon!'),
  },
  {
    label: 'Import Data',
    icon: '📥',
    handler: () => appStore.showInfo('Import', 'Data import feature coming soon!'),
  },
  {
    label: 'Export Report',
    icon: '📊',
    handler: () => appStore.showInfo('Export', 'Report export feature coming soon!'),
  },
  {
    label: 'Settings',
    icon: '⚙️',
    handler: () => router.push('/settings'),
  },
])

function handleNewProject(): void {
  appStore.showInfo('New Project', 'Project creation feature coming soon!')
}

function handleProjectClick(project: Project): void {
  appStore.showInfo('Project Details', `Opening ${project.name} details...`)
}
</script>
