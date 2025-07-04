<template>
  <div ref="canvasContainer" class="canvas-container">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @wheel="handleWheel"
      @dblclick="handleStageDblClick"
      @click="handleStageClick"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <v-layer ref="layerRef">
        <!-- Connections -->
        <ConnectionLine
          v-for="{ connection, card1, card2 } in connectionPairs"
          :key="connection.id"
          :connection="connection"
          :card1="card1"
          :card2="card2"
        />

        <!-- Cards -->
        <CanvasCard
          v-for="card in cards"
          :key="card.id"
          :id="card.id"
          :x="card.x"
          :y="card.y"
          :width="card.width"
          :height="card.height"
          :title="card.title"
          @dragend="handleCardDragEnd"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useCanvasStore, type Card } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import CanvasCard from '@/components/canvas/CanvasCard.vue';
import ConnectionLine from '@/components/canvas/ConnectionLine.vue';
import Konva from 'konva';

const store = useCanvasStore();
const { cards, connections } = storeToRefs(store);

const canvasContainer = ref<HTMLDivElement | null>(null);
const stageRef = ref<Konva.Stage | null>(null);
const layerRef = ref<Konva.Layer | null>(null);
const stageConfig = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: false, // 禁用默认拖拽，我们将手动处理
  scaleX: 1,
  scaleY: 1,
  x: 0,
  y: 0,
});

// 画布拖拽状态
const isDragging = ref(false);
const lastPointerPosition = ref({ x: 0, y: 0 });

onMounted(() => {
  window.addEventListener('resize', () => {
    stageConfig.value.width = window.innerWidth;
    stageConfig.value.height = window.innerHeight;
  });
});

// 鼠标按下事件 - 检测中键拖拽
const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = stageRef.value?.getStage();
  if (!stage) return;

  // 中键（滚轮按钮）拖拽画布
  if (e.evt.button === 1 && e.target.getType() === 'Stage') {
    e.evt.preventDefault();
    isDragging.value = true;
    const pos = stage.getPointerPosition();
    if (pos) {
      lastPointerPosition.value = pos;
    }
    // 改变鼠标样式
    stage.container().style.cursor = 'grabbing';
  }
};

// 鼠标移动事件 - 处理画布拖拽
const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = stageRef.value?.getStage();
  if (!stage || !isDragging.value) return;

  const pos = stage.getPointerPosition();
  if (!pos) return;

  const dx = pos.x - lastPointerPosition.value.x;
  const dy = pos.y - lastPointerPosition.value.y;

  stageConfig.value.x += dx;
  stageConfig.value.y += dy;

  stage.position({ x: stageConfig.value.x, y: stageConfig.value.y });
  stage.batchDraw();

  lastPointerPosition.value = pos;
};

// 鼠标释放事件 - 结束拖拽
const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = stageRef.value?.getStage();
  if (!stage) return;

  if (isDragging.value) {
    isDragging.value = false;
    // 恢复鼠标样式
    stage.container().style.cursor = 'grab';
  }
};

const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault();
  const stage = stageRef.value?.getStage();
  if (!stage) return;

  const pointer = stage.getPointerPosition();
  if (!pointer) return;

  // 检测是否为触控板（通过deltaMode和wheelDelta判断）
  const isTouchpad = e.evt.deltaMode === 0 && Math.abs(e.evt.deltaY) < 50;

  // 如果按住Ctrl键或者是触控板的缩放手势，进行缩放
  if (e.evt.ctrlKey || e.evt.metaKey || (!isTouchpad && Math.abs(e.evt.deltaY) > Math.abs(e.evt.deltaX))) {
    // 缩放操作
    const scaleBy = isTouchpad ? 1.02 : 1.1; // 触控板使用更小的缩放步长
    const oldScale = stage.scaleX();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // 限制缩放范围
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    stageConfig.value.scaleX = clampedScale;
    stageConfig.value.scaleY = clampedScale;
    stageConfig.value.x = pointer.x - mousePointTo.x * clampedScale;
    stageConfig.value.y = pointer.y - mousePointTo.y * clampedScale;

    stage.scale({ x: clampedScale, y: clampedScale });
    stage.position({ x: stageConfig.value.x, y: stageConfig.value.y });
  } else {
    // 平移操作（触控板双指滑动）
    const deltaX = e.evt.deltaX;
    const deltaY = e.evt.deltaY;

    stageConfig.value.x -= deltaX;
    stageConfig.value.y -= deltaY;

    stage.position({ x: stageConfig.value.x, y: stageConfig.value.y });
  }

  stage.batchDraw();
};

const handleStageDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (e.target.getType() === 'Stage') {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) {
      const { x, y } = stage.getRelativePointerPosition();
      store.addCard(x, y);
    }
  }
};

const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target.getType() === 'Stage') {
        store.selectCard(null);
    }
};

const handleCardDragEnd = ({ id, x, y }: { id: number; x: number; y: number }) => {
  store.updateCard({ id, x, y });
};

const connectionPairs = computed(() => {
  return connections.value
    .map(connection => {
      const card1 = cards.value.find(c => c.id === connection.id1);
      const card2 = cards.value.find(c => c.id === connection.id2);
      if (!card1 || !card2) return null;
      return { connection, card1, card2 };
    })
    .filter(p => p !== null) as { connection: Connection; card1: Card; card2: Card }[];
});
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-primary);
  cursor: grab;
  user-select: none; /* 防止文本选择 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.canvas-container:active {
  cursor: grabbing;
}

/* 优化触控板体验 */
.canvas-container canvas {
  touch-action: none; /* 禁用默认触摸行为 */
}
</style>