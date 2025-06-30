<template>
  <header class="navbar bg-base-100 shadow-sm border-b border-base-300">
    <div class="container mx-auto">
      <!-- Logo/Brand -->
      <div class="navbar-start">
        <router-link to="/" class="btn btn-ghost text-xl font-bold">
          YunYan
        </router-link>
      </div>
      
      <!-- Navigation Menu (Desktop) -->
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          <li>
            <router-link to="/" class="btn btn-ghost">
              Home
            </router-link>
          </li>
          <li>
            <router-link to="/dashboard" class="btn btn-ghost">
              Dashboard
            </router-link>
          </li>
          <li>
            <router-link to="/settings" class="btn btn-ghost">
              Settings
            </router-link>
          </li>
        </ul>
      </div>
      
      <!-- User Actions -->
      <div class="navbar-end">
        <!-- Theme Toggle -->
        <button
          class="btn btn-ghost btn-circle mr-2"
          @click="themeStore.toggleTheme()"
          :title="themeStore.themeLabel"
        >
          {{ themeStore.themeIcon }}
        </button>
        
        <!-- User Menu -->
        <div v-if="userStore.isAuthenticated" class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
              <img
                v-if="userStore.userAvatar"
                :src="userStore.userAvatar"
                :alt="userStore.userName"
              />
              <div
                v-else
                class="w-full h-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium"
              >
                {{ userStore.userName.charAt(0).toUpperCase() }}
              </div>
            </div>
          </div>
          
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <router-link to="/profile" class="justify-between">
                Profile
                <span class="badge">New</span>
              </router-link>
            </li>
            <li><router-link to="/settings">Settings</router-link></li>
            <li><button @click="handleLogout">Logout</button></li>
          </ul>
        </div>
        
        <!-- Login Button (when not authenticated) -->
        <router-link
          v-else
          to="/login"
          class="btn btn-primary"
        >
          Login
        </router-link>
        
        <!-- Mobile Menu Toggle -->
        <div class="dropdown dropdown-end lg:hidden ml-2">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </div>
          
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/dashboard">Dashboard</router-link></li>
            <li><router-link to="/settings">Settings</router-link></li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useThemeStore, useUserStore, useAppStore } from '@/stores'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const appStore = useAppStore()

async function handleLogout(): Promise<void> {
  try {
    userStore.logout()
    appStore.showSuccess('Logged out', 'You have been successfully logged out')
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    appStore.showError('Logout failed', 'An error occurred while logging out')
  }
}
</script>
