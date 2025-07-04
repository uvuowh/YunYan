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
        fill: 'white',
        stroke: isSelected ? 'blue' : 'black',
        strokeWidth: isSelected ? 3 : 1,
        cornerRadius: 10,
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOpacity: 0.3,
        shadowOffsetX: 5,
        shadowOffsetY: 5,
      }"
    />
    <v-text
        ref="textNodeRef"
        :config="{
            text: props.title,
            width: props.width,
            height: props.height,
            padding: 20,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: 'black',
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

const handleClick = () => {
  store.selectCard(props.id);
};

const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
  e.evt.preventDefault();
  store.manageConnection(props.id);
};
</script> 