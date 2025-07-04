<template>
  <div ref="canvasContainer" class="canvas-container">
    <v-stage
      ref="stageRef"
      :config="stageConfig"
      @dragmove="handleStageDrag"
      @wheel="handleWheel"
      @dblclick="handleStageDblClick"
      @click="handleStageClick"
    >
      <v-layer ref="layerRef">
        <!-- Connections -->
        <v-arrow v-for="conn in renderedConnections" :key="conn.id" :config="conn.config" />

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
import Konva from 'konva';

const store = useCanvasStore();
const { cards, connections } = storeToRefs(store);

const canvasContainer = ref<HTMLDivElement | null>(null);
const stageRef = ref<Konva.Stage | null>(null);
const layerRef = ref<Konva.Layer | null>(null);
const stageConfig = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  draggable: true,
  scaleX: 1,
  scaleY: 1,
  x: 0,
  y: 0,
});

onMounted(() => {
  window.addEventListener('resize', () => {
    stageConfig.value.width = window.innerWidth;
    stageConfig.value.height = window.innerHeight;
  });
});

const handleStageDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
  if (e.target.getType() === 'Stage') {
    stageConfig.value.x = e.target.x();
    stageConfig.value.y = e.target.y();
  }
};

const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
  e.evt.preventDefault();
  const scaleBy = 1.1;
  const stage = stageRef.value?.getStage();
  if (!stage) return;

  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();

  if (!pointer) return;

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };

  const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

  stageConfig.value.scaleX = newScale;
  stageConfig.value.scaleY = newScale;
  stageConfig.value.x = pointer.x - mousePointTo.x * newScale;
  stageConfig.value.y = pointer.y - mousePointTo.y * newScale;

  stage.scale({ x: newScale, y: newScale });
  stage.position({ x: stageConfig.value.x, y: stageConfig.value.y });
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

/**
 * Calculates the exact point on the edge of a card for a connection line.
 * This ensures lines connect to the card's border, not its center.
 * It also handles the edge case where cards are at the same position.
 * @param {Card} fromCard The starting card.
 * @param {Card} toCard The ending card.
 * @returns {{x: number, y: number}} The coordinates of the edge point.
 */
function getEdgePoint(fromCard: Card, toCard: Card) {
    const fromX = fromCard.x + fromCard.width / 2;
    const fromY = fromCard.y + fromCard.height / 2;
    const toX = toCard.x + toCard.width / 2;
    const toY = toCard.y + toCard.height / 2;

    const dx = toX - fromX;
    const dy = toY - fromY;
    
    // Guard against division by zero or NaN if cards are at the same position
    if (dx === 0 && dy === 0) {
        return { x: fromX, y: fromY };
    }

    const tan_angle = Math.abs(dy / dx);
    const tan_rect = fromCard.height / fromCard.width;

    let edgeX, edgeY;

    if (tan_angle < tan_rect) {
        edgeX = fromX + (dx > 0 ? fromCard.width / 2 : -fromCard.width / 2);
        edgeY = fromY + dy * (Math.abs(fromCard.width / 2) / Math.abs(dx));
    } else {
        edgeX = fromX + dx * (Math.abs(fromCard.height / 2) / Math.abs(dy));
        edgeY = fromY + (dy > 0 ? fromCard.height / 2 : -fromCard.height / 2);
    }
    return { x: edgeX, y: edgeY };
}


const renderedConnections = computed(() => {
    const result: { id: string, config: any }[] = [];
    connections.value.forEach(conn => {
        const card1 = cards.value.find(c => c.id === conn.id1);
        const card2 = cards.value.find(c => c.id === conn.id2);

        if (!card1 || !card2) return;
        
        const p1 = getEdgePoint(card1, card2);
        const p2 = getEdgePoint(card2, card1);

        const baseConfig = {
            stroke: 'black',
            strokeWidth: 2,
            fill: 'black',
            pointerLength: 10,
            pointerWidth: 10,
        };

        if (conn.direction === '1->2') {
            result.push({
                id: `${conn.id}-12`,
                config: { ...baseConfig, points: [p1.x, p1.y, p2.x, p2.y] }
            });
        } else if (conn.direction === '2->1') {
             result.push({
                id: `${conn.id}-21`,
                config: { ...baseConfig, points: [p2.x, p2.y, p1.x, p1.y] }
            });
        } else if (conn.direction === 'both') {
            result.push({
                id: `${conn.id}-12`,
                config: { ...baseConfig, points: [p1.x, p1.y, p2.x, p2.y] }
            });
            result.push({
                id: `${conn.id}-21`,
                config: { ...baseConfig, points: [p2.x, p2.y, p1.x, p1.y] }
            });
        }
    });
    return result;
});
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-primary);
  cursor: grab;
}
</style> 