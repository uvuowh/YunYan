<template>
  <div 
    class="block group"
    :class="{ 'block-selected': isSelected }"
    @click="selectBlock"
  >
    <!-- Block Controls -->
    <div class="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="flex flex-col gap-1">
        <button
          class="btn btn-xs btn-ghost drag-handle"
          @mousedown="startDrag"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
          </svg>
        </button>
        
        <div class="dropdown dropdown-right">
          <button class="btn btn-xs btn-ghost" tabindex="0">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li><a @click="changeBlockType('paragraph')">Paragraph</a></li>
            <li><a @click="changeBlockType('heading')">Heading</a></li>
            <li><a @click="changeBlockType('list')">List</a></li>
            <li><a @click="changeBlockType('code')">Code</a></li>
            <li><a @click="changeBlockType('quote')">Quote</a></li>
            <li class="divider"></li>
            <li><a @click="duplicateBlock">Duplicate</a></li>
            <li><a @click="deleteBlock" class="text-error">Delete</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Block Content -->
    <div class="relative">
      <!-- Heading Block -->
      <div v-if="block.type === 'heading'" class="heading-block">
        <select 
          v-model="headingLevel" 
          class="select select-xs select-ghost w-16 mb-2"
          @change="updateHeadingLevel"
        >
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
        </select>
        <textarea
          v-model="content"
          :class="headingClasses"
          placeholder="Heading..."
          rows="1"
          @input="autoResize"
          @keydown="handleKeydown"
          ref="textareaRef"
        ></textarea>
      </div>

      <!-- Paragraph Block -->
      <div v-else-if="block.type === 'paragraph'" class="paragraph-block">
        <textarea
          v-model="content"
          class="textarea textarea-ghost w-full resize-none"
          placeholder="Start writing..."
          rows="1"
          @input="autoResize"
          @keydown="handleKeydown"
          ref="textareaRef"
        ></textarea>
      </div>

      <!-- List Block -->
      <div v-else-if="block.type === 'list'" class="list-block">
        <div class="flex items-start gap-2">
          <select 
            v-model="listType" 
            class="select select-xs select-ghost w-20"
            @change="updateListType"
          >
            <option value="unordered">•</option>
            <option value="ordered">1.</option>
          </select>
          <textarea
            v-model="content"
            class="textarea textarea-ghost flex-1 resize-none"
            placeholder="List item..."
            rows="1"
            @input="autoResize"
            @keydown="handleKeydown"
            ref="textareaRef"
          ></textarea>
        </div>
      </div>

      <!-- Code Block -->
      <div v-else-if="block.type === 'code'" class="code-block">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-base-content/60">Language:</span>
          <input
            v-model="codeLanguage"
            class="input input-xs input-ghost w-32"
            placeholder="javascript"
            @input="updateCodeLanguage"
          />
        </div>
        <textarea
          v-model="content"
          class="textarea textarea-ghost w-full font-mono text-sm bg-base-200"
          placeholder="// Your code here..."
          rows="3"
          @input="autoResize"
          @keydown="handleKeydown"
          ref="textareaRef"
        ></textarea>
      </div>

      <!-- Quote Block -->
      <div v-else-if="block.type === 'quote'" class="quote-block">
        <div class="flex items-start gap-2">
          <div class="w-1 bg-primary rounded-full flex-shrink-0 mt-2" style="height: 1.5rem;"></div>
          <textarea
            v-model="content"
            class="textarea textarea-ghost flex-1 resize-none italic"
            placeholder="Quote..."
            rows="1"
            @input="autoResize"
            @keydown="handleKeydown"
            ref="textareaRef"
          ></textarea>
        </div>
      </div>

      <!-- Image Block -->
      <div v-else-if="block.type === 'image'" class="image-block">
        <div class="space-y-2">
          <input
            v-model="imageAlt"
            class="input input-ghost w-full"
            placeholder="Image description..."
            @input="updateImageAlt"
          />
          <input
            v-model="imageSrc"
            class="input input-ghost w-full"
            placeholder="Image URL or path..."
            @input="updateImageSrc"
          />
          <div v-if="imageSrc" class="mt-2">
            <img :src="imageSrc" :alt="imageAlt" class="max-w-full h-auto rounded" />
          </div>
        </div>
      </div>

      <!-- Table Block -->
      <div v-else-if="block.type === 'table'" class="table-block">
        <textarea
          v-model="content"
          class="textarea textarea-ghost w-full font-mono text-sm"
          placeholder="| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |"
          rows="3"
          @input="autoResize"
          @keydown="handleKeydown"
          ref="textareaRef"
        ></textarea>
      </div>

      <!-- Default/Unknown Block -->
      <div v-else class="default-block">
        <textarea
          v-model="content"
          class="textarea textarea-ghost w-full resize-none"
          placeholder="Content..."
          rows="1"
          @input="autoResize"
          @keydown="handleKeydown"
          ref="textareaRef"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import type { Block, BlockType } from '@/types'

interface Props {
  block: Block
  index: number
}

interface Emits {
  (e: 'update', blockId: string, updates: Partial<Block>): void
  (e: 'delete', blockId: string): void
  (e: 'add-after', index: number, type?: BlockType): void
  (e: 'move-up', index: number): void
  (e: 'move-down', index: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isSelected = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()

// Reactive properties
const content = ref(props.block.content)
const headingLevel = ref(props.block.properties.level || 1)
const listType = ref(props.block.properties.listType || 'unordered')
const codeLanguage = ref(props.block.properties.language || '')
const imageAlt = ref(props.block.properties.alt || '')
const imageSrc = ref(props.block.properties.src || '')

// Computed
const headingClasses = computed(() => {
  const baseClasses = 'textarea textarea-ghost w-full resize-none font-bold'
  const sizeClasses = {
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm'
  }
  return `${baseClasses} ${sizeClasses[headingLevel.value as keyof typeof sizeClasses] || 'text-xl'}`
})

// Watch for content changes
watch(content, (newContent) => {
  emit('update', props.block.id, { content: newContent })
})

// Methods
function selectBlock() {
  isSelected.value = true
}

function autoResize() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
    }
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('add-after', props.index)
  } else if (event.key === 'Backspace' && content.value === '') {
    event.preventDefault()
    emit('delete', props.block.id)
  } else if (event.key === 'ArrowUp' && event.ctrlKey) {
    event.preventDefault()
    emit('move-up', props.index)
  } else if (event.key === 'ArrowDown' && event.ctrlKey) {
    event.preventDefault()
    emit('move-down', props.index)
  }
}

function changeBlockType(newType: BlockType) {
  emit('update', props.block.id, { type: newType })
}

function updateHeadingLevel() {
  emit('update', props.block.id, { 
    properties: { ...props.block.properties, level: headingLevel.value }
  })
}

function updateListType() {
  emit('update', props.block.id, { 
    properties: { ...props.block.properties, listType: listType.value }
  })
}

function updateCodeLanguage() {
  emit('update', props.block.id, { 
    properties: { ...props.block.properties, language: codeLanguage.value }
  })
}

function updateImageAlt() {
  emit('update', props.block.id, { 
    properties: { ...props.block.properties, alt: imageAlt.value }
  })
}

function updateImageSrc() {
  emit('update', props.block.id, { 
    properties: { ...props.block.properties, src: imageSrc.value }
  })
}

function duplicateBlock() {
  emit('add-after', props.index, props.block.type)
}

function deleteBlock() {
  emit('delete', props.block.id)
}

function startDrag(event: MouseEvent) {
  // TODO: Implement drag and drop functionality
  console.log('Start drag', event)
}

onMounted(() => {
  autoResize()
})
</script>

<style scoped>
.block {
  @apply relative pl-8;
}

.heading-block h1,
.heading-block h2,
.heading-block h3,
.heading-block h4,
.heading-block h5,
.heading-block h6 {
  @apply m-0;
}

.code-block textarea {
  @apply font-mono;
}

.quote-block {
  @apply border-l-4 border-primary pl-4;
}

.list-block {
  @apply pl-4;
}

.image-block img {
  @apply shadow-lg;
}
</style>
