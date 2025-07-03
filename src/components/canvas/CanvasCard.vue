<template>
  <v-group :config="groupConfig" @dragmove="handleDragMove" @dragend="handleDragEnd" @mouseenter="showAnchors" @mouseleave="hideAnchors">
    <v-rect :config="rectConfig"></v-rect>
    <v-text :config="textConfig" @dblclick="handleDblClick"></v-text>
    <v-circle v-for="anchor in anchors" :key="anchor.name" :config="anchor.config" @click="() => onAnchorClick(anchor.name)"></v-circle>
  </v-group>
</template>

<script>
import { reactive, computed } from 'vue';
import { useCanvasStore } from '@/store/canvas';

export default {
  props: {
    id: { type: [String, Number], required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    text: { type: String, default: 'New Card' },
  },
  emits: ['anchor-click'],
  setup(props, { emit }) {
    const canvasStore = useCanvasStore();

    const groupConfig = computed(() => ({
      x: props.x,
      y: props.y,
      draggable: true,
    }));

    const rectConfig = reactive({
      width: 150,
      height: 100,
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      cornerRadius: 10,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOpacity: 0.3,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
    });

    const textConfig = computed(() => ({
      text: props.text,
      fontSize: 16,
      padding: 10,
      width: rectConfig.width,
      height: rectConfig.height,
      align: 'left',
      verticalAlign: 'top',
    }));

    const handleDragMove = (event) => {
      emit('update:x', event.target.x());
      emit('update:y', event.target.y());
    };

    const handleDragEnd = (event) => {
      canvasStore.updateCardPosition({
        id: props.id,
        x: event.target.x(),
        y: event.target.y(),
      });
    };

    const handleDblClick = (event) => {
        const textNode = event.target;
        const stage = textNode.getStage();
        if (!stage) return;

        const textPosition = textNode.getAbsolutePosition();
        const stageBox = stage.container().getBoundingClientRect();
        const areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y,
        };

        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = textNode.width() + 'px';
        textarea.style.height = textNode.height() + 'px';
        textarea.style.fontSize = textNode.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '10px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = textNode.lineHeight().toString();
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = textNode.align();
        textarea.style.color = textNode.fill();
        const rotation = textNode.getAbsoluteRotation();
        let transform = '';
        if (rotation) {
            transform += 'rotateZ(' + rotation + 'deg)';
        }

        textarea.style.transform = transform;
        textarea.focus();

        textNode.hide();

        const handleUpdate = () => {
            const newText = textarea.value;
            canvasStore.updateCardText({ id: props.id, text: newText });
            textNode.show();
            if(document.body.contains(textarea)){
                document.body.removeChild(textarea);
                textarea.removeEventListener('keydown', handleKeydown);
                textarea.removeEventListener('blur', handleUpdate);
            }
        }

        const handleKeydown = (e) => {
            if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Escape') {
                handleUpdate();
            }
        }

        textarea.addEventListener('keydown', handleKeydown);
        textarea.addEventListener('blur', handleUpdate);
    };

    const anchorsVisible = reactive({ value: false });

    const showAnchors = () => {
        anchorsVisible.value = true;
    };

    const hideAnchors = () => {
        anchorsVisible.value = false;
    };

    const anchorPoints = {
        top: { x: 75, y: 0 },
        right: { x: 150, y: 50 },
        bottom: { x: 75, y: 100 },
        left: { x: 0, y: 50 },
    };

    const anchors = computed(() => {
        return Object.entries(anchorPoints).map(([name, pos]) => ({
            name,
            config: {
            ...pos,
            radius: 5,
            fill: 'blue',
            stroke: 'white',
            strokeWidth: 2,
            visible: anchorsVisible.value,
            },
        }));
    });

    const onAnchorClick = (anchorName) => {
        emit('anchor-click', { cardId: props.id, anchorName });
    };

    return {
        groupConfig,
        rectConfig,
        textConfig,
        handleDragMove,
        handleDragEnd,
        handleDblClick,
        anchors,
        showAnchors,
        hideAnchors,
        onAnchorClick,
    };
  }
}
</script> 