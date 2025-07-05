import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    // For now, let's just create a placeholder component for Home
    component: { template: '<div>Home Page</div>' },
  },
  {
    path: '/canvas',
    name: 'Canvas',
    component: () => import('../views/canvas/CanvasView.vue'),
  },
  {
    path: '/test-vue-konva',
    name: 'VueKonvaTest',
    component: () => import('../views/test/VueKonvaTest.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
