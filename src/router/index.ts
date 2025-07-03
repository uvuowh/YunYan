import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import views
const Dashboard = () => import('@/views/Dashboard.vue')
const Files = () => import('@/views/Files.vue')
const Canvas = () => import('@/views/Canvas.vue')
const Settings = () => import('@/views/Settings.vue')

// Define routes
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard',
    },
  },
  {
    path: '/files',
    name: 'Files',
    component: Files,
    meta: {
      title: 'Files',
    },
  },
  {
    path: '/canvas',
    name: 'Canvas',
    component: Canvas,
    meta: {
      title: 'Canvas',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: 'Settings',
    },
  },
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - YunYan`
  } else {
    document.title = 'YunYan'
  }

  next()
})

export default router
