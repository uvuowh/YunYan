import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueKonva from 'vue-konva'
import { useCanvasStore } from './store/canvas'

const pinia = createPinia()
const app = createApp(App)

app.use(router).use(pinia).use(VueKonva)

// 在应用挂载后初始化 store
app.mount('#app')

// 初始化 canvas store
const store = useCanvasStore()
store.initialize()
