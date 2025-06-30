<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Tasks</h1>
      <BaseButton variant="primary" @click="handleNewTask">
        <template #icon-left>➕</template>
        New Task
      </BaseButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- To Do -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold flex items-center">
          <span class="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
          To Do ({{ todoTasks.length }})
        </h2>
        <div class="space-y-3">
          <TaskCard
            v-for="task in todoTasks"
            :key="task.id"
            :task="task"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
            @status-change="handleStatusChange"
          />
        </div>
      </div>

      <!-- In Progress -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold flex items-center">
          <span class="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
          In Progress ({{ inProgressTasks.length }})
        </h2>
        <div class="space-y-3">
          <TaskCard
            v-for="task in inProgressTasks"
            :key="task.id"
            :task="task"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
            @status-change="handleStatusChange"
          />
        </div>
      </div>

      <!-- Done -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold flex items-center">
          <span class="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
          Done ({{ doneTasks.length }})
        </h2>
        <div class="space-y-3">
          <TaskCard
            v-for="task in doneTasks"
            :key="task.id"
            :task="task"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
            @status-change="handleStatusChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TaskCard from '@/components/app/TaskCard.vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  assignee?: string
}

const tasks = ref<Task[]>([
  {
    id: '1',
    title: 'Design homepage mockup',
    description: 'Create wireframes and mockups for the new homepage design',
    status: 'todo',
    priority: 'high',
    dueDate: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Set up login and registration functionality',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all API endpoints and their usage',
    status: 'todo',
    priority: 'medium',
  },
  {
    id: '4',
    title: 'Set up CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    status: 'done',
    priority: 'medium',
  },
])

const todoTasks = computed(() => tasks.value.filter(task => task.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter(task => task.status === 'in-progress'))
const doneTasks = computed(() => tasks.value.filter(task => task.status === 'done'))

function handleNewTask(): void {
  appStore.showInfo('New Task', 'Task creation feature coming soon!')
}

function handleEditTask(task: Task): void {
  appStore.showInfo('Edit Task', `Editing ${task.title}...`)
}

function handleDeleteTask(task: Task): void {
  appStore.showWarning('Delete Task', `Are you sure you want to delete "${task.title}"?`)
}

function handleStatusChange(task: Task, newStatus: Task['status']): void {
  const taskIndex = tasks.value.findIndex(t => t.id === task.id)
  if (taskIndex !== -1) {
    tasks.value[taskIndex].status = newStatus
    appStore.showSuccess('Task Updated', `Task moved to ${newStatus.replace('-', ' ')}`)
  }
}
</script>
