import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Lazy load components
const Home = () => import('@/views/Home.vue')
const Notes = () => import('@/views/Notes.vue')
const Whiteboard = () => import('@/views/Whiteboard.vue')
const Hybrid = () => import('@/views/Hybrid.vue')
const Settings = () => import('@/views/Settings.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes,
    meta: {
      title: '笔记'
    }
  },
  {
    path: '/whiteboard',
    name: 'Whiteboard',
    component: Whiteboard,
    meta: {
      title: '白板'
    }
  },
  {
    path: '/hybrid',
    name: 'Hybrid',
    component: Hybrid,
    meta: {
      title: '混合视图'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Update document title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 云雁`
  } else {
    document.title = '云雁'
  }
  
  next()
})

export default router
