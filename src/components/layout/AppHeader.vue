<template>
  <header class="app-header">
    <div class="header-left">
      <button
        class="sidebar-toggle"
        @click="toggleSidebar"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      
      <div class="app-title">
        <h1>{{ appTitle }}</h1>
        <span v-if="isDev" class="dev-badge">DEV</span>
      </div>
    </div>
    
    <div class="header-center">
      <slot name="center" />
    </div>
    
    <div class="header-right">
      <button
        class="theme-toggle"
        @click="toggleTheme"
        :aria-label="`Switch to ${isDark ? 'light' : 'dark'} theme`"
      >
        <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
        </svg>
      </button>
      
      <div class="user-menu">
        <button class="user-avatar" @click="toggleUserMenu">
          <span class="avatar-text">{{ userInitials }}</span>
        </button>
        
        <div v-if="showUserMenu" class="user-dropdown" @click.stop>
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div v-if="userEmail" class="user-email">{{ userEmail }}</div>
          </div>
          
          <div class="dropdown-divider"></div>
          
          <button class="dropdown-item" @click="handleSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z"/>
            </svg>
            Settings
          </button>
          
          <button class="dropdown-item" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9Z"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/core/stores/app'
import { useUserStore } from '@/core/stores/user'
import { useTheme } from '@/core/hooks/useTheme'

const appStore = useAppStore()
const userStore = useUserStore()
const { isDark, toggleTheme } = useTheme()

const showUserMenu = ref(false)

// Computed properties
const appTitle = computed(() => appStore.appTitle)
const isDev = computed(() => appStore.isDev)
const userName = computed(() => userStore.userName)
const userEmail = computed(() => userStore.userEmail)

const userInitials = computed(() => {
  const name = userName.value
  if (!name || name === 'Guest') return 'G'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

// Methods
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleSettings = () => {
  showUserMenu.value = false
  // TODO: Navigate to settings page
  console.log('Navigate to settings')
}

const handleLogout = async () => {
  showUserMenu.value = false
  await userStore.logout()
  // TODO: Navigate to login page or reset app state
  console.log('User logged out')
}

// Close user menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  @apply flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm;
  height: 64px;
}

.header-left {
  @apply flex items-center space-x-4;
}

.sidebar-toggle {
  @apply p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors;
}

.app-title {
  @apply flex items-center space-x-2;
}

.app-title h1 {
  @apply text-xl font-semibold text-gray-900;
}

.dev-badge {
  @apply px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full;
}

.header-center {
  @apply flex-1 flex justify-center;
}

.header-right {
  @apply flex items-center space-x-3;
}

.theme-toggle {
  @apply p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors;
}

.user-menu {
  @apply relative;
}

.user-avatar {
  @apply w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium hover:bg-blue-700 transition-colors;
}

.avatar-text {
  @apply select-none;
}

.user-dropdown {
  @apply absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50;
}

.user-info {
  @apply px-4 py-2;
}

.user-name {
  @apply font-medium text-gray-900;
}

.user-email {
  @apply text-sm text-gray-500;
}

.dropdown-divider {
  @apply border-t border-gray-200 my-2;
}

.dropdown-item {
  @apply w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors;
}

/* Dark mode styles */
[data-theme="dark"] .app-header {
  @apply bg-gray-800 border-gray-700;
}

[data-theme="dark"] .sidebar-toggle {
  @apply text-gray-400 hover:text-gray-100 hover:bg-gray-700;
}

[data-theme="dark"] .app-title h1 {
  @apply text-gray-100;
}

[data-theme="dark"] .dev-badge {
  @apply bg-yellow-900 text-yellow-200;
}

[data-theme="dark"] .theme-toggle {
  @apply text-gray-400 hover:text-gray-100 hover:bg-gray-700;
}

[data-theme="dark"] .user-dropdown {
  @apply bg-gray-800 border-gray-700;
}

[data-theme="dark"] .user-name {
  @apply text-gray-100;
}

[data-theme="dark"] .user-email {
  @apply text-gray-400;
}

[data-theme="dark"] .dropdown-divider {
  @apply border-gray-700;
}

[data-theme="dark"] .dropdown-item {
  @apply text-gray-300 hover:bg-gray-700;
}
</style>
