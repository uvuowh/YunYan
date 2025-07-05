<template>
  <v-group
    :config="{
      id: String(props.id),
      x: props.x,
      y: props.y,
      draggable: true,
    }"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    ref="shapeRef"
  >
    <v-rect
      :config="{
        width: props.width,
        height: props.height,
        fill: '#fff8e1',
        stroke: isSelected ? '#0d6efd' : '#ffa726',
        strokeWidth: isSelected ? 2 : 1,
        cornerRadius: 8,
        shadowColor: '#000000',
        shadowBlur: 12,
        shadowOpacity: 0.1,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
      }"
    />
    <!-- 文档标题 - 占据整个节点 -->
    <v-text
        ref="textNodeRef"
        :config="{
            text: truncateTitle(props.title, props.width - 8),
            x: 4,
            y: 4,
            width: props.width - 8,
            height: props.height - 8,
            fontSize: Math.min(props.width / 6, props.height / 3, 32),
            fontFamily: 'Inter',
            fontStyle: 'bold',
            fill: '#212529',
            align: 'center',
            verticalAlign: 'middle',
            visible: true,
            wrap: 'word',
            ellipsis: false,
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
  content: string;
  width: number;
  height: number;
  blockCount?: number;
  dataTestid?: string;
}>();

const emit = defineEmits<{
  (e: 'dragstart', value: { id: number; x: number; y: number }): void;
  (e: 'dragend', value: { id: number; x: number; y: number }): void;
}>();

const store = useCanvasStore();

const isSelected = computed(() => store.isCardSelected(props.id));

/**
 * 截断标题以适应卡片宽度
 */
const truncateTitle = (title: string, maxWidth: number) => {
  // 计算动态字体大小
  const fontSize = Math.min(props.width / 6, props.height / 3, 32);
  // 根据字体大小估算字符宽度
  const charWidth = fontSize * 0.6; // 字符宽度约为字体大小的60%
  const maxChars = Math.floor(maxWidth / charWidth);
  if (title.length <= maxChars) {
    return title;
  }
  return title.substring(0, Math.max(1, maxChars - 3)) + '...';
};



const shapeRef = ref<Konva.Group | null>(null);
const textNodeRef = ref<Konva.Text | null>(null);

const handleDragStart = (e: Konva.KonvaEventObject<DragEvent>) => {
  emit('dragstart', { id: props.id, x: e.target.x(), y: e.target.y() });
};

const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
  emit('dragend', { id: props.id, x: e.target.x(), y: e.target.y() });
};

const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
  if (e.evt.button === 0) {
    // 左键点击：支持 Ctrl+点击多选
    const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey; // 支持 Mac 的 Cmd 键
    store.selectCard(props.id, isMultiSelect);
  }
};

const handleContextMenu = (e: Konva.KonvaEventObject<PointerEvent>) => {
  // 右键点击：管理连接
  e.evt.preventDefault();
  e.cancelBubble = true;

  // 在选中的卡片和当前卡片之间创建连接
  store.manageConnection(props.id);
};
</script>
