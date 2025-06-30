<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Profile</h1>
      <BaseButton variant="outline" @click="handleEditMode">
        {{ isEditing ? 'Cancel' : 'Edit Profile' }}
      </BaseButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Info -->
      <div class="lg:col-span-1">
        <BaseCard variant="bordered">
          <div class="text-center">
            <div class="w-24 h-24 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <span class="text-3xl">{{ userStore.userName.charAt(0).toUpperCase() }}</span>
            </div>
            <h2 class="text-xl font-bold">{{ userStore.userName }}</h2>
            <p class="text-base-content/70">{{ userStore.userEmail }}</p>
            <div class="mt-4">
              <span class="badge badge-primary">Active</span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Profile Details -->
      <div class="lg:col-span-2">
        <BaseCard title="Personal Information" variant="bordered">
          <form @submit.prevent="handleSave" class="space-y-4">
            <BaseInput
              v-model="profileForm.name"
              label="Full Name"
              :readonly="!isEditing"
              required
            />

            <BaseInput
              v-model="profileForm.email"
              label="Email"
              type="email"
              :readonly="!isEditing"
              required
            />

            <BaseInput
              v-model="profileForm.phone"
              label="Phone Number"
              type="tel"
              :readonly="!isEditing"
            />

            <BaseInput
              v-model="profileForm.location"
              label="Location"
              :readonly="!isEditing"
            />

            <div class="form-control">
              <label class="label">
                <span class="label-text">Bio</span>
              </label>
              <textarea
                v-model="profileForm.bio"
                class="textarea textarea-bordered"
                :readonly="!isEditing"
                rows="4"
                placeholder="Tell us about yourself..."
              ></textarea>
            </div>

            <div v-if="isEditing" class="flex space-x-4">
              <BaseButton type="submit" variant="primary">
                Save Changes
              </BaseButton>
              <BaseButton type="button" variant="outline" @click="handleCancel">
                Cancel
              </BaseButton>
            </div>
          </form>
        </BaseCard>
      </div>
    </div>

    <!-- Activity Section -->
    <BaseCard title="Recent Activity" variant="bordered">
      <div class="space-y-4">
        <div
          v-for="activity in recentActivity"
          :key="activity.id"
          class="flex items-start space-x-3 p-3 bg-base-200 rounded-lg"
        >
          <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-sm">{{ activity.icon }}</span>
          </div>
          <div class="flex-1">
            <p class="text-sm">{{ activity.message }}</p>
            <p class="text-xs text-base-content/70">{{ activity.timestamp }}</p>
          </div>
        </div>

        <div v-if="recentActivity.length === 0" class="text-center py-8 text-base-content/70">
          <span class="text-4xl block mb-2">📊</span>
          No recent activity
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useUserStore, useAppStore } from '@/stores'

const userStore = useUserStore()
const appStore = useAppStore()

const isEditing = ref(false)

const profileForm = reactive({
  name: userStore.userName,
  email: userStore.userEmail,
  phone: '',
  location: '',
  bio: '',
})

const originalForm = { ...profileForm }

interface Activity {
  id: string
  message: string
  icon: string
  timestamp: string
}

const recentActivity = ref<Activity[]>([
  {
    id: '1',
    message: 'Updated profile information',
    icon: '👤',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    message: 'Completed task "Design homepage"',
    icon: '✅',
    timestamp: '1 day ago',
  },
  {
    id: '3',
    message: 'Joined project "Mobile App"',
    icon: '📱',
    timestamp: '3 days ago',
  },
])

function handleEditMode(): void {
  if (isEditing.value) {
    handleCancel()
  } else {
    isEditing.value = true
  }
}

function handleSave(): void {
  userStore.updateProfile({
    name: profileForm.name,
    email: profileForm.email,
  })
  
  isEditing.value = false
  appStore.showSuccess('Profile Updated', 'Your profile has been updated successfully')
}

function handleCancel(): void {
  Object.assign(profileForm, originalForm)
  isEditing.value = false
}
</script>
