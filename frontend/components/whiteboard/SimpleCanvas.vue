<template>
  <div class="simple-canvas">
    <h2>简单画布测试</h2>
    <canvas
      ref="canvasRef"
      width="800"
      height="600"
      style="border: 1px solid #ccc; background: #f9f9f9"
      @click="handleClick"
    ></canvas>
    <p>点击画布测试功能</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement>()

const handleClick = (event: MouseEvent) => {
  console.log('Canvas clicked:', event.offsetX, event.offsetY)

  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#007bff'
      ctx.beginPath()
      ctx.arc(event.offsetX, event.offsetY, 5, 0, 2 * Math.PI)
      ctx.fill()
    }
  }
}

onMounted(() => {
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#333'
      ctx.font = '20px Arial'
      ctx.fillText('简单画布测试 - 点击添加圆点', 50, 50)
    }
  }
})
</script>

<style scoped>
.simple-canvas {
  padding: 20px;
  text-align: center;
}

.simple-canvas h2 {
  margin-bottom: 20px;
  color: #333;
}

.simple-canvas p {
  margin-top: 10px;
  color: #666;
}
</style>
