<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Settings</h1>
      <BaseButton variant="outline" @click="handleReset">
        Reset to Defaults
      </BaseButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Settings Navigation -->
      <div class="lg:col-span-1">
        <BaseCard variant="bordered">
          <nav class="space-y-1">
            <button
              v-for="section in settingSections"
              :key="section.id"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                activeSection === section.id
                  ? 'bg-primary text-primary-content'
                  : 'hover:bg-base-200'
              ]"
              @click="activeSection = section.id"
            >
              <span class="mr-2">{{ section.icon }}</span>
              {{ section.label }}
            </button>
          </nav>
        </BaseCard>
      </div>

      <!-- Settings Content -->
      <div class="lg:col-span-2">
        <!-- Appearance Settings -->
        <BaseCard
          v-if="activeSection === 'appearance'"
          title="Appearance"
          variant="bordered"
        >
          <div class="space-y-6">
            <div>
              <label class="label">
                <span class="label-text font-medium">Theme</span>
              </label>
              <div class="flex space-x-2">
                <BaseButton
                  v-for="theme in themes"
                  :key="theme.value"
                  :variant="themeStore.currentTheme === theme.value ? 'primary' : 'outline'"
                  size="sm"
                  @click="themeStore.setTheme(theme.value)"
                >
                  <template #icon-left>{{ theme.icon }}</template>
                  {{ theme.label }}
                </BaseButton>
              </div>
            </div>

            <div>
              <label class="label">
                <span class="label-text font-medium">Font Size</span>
              </label>
              <select class="select select-bordered w-full max-w-xs">
                <option>Small</option>
                <option selected>Medium</option>
                <option>Large</option>
              </select>
            </div>
          </div>
        </BaseCard>

        <!-- Account Settings -->
        <BaseCard
          v-if="activeSection === 'account'"
          title="Account"
          variant="bordered"
        >
          <div class="space-y-6">
            <BaseInput
              v-model="userForm.name"
              label="Display Name"
              placeholder="Enter your display name"
            />

            <BaseInput
              v-model="userForm.email"
              label="Email"
              type="email"
              placeholder="Enter your email"
            />

            <div class="flex space-x-4">
              <BaseButton variant="primary" @click="handleSaveProfile">
                Save Changes
              </BaseButton>
              <BaseButton variant="outline" @click="handleChangePassword">
                Change Password
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- Notifications Settings -->
        <BaseCard
          v-if="activeSection === 'notifications'"
          title="Notifications"
          variant="bordered"
        >
          <div class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Email Notifications</span>
                <input
                  v-model="notificationSettings.email"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Push Notifications</span>
                <input
                  v-model="notificationSettings.push"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Desktop Notifications</span>
                <input
                  v-model="notificationSettings.desktop"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>
          </div>
        </BaseCard>

        <!-- Privacy Settings -->
        <BaseCard
          v-if="activeSection === 'privacy'"
          title="Privacy"
          variant="bordered"
        >
          <div class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Profile Visible to Others</span>
                <input
                  v-model="privacySettings.profileVisible"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Activity Visible to Others</span>
                <input
                  v-model="privacySettings.activityVisible"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <div class="divider"></div>

            <div class="space-y-2">
              <BaseButton variant="outline" block @click="handleExportData">
                Export My Data
              </BaseButton>
              <BaseButton variant="error" block @click="handleDeleteAccount">
                Delete Account
              </BaseButton>
            </div>
          </div>
        </BaseCard>

        <!-- About Settings -->
        <BaseCard
          v-if="activeSection === 'about'"
          title="About"
          variant="bordered"
        >
          <div class="space-y-4">
            <div class="text-center">
              <h3 class="text-xl font-bold">YunYan</h3>
              <p class="text-base-content/70">Version 1.0.0</p>
            </div>

            <div class="stats stats-vertical w-full">
              <div class="stat">
                <div class="stat-title">Built with</div>
                <div class="stat-value text-sm">Vue 3 + TypeScript + Tauri</div>
              </div>
              <div class="stat">
                <div class="stat-title">Last Updated</div>
                <div class="stat-value text-sm">{{ new Date().toLocaleDateString() }}</div>
              </div>
            </div>

            <div class="space-y-2">
              <BaseButton variant="outline" block @click="handleCheckUpdates">
                Check for Updates
              </BaseButton>
              <BaseButton variant="ghost" block @click="handleViewLogs">
                View Logs
              </BaseButton>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useThemeStore, useUserStore, useAppStore } from '@/stores'

const themeStore = useThemeStore()
const userStore = useUserStore()
const appStore = useAppStore()

const activeSection = ref('appearance')

const settingSections = [
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'about', label: 'About', icon: 'ℹ️' },
]

const themes = [
  { value: 'light' as const, label: 'Light', icon: '☀️' },
  { value: 'dark' as const, label: 'Dark', icon: '🌙' },
  { value: 'auto' as const, label: 'Auto', icon: '🔄' },
]

const userForm = reactive({
  name: userStore.userName,
  email: userStore.userEmail,
})

const notificationSettings = reactive({
  email: userStore.userPreferences?.notifications.email ?? true,
  push: userStore.userPreferences?.notifications.push ?? true,
  desktop: userStore.userPreferences?.notifications.desktop ?? false,
})

const privacySettings = reactive({
  profileVisible: userStore.userPreferences?.privacy.profileVisible ?? true,
  activityVisible: userStore.userPreferences?.privacy.activityVisible ?? false,
})

function handleSaveProfile(): void {
  userStore.updateProfile({
    name: userForm.name,
    email: userForm.email,
  })
  
  userStore.updatePreferences({
    notifications: notificationSettings,
    privacy: privacySettings,
  })
  
  appStore.showSuccess('Settings Saved', 'Your profile has been updated successfully')
}

function handleChangePassword(): void {
  appStore.showInfo('Change Password', 'Password change feature coming soon!')
}

function handleReset(): void {
  appStore.showWarning('Reset Settings', 'Reset to defaults feature coming soon!')
}

function handleExportData(): void {
  appStore.showInfo('Export Data', 'Data export feature coming soon!')
}

function handleDeleteAccount(): void {
  appStore.showError('Delete Account', 'Account deletion feature coming soon!')
}

function handleCheckUpdates(): void {
  appStore.showInfo('Check Updates', 'Update check feature coming soon!')
}

function handleViewLogs(): void {
  appStore.showInfo('View Logs', 'Log viewer feature coming soon!')
}
</script>
