import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores'

// Layouts
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Views
import HomeView from '@/views/HomeView.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import SettingsView from '@/views/SettingsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView,
        meta: {
          title: 'Home',
          requiresAuth: false,
        },
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: {
          title: 'Dashboard',
          requiresAuth: true,
        },
      },
      {
        path: '/settings',
        name: 'Settings',
        component: SettingsView,
        meta: {
          title: 'Settings',
          requiresAuth: true,
        },
      },
      {
        path: '/projects',
        name: 'Projects',
        component: () => import('@/views/ProjectsView.vue'),
        meta: {
          title: 'Projects',
          requiresAuth: true,
        },
      },
      {
        path: '/tasks',
        name: 'Tasks',
        component: () => import('@/views/TasksView.vue'),
        meta: {
          title: 'Tasks',
          requiresAuth: true,
        },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: {
          title: 'Profile',
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        name: 'Login',
        component: LoginView,
        meta: {
          title: 'Login',
          requiresAuth: false,
          hideForAuth: true,
        },
      },
      {
        path: '/register',
        name: 'Register',
        component: RegisterView,
        meta: {
          title: 'Register',
          requiresAuth: false,
          hideForAuth: true,
        },
      },
    ],
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Page Not Found',
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - YunYan`
  }
  
  // Check authentication requirements
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Redirect authenticated users away from auth pages
  if (to.meta.hideForAuth && userStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }
  
  next()
})

export default router
