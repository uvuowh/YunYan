<template>
  <div class="whiteboard-page">
    <header class="page-header">
      <h1>YunYan 白板</h1>
      <div class="header-controls">
        <button @click="toggleDebug" class="debug-toggle">
          {{ showDebug ? '隐藏调试' : '显示调试' }}
        </button>
        <button @click="resetView" class="reset-btn">重置视图</button>
      </div>
    </header>

    <main class="whiteboard-main">
      <div v-if="showCanvas">
        <WhiteboardCanvas :show-debug="showDebug" ref="whiteboardRef" />
      </div>
      <div v-else class="loading">正在加载白板组件...</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import WhiteboardCanvas from '@/components/whiteboard/WhiteboardCanvas.vue'
import { ref } from 'vue'

// 状态
const showDebug = ref(true)
const showCanvas = ref(true)
const whiteboardRef = ref<InstanceType<typeof WhiteboardCanvas>>()

// 方法
const toggleDebug = () => {
  showDebug.value = !showDebug.value
}

const resetView = () => {
  // 调用白板组件的重置方法
  if (whiteboardRef.value) {
    // 通过ref访问子组件的方法
    ;(whiteboardRef.value as any).resetView?.()
  }
}
</script>

<style scoped>
.whiteboard-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-controls {
  display: flex;
  gap: 12px;
}

.debug-toggle,
.reset-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.debug-toggle:hover,
.reset-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.whiteboard-main {
  flex: 1;
  overflow: hidden;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #666;
}
</style>
