import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initializeStores } from '@/core/stores'

// Import global styles
import '@/assets/scss/index.scss'

async function bootstrap() {
  const app = createApp(App)

  // Install Pinia
  const pinia = createPinia()
  app.use(pinia)

  // Install Router
  app.use(router)

  // Initialize stores
  try {
    await initializeStores()
  } catch (error) {
    console.error('Failed to initialize stores:', error)
  }

  // Mount app
  app.mount('#app')
}

bootstrap()
