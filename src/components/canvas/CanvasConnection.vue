<template>
  <!-- Connection placeholder - nodes have been removed -->
  <g class="canvas-connection-placeholder">
    <!-- Connections cannot be displayed without nodes -->
  </g>
</template>

<script setup lang="ts">
import type { Connection } from '../../types/canvas'

export interface Props {
  connection: Connection
  selected: boolean
  showLabel?: boolean
}

export interface Emits {
  (e: 'select', connectionId: string): void
  (e: 'delete', connectionId: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.canvas-connection-placeholder {
  /* Placeholder styles */
}
</style>
