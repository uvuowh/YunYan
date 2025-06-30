<template>
  <div class="min-h-screen bg-base-200">
    <!-- Navigation Header -->
    <AppHeader />
    
    <!-- Main Content Area -->
    <main class="container mx-auto px-4 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar (optional) -->
        <aside v-if="showSidebar" class="w-full lg:w-64 flex-shrink-0">
          <AppSidebar />
        </aside>
        
        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <slot />
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <AppFooter />
    
    <!-- Global Notifications -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/app/AppHeader.vue'
import AppSidebar from '@/components/app/AppSidebar.vue'
import AppFooter from '@/components/app/AppFooter.vue'
import NotificationContainer from '@/components/app/NotificationContainer.vue'

interface Props {
  sidebar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  sidebar: true,
})

const route = useRoute()

const showSidebar = computed(() => {
  // Hide sidebar on certain routes or based on props
  const hideSidebarRoutes = ['/login', '/register', '/404']
  return props.sidebar && !hideSidebarRoutes.includes(route.path)
})
</script>
