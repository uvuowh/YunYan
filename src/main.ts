import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores'

// Import global styles
import './assets/styles/main.css'

// Create Vue app
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()

// Use plugins
app.use(pinia)
app.use(router)

// Initialize theme after Pinia is available
const themeStore = useThemeStore()
themeStore.initializeTheme()

// Mount app
app.mount('#app')
