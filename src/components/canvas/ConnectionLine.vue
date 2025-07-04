<template>
  <v-group>
    <v-arrow v-if="arrow1Config" :config="arrow1Config" />
    <v-arrow v-if="arrow2Config" :config="arrow2Config" />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Card, Connection } from '@/store/canvas';

const props = defineProps<{
  connection: Connection;
  card1: Card;
  card2: Card;
}>();

const baseArrowConfig = {
  stroke: 'black',
  strokeWidth: 2,
  fill: 'black',
  pointerLength: 10,
  pointerWidth: 10,
};

/**
 * Calculates the exact point on the edge of a card for a connection line.
 * @param fromCard The starting card.
 * @param toCard The ending card.
 * @returns The coordinates of the edge point.
 */
function getEdgePoint(fromCard: Card, toCard: Card) {
  const fromX = fromCard.x + fromCard.width / 2;
  const fromY = fromCard.y + fromCard.height / 2;
  const toX = toCard.x + toCard.width / 2;
  const toY = toCard.y + toCard.height / 2;

  const dx = toX - fromX;
  const dy = toY - fromY;

  if (dx === 0 && dy === 0) {
    return { x: fromX, y: fromY };
  }

  const tanAngle = Math.abs(dy / dx);
  const tanRect = fromCard.height / fromCard.width;

  let edgeX, edgeY;

  if (tanAngle < tanRect) {
    edgeX = fromX + (dx > 0 ? fromCard.width / 2 : -fromCard.width / 2);
    edgeY = fromY + dy * (Math.abs(fromCard.width / 2) / Math.abs(dx));
  } else {
    edgeX = fromX + dx * (Math.abs(fromCard.height / 2) / Math.abs(dy));
    edgeY = fromY + (dy > 0 ? fromCard.height / 2 : -fromCard.height / 2);
  }
  return { x: edgeX, y: edgeY };
}

const p1 = computed(() => getEdgePoint(props.card1, props.card2));
const p2 = computed(() => getEdgePoint(props.card2, props.card1));

const arrow1Config = computed(() => {
  if (props.connection.direction === '1->2' || props.connection.direction === 'both') {
    return { ...baseArrowConfig, points: [p1.value.x, p1.value.y, p2.value.x, p2.value.y] };
  }
  return null;
});

const arrow2Config = computed(() => {
  if (props.connection.direction === '2->1' || props.connection.direction === 'both') {
    return { ...baseArrowConfig, points: [p2.value.x, p2.value.y, p1.value.x, p1.value.y] };
  }
  return null;
});
</script> 