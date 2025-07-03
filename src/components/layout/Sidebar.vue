<template>
  <aside :class="sidebarClasses">
    <div class="sidebar-content">
      <!-- Logo/Brand section -->
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div v-if="!isCollapsed" class="brand-text">
          <span class="brand-name">YunYan</span>
        </div>
      </div>

      <!-- Navigation menu -->
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="nav-icon"
              >
                <path d="M13 3v6h8V3m-8 18h8V11h-8M3 21h8v-6H3m0-2h8V3H3v10Z" />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Dashboard</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/files" class="nav-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="nav-icon"
              >
                <path
                  d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"
                />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Files</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/canvas" class="nav-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="nav-icon"
              >
                <path
                  d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Canvas</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/settings" class="nav-link">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="nav-icon"
              >
                <path
                  d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
                />
              </svg>
              <span v-if="!isCollapsed" class="nav-label">Settings</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Sidebar footer -->
      <div class="sidebar-footer">
        <button
          class="collapse-toggle"
          @click="toggleCollapse"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            :class="{ 'rotate-180': isCollapsed }"
          >
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/core/stores/app'

const appStore = useAppStore()

const isCollapsed = computed(() => appStore.sidebarCollapsed)

const sidebarClasses = computed(() => {
  const baseClasses = [
    'sidebar',
    'flex',
    'flex-col',
    'bg-white',
    'border-r',
    'border-gray-200',
    'transition-all',
    'duration-300',
    'ease-in-out',
  ]

  const widthClasses = isCollapsed.value ? [] : []

  return [...baseClasses, ...widthClasses]
})

const toggleCollapse = () => {
  appStore.toggleSidebar()
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  min-height: calc(100vh - var(--header-height));
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-right: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  width: var(--sidebar-width-collapsed);
  transition: width var(--transition-base);
}

.sidebar:not(.w-16) {
  width: var(--sidebar-width-expanded);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: var(--header-height);
    z-index: 40;
    transform: translateX(-100%);
    transition: transform var(--transition-base);
  }

  .sidebar:not(.w-16) {
    transform: translateX(0);
    width: 280px;
  }

  .sidebar.w-16 {
    transform: translateX(-100%);
  }
}

.sidebar-content {
  @apply flex flex-col h-full;
}

.sidebar-brand {
  @apply flex items-center px-4 py-4 border-b border-gray-200;
}

.brand-logo {
  @apply flex-shrink-0 text-blue-600;
}

.brand-text {
  @apply ml-3 overflow-hidden;
}

.brand-name {
  @apply text-lg font-semibold text-gray-900 whitespace-nowrap;
}

.sidebar-nav {
  @apply flex-1 px-3 py-4 overflow-y-auto;
}

.nav-list {
  @apply space-y-1;
}

.nav-item {
  @apply relative;
}

.nav-link {
  @apply flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors;
}

.nav-link.router-link-active {
  @apply bg-blue-50 text-blue-700 border-r-2 border-blue-600;
}

.nav-button {
  @apply relative;
}

.nav-icon {
  @apply flex-shrink-0;
}

.nav-label {
  @apply ml-3 truncate;
}

.nav-badge {
  @apply ml-auto px-2 py-0.5 text-xs bg-gray-200 text-gray-800 rounded-full;
}

.submenu {
  @apply mt-1 space-y-1;
}

.submenu-item {
  @apply relative;
}

.sidebar-footer {
  @apply px-3 py-4 border-t border-gray-200;
}

.collapse-toggle {
  @apply w-full flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Dark mode styles */
[data-theme='dark'] .sidebar {
  @apply bg-gray-800 border-gray-700;
}

[data-theme='dark'] .sidebar-brand {
  @apply border-gray-700;
}

[data-theme='dark'] .brand-name {
  @apply text-gray-100;
}

[data-theme='dark'] .nav-link {
  @apply text-gray-300 hover:bg-gray-700 hover:text-gray-100;
}

[data-theme='dark'] .nav-link.router-link-active {
  @apply bg-blue-900 text-blue-200 border-blue-400;
}

[data-theme='dark'] .nav-button {
  @apply text-gray-300 hover:bg-gray-700 hover:text-gray-100;
}

[data-theme='dark'] .nav-button.bg-blue-50 {
  @apply bg-blue-900 text-blue-200 border-blue-400;
}

[data-theme='dark'] .nav-badge {
  @apply bg-gray-700 text-gray-300;
}

[data-theme='dark'] .sidebar-footer {
  @apply border-gray-700;
}

[data-theme='dark'] .collapse-toggle {
  @apply text-gray-400 hover:text-gray-100 hover:bg-gray-700;
}
</style>
