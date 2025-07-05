import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueKonva from 'vue-konva'
// 尝试直接导入Konva确保它可用
import Konva from 'konva'
import { useCanvasStore } from './store/canvas'

// 确保Konva在全局可用
window.Konva = Konva

// TypeScript类型声明
declare global {
  interface Window {
    Konva: typeof Konva
    __YUNYAN_STORE__: ReturnType<typeof useCanvasStore>
  }
}

const pinia = createPinia()
const app = createApp(App)

app.use(router).use(pinia).use(VueKonva)

// 在应用挂载后初始化 store
app.mount('#app')

// 初始化 canvas store
const store = useCanvasStore()
store.initialize()

// 为E2E测试暴露store到全局
if (typeof window !== 'undefined') {
  window.__YUNYAN_STORE__ = store
}
