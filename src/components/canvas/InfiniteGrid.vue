<template>
  <div
    ref="containerRef"
    class="infinite-grid-container"
    @wheel="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <svg
      ref="svgRef"
      class="infinite-grid-svg"
      :width="containerSize.width"
      :height="containerSize.height"
      :viewBox="viewBox"
    >
      <!-- Grid pattern definition -->
      <defs>
        <pattern
          id="grid-pattern"
          :width="gridSize * zoom"
          :height="gridSize * zoom"
          patternUnits="userSpaceOnUse"
          :x="gridOffset.x"
          :y="gridOffset.y"
        >
          <path
            :d="`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`"
            fill="none"
            :stroke="gridColor"
            :stroke-width="gridStrokeWidth"
          />
        </pattern>

        <!-- Major grid pattern (every 5 lines) -->
        <pattern
          id="major-grid-pattern"
          :width="gridSize * 5 * zoom"
          :height="gridSize * 5 * zoom"
          patternUnits="userSpaceOnUse"
          :x="gridOffset.x"
          :y="gridOffset.y"
        >
          <path
            :d="`M ${gridSize * 5 * zoom} 0 L 0 0 0 ${gridSize * 5 * zoom}`"
            fill="none"
            :stroke="majorGridColor"
            :stroke-width="majorGridStrokeWidth"
          />
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" :fill="backgroundColor" />

      <!-- Major grid -->
      <rect width="100%" height="100%" fill="url(#major-grid-pattern)" />

      <!-- Minor grid -->
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />

      <!-- Grid snap indicators -->
      <g
        v-if="showSnapIndicators"
        :transform="`translate(${pan.x}, ${pan.y}) scale(${zoom})`"
      >
        <circle
          v-for="indicator in snapIndicators"
          :key="`${indicator.x}-${indicator.y}`"
          :cx="indicator.x"
          :cy="indicator.y"
          r="3"
          fill="#10b981"
          opacity="0.8"
          class="snap-indicator"
        />
      </g>

      <!-- Content slot for nodes and other elements -->
      <g :transform="`translate(${pan.x}, ${pan.y}) scale(${zoom})`">
        <slot
          :zoom="zoom"
          :pan="pan"
          :grid-size="gridSize"
          :snap-to-grid="snapToGrid"
          :show-snap-indicators="showSnapIndicators"
          :set-snap-indicators="setSnapIndicators"
        />
      </g>
    </svg>

    <!-- Grid controls -->
    <div class="grid-controls">
      <div class="zoom-controls">
        <button @click="zoomIn" class="control-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
        <button @click="zoomOut" class="control-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13H5v-2h14v2z" />
          </svg>
        </button>
      </div>

      <button @click="resetView" class="control-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'

export interface GridProps {
  gridSize?: number
  backgroundColor?: string
  gridColor?: string
  majorGridColor?: string
  gridStrokeWidth?: number
  majorGridStrokeWidth?: number
  minZoom?: number
  maxZoom?: number
  zoomStep?: number
}

const props = withDefaults(defineProps<GridProps>(), {
  gridSize: 20,
  backgroundColor: '#ffffff',
  gridColor: '#e5e7eb',
  majorGridColor: '#d1d5db',
  gridStrokeWidth: 0.5,
  majorGridStrokeWidth: 1,
  minZoom: 0.1,
  maxZoom: 5,
  zoomStep: 0.1,
})

// Refs
const containerRef = ref<HTMLDivElement>()
const svgRef = ref<SVGSVGElement>()

// State
const containerSize = reactive({ width: 0, height: 0 })
const pan = reactive({ x: 0, y: 0 })
const zoom = ref(1)
const isDragging = ref(false)
const lastMousePos = reactive({ x: 0, y: 0 })
const showSnapIndicators = ref(false)
const snapIndicators = ref<Array<{ x: number; y: number }>>([])

// Computed
const viewBox = computed(() => {
  return `0 0 ${containerSize.width} ${containerSize.height}`
})

const gridOffset = computed(() => {
  return {
    x: pan.x % (props.gridSize * zoom.value),
    y: pan.y % (props.gridSize * zoom.value),
  }
})

// Methods
const updateContainerSize = () => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    containerSize.width = rect.width
    containerSize.height = rect.height
  }
}

const snapToGrid = (x: number, y: number) => {
  const gridSize = props.gridSize
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize,
  }
}

const zoomIn = () => {
  zoom.value = Math.min(props.maxZoom, zoom.value + props.zoomStep)
}

const zoomOut = () => {
  zoom.value = Math.max(props.minZoom, zoom.value - props.zoomStep)
}

const resetView = () => {
  pan.x = 0
  pan.y = 0
  zoom.value = 1
}

const setSnapIndicators = (indicators: Array<{ x: number; y: number }>) => {
  snapIndicators.value = indicators
  showSnapIndicators.value = indicators.length > 0
}

const clearSnapIndicators = () => {
  snapIndicators.value = []
  showSnapIndicators.value = false
}

// Event handlers
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  if (event.ctrlKey || event.metaKey) {
    // Zoom
    const delta = event.deltaY > 0 ? -props.zoomStep : props.zoomStep
    const newZoom = Math.max(
      props.minZoom,
      Math.min(props.maxZoom, zoom.value + delta)
    )

    // Zoom towards mouse position
    const rect = containerRef.value?.getBoundingClientRect()
    if (rect) {
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const zoomRatio = newZoom / zoom.value
      pan.x = mouseX - (mouseX - pan.x) * zoomRatio
      pan.y = mouseY - (mouseY - pan.y) * zoomRatio
    }

    zoom.value = newZoom
  } else {
    // Pan
    pan.x -= event.deltaX
    pan.y -= event.deltaY
  }
}

const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) {
    // Left mouse button
    isDragging.value = true
    lastMousePos.x = event.clientX
    lastMousePos.y = event.clientY
    event.preventDefault()
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = event.clientX - lastMousePos.x
    const deltaY = event.clientY - lastMousePos.y

    pan.x += deltaX
    pan.y += deltaY

    lastMousePos.x = event.clientX
    lastMousePos.y = event.clientY
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// Lifecycle
onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
})

// Expose methods for parent components
defineExpose({
  snapToGrid,
  zoomIn,
  zoomOut,
  resetView,
  setSnapIndicators,
  clearSnapIndicators,
  zoom: computed(() => zoom.value),
  pan: computed(() => ({ ...pan })),
})
</script>

<style scoped>
.infinite-grid-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  user-select: none;
}

.infinite-grid-container:active {
  cursor: grabbing;
}

.infinite-grid-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.grid-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #374151;
}

.control-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.zoom-level {
  font-size: 12px;
  color: #6b7280;
  min-width: 40px;
  text-align: center;
}

.snap-indicator {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Dark mode styles */
[data-theme='dark'] .grid-controls {
  background: rgba(31, 41, 55, 0.9);
}

[data-theme='dark'] .control-btn {
  background: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

[data-theme='dark'] .control-btn:hover {
  background: #4b5563;
  border-color: #6b7280;
}

[data-theme='dark'] .zoom-level {
  color: #9ca3af;
}
</style>
