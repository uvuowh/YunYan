<template>
  <div ref="canvasContainer" class="canvas-container" @mousemove="handleMouseMove" @click="handleCanvasClick">
    <v-stage
      ref="stage"
      :config="stageConfig"
      @wheel="handleWheel"
      @dblclick="onAddCard"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
    >
      <v-layer>
        <CanvasCard
          v-for="card in cards"
          :key="card.id"
          :id="card.id"
          :x="card.x"
          :y="card.y"
          :text="card.text"
          @anchor-click="handleAnchorClick"
        />
        <v-arrow v-for="conn in renderedConnections" :key="conn.id" :config="conn" />
        <v-arrow v-if="tempLine.visible" :config="tempLine.config" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref, reactive, computed } from 'vue';
import { useCanvasStore } from '@/store/canvas';
import { storeToRefs } from 'pinia';
import CanvasCard from '@/components/canvas/CanvasCard.vue';

export default {
  components: {
    CanvasCard,
  },
  setup() {
    const canvasStore = useCanvasStore();
    const { cards, connections } = storeToRefs(canvasStore);

    const anchorPoints = {
      top: { x: 75, y: 0 },
      right: { x: 150, y: 50 },
      bottom: { x: 75, y: 100 },
      left: { x: 0, y: 50 },
    };

    const canvasContainer = ref(null);
    const stage = ref(null);
    
    const isConnecting = ref(false);
    const fromAnchor = ref(null);
    const tempLine = reactive({ visible: false, config: { points: [0,0,0,0], stroke: 'black', strokeWidth: 2 } });

    const stageConfig = reactive({ width: 800, height: 600, draggable: true, scaleX: 1, scaleY: 1 });

    const handleDragStart = () => { canvasContainer.value.style.cursor = 'grabbing'; };
    const handleDragEnd = () => { canvasContainer.value.style.cursor = 'grab'; };

    const onAddCard = () => {
      const stageInstance = stage.value.getStage();
      const pointer = stageInstance.getRelativePointerPosition();
      if (pointer) canvasStore.addCard(pointer.x, pointer.y);
    };

    const handleWheel = (event) => {
      event.evt.preventDefault();
      const stageInstance = stage.value.getStage();
      const oldScale = stageInstance.scaleX();
      const pointer = stageInstance.getPointerPosition();

      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stageInstance.x()) / oldScale,
        y: (pointer.y - stageInstance.y()) / oldScale,
      };

      const newScale = event.evt.deltaY > 0 ? oldScale / 1.1 : oldScale * 1.1;

      stageConfig.scaleX = newScale;
      stageConfig.scaleY = newScale;

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stageInstance.position(newPos);
    };

    const handleAnchorClick = (payload) => {
      if (!isConnecting.value) {
        isConnecting.value = true;
        fromAnchor.value = { cardId: payload.cardId, anchor: payload.anchorName };
        tempLine.visible = true;
      } else {
        if (fromAnchor.value) {
          canvasStore.addConnection(fromAnchor.value, { cardId: payload.cardId, anchor: payload.anchorName });
        }
        isConnecting.value = false;
        fromAnchor.value = null;
        tempLine.visible = false;
      }
    };

    const handleMouseMove = (event) => {
        if (isConnecting.value && fromAnchor.value) {
            const stageInstance = stage.value.getStage();
            const pointer = stageInstance.getRelativePointerPosition();
            if (!pointer) return;

            const fromCard = cards.value.find(c => c.id === fromAnchor.value.cardId);
            if (!fromCard) return;

            const startPoint = {
                x: fromCard.x + anchorPoints[fromAnchor.value.anchor].x,
                y: fromCard.y + anchorPoints[fromAnchor.value.anchor].y,
            };

            tempLine.config.points = [startPoint.x, startPoint.y, pointer.x, pointer.y];
        }
    };

    const handleCanvasClick = (event) => {
        if (isConnecting.value && event.target === stage.value.getStage().content) {
            isConnecting.value = false;
            fromAnchor.value = null;
            tempLine.visible = false;
        }
    }

    const renderedConnections = computed(() => {
        return connections.value.map(conn => {
            const fromCard = cards.value.find(c => c.id === conn.from.cardId);
            const toCard = cards.value.find(c => c.id === conn.to.cardId);
            if (!fromCard || !toCard) return { points: [] };
            const fromPoint = { x: fromCard.x + anchorPoints[conn.from.anchor].x, y: fromCard.y + anchorPoints[conn.from.anchor].y };
            const toPoint = { x: toCard.x + anchorPoints[conn.to.anchor].x, y: toCard.y + anchorPoints[conn.to.anchor].y };
            return {
                id: conn.id,
                points: [fromPoint.x, fromPoint.y, toPoint.x, toPoint.y],
                stroke: 'black',
                strokeWidth: 2,
                pointerLength: 10,
                pointerWidth: 10,
            };
        });
    });

    const updateStageSize = () => {
        if (canvasContainer.value) {
            stageConfig.width = canvasContainer.value.clientWidth;
            stageConfig.height = canvasContainer.value.clientHeight;
        }
    };

    onMounted(() => {
        updateStageSize();
        window.addEventListener('resize', updateStageSize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateStageSize);
    });
    
    return {
        canvasContainer, stage, stageConfig, cards, tempLine,
        handleWheel, onAddCard, handleDragStart, handleDragEnd,
        handleAnchorClick, handleMouseMove, handleCanvasClick, renderedConnections,
    };
  },
};
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: calc(100vh - 50px);
  background-color: #f8f8f8;
  cursor: grab;
}
</style> 