<template>
  <v-group
    :config="{
      id: props.id,
      x: props.x,
      y: props.y,
      draggable: true,
    }"
    @dragend="handleDragEnd"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @dblclick="handleDblClick"
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
            text: props.text,
            width: props.width,
            height: props.height,
            padding: 20,
            fontSize: 16,
            fontFamily: 'Arial',
            fill: 'black',
            align: 'left',
            verticalAlign: 'top',
            visible: !textEditActive
        }"
    />
  </v-group>
  <template v-if="textEditActive">
    <foreignObject :x="props.x" :y="props.y" :width="props.width" :height="props.height">
        <body xmlns="http://www.w3.org/1999/xhtml">
            <textarea
                :value="props.text"
                @blur="handleTextareaBlur"
                :style="{
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    width: `${props.width}px`,
                    height: `${props.height}px`,
                    padding: '20px',
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    background: 'none',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                }"
                autofocus
            ></textarea>
        </body>
    </foreignObject>
  </template>
</template>

<script setup lang="ts">
import { useCanvasStore } from '@/store/canvas';
import { computed, ref, watch } from 'vue';
import Konva from 'konva';

const props = defineProps<{
  id: number;
  x: number;
  y: number;
  text: string;
  width: number;
  height: number;
}>();

const emit = defineEmits<{
  (e: 'dragend', value: { id: number; x: number; y: number }): void;
  (e: 'update:text', value: { id: number; text: string; width: number; height: number }): void;
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

const textEditActive = ref(false);

const handleDblClick = () => {
  textEditActive.value = true;
};

const handleTextareaBlur = (e: FocusEvent) => {
  const textarea = e.target as HTMLTextAreaElement;
  const textNode = textNodeRef.value;
  if (textNode) {
    const newText = textarea.value;
    // Use Konva to measure text dimensions
    const tempText = new Konva.Text({
        text: newText,
        fontSize: 16,
        fontFamily: 'Arial',
        padding: 20,
        align: 'left',
    });
    const newWidth = tempText.width();
    const newHeight = tempText.height();
    emit('update:text', { id: props.id, text: newText, width: newWidth, height: newHeight });
  }
  textEditActive.value = false;
};

// ... existing setup code ...
</script> 