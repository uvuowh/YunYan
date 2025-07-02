<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>Settings</h1>
      <p>Configure your application preferences</p>
    </div>

    <div class="settings-layout">
      <nav class="settings-nav">
        <ul class="nav-list">
          <li>
            <router-link to="/settings/general" class="nav-link">
              General
            </router-link>
          </li>
          <li>
            <router-link to="/settings/appearance" class="nav-link">
              Appearance
            </router-link>
          </li>
        </ul>
      </nav>

      <main class="settings-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  @apply space-y-6;
}

.page-header h1 {
  @apply text-3xl font-bold text-gray-900 mb-2;
}

.page-header p {
  @apply text-gray-600;
}

.settings-layout {
  @apply grid grid-cols-1 md:grid-cols-4 gap-6;
}

.settings-nav {
  @apply md:col-span-1;
}

.nav-list {
  @apply space-y-1;
}

.nav-link {
  @apply block px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors;
}

.nav-link.router-link-active {
  @apply bg-blue-50 text-blue-700;
}

.settings-content {
  @apply md:col-span-3;
}

[data-theme="dark"] .page-header h1 {
  @apply text-gray-100;
}

[data-theme="dark"] .page-header p {
  @apply text-gray-400;
}

[data-theme="dark"] .nav-link {
  @apply text-gray-300 hover:bg-gray-700;
}

[data-theme="dark"] .nav-link.router-link-active {
  @apply bg-blue-900 text-blue-200;
}
</style>
