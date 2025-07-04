<template>
  <v-group
    :config="{
      id: String(props.id),
      x: props.x,
      y: props.y,
      draggable: true,
    }"
    @dragend="handleDragEnd"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    ref="shapeRef"
  >
    <v-rect
      :config="{
        width: props.width,
        height: props.height,
        fill: '#ffffff',
        stroke: isSelected ? '#0d6efd' : '#dee2e6',
        strokeWidth: isSelected ? 2 : 1,
        cornerRadius: 8,
        shadowColor: '#000000',
        shadowBlur: 12,
        shadowOpacity: 0.1,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
      }"
    />
    <v-text
        ref="textNodeRef"
        :config="{
            text: props.title,
            width: props.width,
            height: props.height,
            padding: 10,
            fontSize: 14,
            fontFamily: 'Inter',
            fill: '#212529',
            align: 'center',
            verticalAlign: 'middle',
            visible: true,
        }"
    />
  </v-group>
</template>

<script setup lang="ts">
import { useCanvasStore } from '@/store/canvas';
import { computed, ref } from 'vue';
import Konva from 'konva';

const props = defineProps<{
  id: number;
  x: number;
  y: number;
  title: string;
  width: number;
  height: number;
}>();

const emit = defineEmits<{
  (e: 'dragend', value: { id: number; x: number; y: number }): void;
}>();

const store = useCanvasStore();

const isSelected = computed(() => store.selectedCardId === props.id);

const shapeRef = ref<Konva.Group | null>(null);
const textNodeRef = ref<Konva.Text | null>(null);

const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
  emit('dragend', { id: props.id, x: e.target.x(), y: e.target.y() });
};

const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (e.evt.button === 0) {
    store.selectCard(props.id);
  }
};

const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
  e.evt.preventDefault();
  e.cancelBubble = true;
  store.manageConnection(props.id);
};
</script> 