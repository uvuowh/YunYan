<template>
  <BaseCard variant="bordered" class="hover:shadow-md transition-shadow">
    <div class="space-y-3">
      <div class="flex items-start justify-between">
        <h3 class="font-medium text-sm">{{ task.title }}</h3>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-xs">
            ⋮
          </div>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
            <li><button @click="$emit('edit', task)">Edit</button></li>
            <li><button @click="$emit('delete', task)" class="text-error">Delete</button></li>
          </ul>
        </div>
      </div>

      <p class="text-xs text-base-content/70">{{ task.description }}</p>

      <div class="flex items-center justify-between">
        <span :class="priorityClasses">{{ task.priority }}</span>
        <select
          :value="task.status"
          @change="handleStatusChange"
          class="select select-xs select-bordered"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div v-if="task.dueDate" class="text-xs text-base-content/70">
        Due: {{ formatDate(task.dueDate) }}
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  assignee?: string
}

interface Props {
  task: Task
}

interface Emits {
  edit: [task: Task]
  delete: [task: Task]
  'status-change': [task: Task, status: Task['status']]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const priorityClasses = computed(() => {
  const baseClasses = 'badge badge-xs'
  switch (props.task.priority) {
    case 'high':
      return `${baseClasses} badge-error`
    case 'medium':
      return `${baseClasses} badge-warning`
    case 'low':
      return `${baseClasses} badge-success`
    default:
      return baseClasses
  }
})

function handleStatusChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value as Task['status']
  emit('status-change', props.task, newStatus)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>
