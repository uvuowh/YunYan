<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from '@/components/sidebar/Sidebar.vue';
import FileSidebar from '@/components/sidebar/FileSidebar.vue';
</script>

<template>
  <div class="app-container">
    <FileSidebar v-if="$route.path.includes('/canvas')" />
    <div class="main-content">
      <nav>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/canvas">Canvas</router-link>
        </div>

      </nav>
      <router-view />
    </div>
    <Sidebar v-if="$route.path.includes('/canvas')" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: var(--font-sans);
  background-color: var(--color-bg-primary);
}

.main-content {
  flex: 1;
  min-width: 0; /* 防止flex子元素溢出 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-bg-nav);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  z-index: 10;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

nav a {
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  margin: 0 1rem;
  padding: 0.5rem 0;
  transition: color 0.2s ease, border-color 0.2s ease;
}

nav a:hover {
  color: var(--color-text-primary);
}

nav a.router-link-exact-active {
  color: var(--color-accent-primary);
  border-bottom: 2px solid var(--color-accent-primary);
}
</style>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  --color-bg-primary: #f8f9fa; /* Off-white main background */
  --color-bg-secondary: #ffffff; /* White for cards, sidebars */
  --color-bg-nav: #ffffff;
  
  --color-border: #dee2e6; /* Subtle borders */

  --color-text-primary: #212529; /* Almost black for main text */
  --color-text-secondary: #6c757d; /* Gray for secondary text */

  --color-accent-primary: #42b983; /* Vue green */
  --color-accent-primary-hover: #36a071;
  --color-accent-secondary: #0d6efd; /* Bootstrap blue for selection */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

/* Reset and base styles */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
}
</style>