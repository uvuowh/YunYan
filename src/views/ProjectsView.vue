<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Projects</h1>
      <BaseButton variant="primary" @click="handleNewProject">
        <template #icon-left>➕</template>
        New Project
      </BaseButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard
        v-for="project in projects"
        :key="project.id"
        :title="project.name"
        :description="project.description"
        variant="bordered"
        hoverable
        clickable
        @click="handleProjectClick(project)"
      >
        <template #image>
          <div class="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span class="text-4xl">{{ project.icon }}</span>
          </div>
        </template>

        <div class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-base-content/70">Progress</span>
            <span class="text-sm font-medium">{{ project.progress }}%</span>
          </div>
          <div class="w-full bg-base-300 rounded-full h-2">
            <div 
              class="bg-primary h-2 rounded-full transition-all duration-300"
              :style="{ width: `${project.progress}%` }"
            ></div>
          </div>
        </div>

        <template #actions>
          <BaseButton variant="ghost" size="sm" @click.stop="handleEditProject(project)">
            Edit
          </BaseButton>
          <BaseButton variant="ghost" size="sm" @click.stop="handleDeleteProject(project)">
            Delete
          </BaseButton>
        </template>
      </BaseCard>

      <!-- Empty state -->
      <div v-if="projects.length === 0" class="col-span-full text-center py-12">
        <div class="text-6xl mb-4">📁</div>
        <h3 class="text-xl font-semibold mb-2">No projects yet</h3>
        <p class="text-base-content/70 mb-4">Create your first project to get started</p>
        <BaseButton variant="primary" @click="handleNewProject">
          Create Project
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

interface Project {
  id: string
  name: string
  description: string
  icon: string
  progress: number
  createdAt: Date
}

const projects = ref<Project[]>([
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Modern UI/UX improvements for the company website',
    icon: '🎨',
    progress: 75,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'Cross-platform mobile application development',
    icon: '📱',
    progress: 45,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Third-party service integration and optimization',
    icon: '🔌',
    progress: 90,
    createdAt: new Date(),
  },
])

function handleNewProject(): void {
  appStore.showInfo('New Project', 'Project creation feature coming soon!')
}

function handleProjectClick(project: Project): void {
  appStore.showInfo('Project Details', `Opening ${project.name} details...`)
}

function handleEditProject(project: Project): void {
  appStore.showInfo('Edit Project', `Editing ${project.name}...`)
}

function handleDeleteProject(project: Project): void {
  appStore.showWarning('Delete Project', `Are you sure you want to delete ${project.name}?`)
}
</script>
