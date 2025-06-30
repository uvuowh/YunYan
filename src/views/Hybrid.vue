<template>
  <div class="hybrid-view">
    <div class="hybrid-header">
      <h1>混合视图</h1>
      <div class="view-controls">
        <Button 
          v-for="layout in layouts" 
          :key="layout.key"
          :variant="currentLayout === layout.key ? 'primary' : 'ghost'"
          size="sm"
          @click="setCurrentLayout(layout.key)"
        >
          {{ layout.icon }} {{ layout.label }}
        </Button>
      </div>
    </div>

    <div class="hybrid-content" :class="`layout-${currentLayout}`">
      <!-- Split Layout -->
      <template v-if="currentLayout === 'split'">
        <div class="split-panel notes-panel">
          <div class="panel-header">
            <h2>📝 笔记</h2>
            <Button size="sm" @click="createNewNote">新建</Button>
          </div>
          <div class="panel-content">
            <div class="notes-list">
              <div 
                v-for="note in notes" 
                :key="note.id"
                :class="['note-item', { active: selectedNoteId === note.id }]"
                @click="selectNote(note.id)"
              >
                <div class="note-title">{{ note.title || '无标题' }}</div>
                <div class="note-preview">{{ note.content.substring(0, 100) }}...</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="split-panel whiteboard-panel">
          <div class="panel-header">
            <h2>🎨 白板</h2>
            <Button size="sm" @click="createNodeFromNote" :disabled="!selectedNote">
              添加到白板
            </Button>
          </div>
          <div class="panel-content">
            <div class="mini-whiteboard">
              <svg class="mini-canvas" viewBox="0 0 400 300">
                <rect width="100%" height="100%" fill="var(--bg-primary)" stroke="var(--border-color)"/>
                <g v-for="node in whiteboardNodes" :key="node.id">
                  <rect
                    :x="node.x * 0.5"
                    :y="node.y * 0.5"
                    :width="node.width * 0.5"
                    :height="node.height * 0.5"
                    :fill="node.style.backgroundColor"
                    :stroke="node.style.borderColor"
                    stroke-width="1"
                    rx="4"
                  />
                  <text
                    :x="(node.x + node.width/2) * 0.5"
                    :y="(node.y + node.height/2) * 0.5"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    :fill="node.style.textColor"
                    font-size="8"
                  >
                    {{ node.content.substring(0, 20) }}...
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </template>

      <!-- Tabs Layout -->
      <template v-if="currentLayout === 'tabs'">
        <div class="tabs-container">
          <div class="tabs-header">
            <button 
              v-for="tab in tabs" 
              :key="tab.key"
              :class="['tab', { active: activeTab === tab.key }]"
              @click="setActiveTab(tab.key)"
            >
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>
          <div class="tabs-content">
            <div v-if="activeTab === 'notes'" class="tab-panel">
              <Notes />
            </div>
            <div v-if="activeTab === 'whiteboard'" class="tab-panel">
              <Whiteboard />
            </div>
          </div>
        </div>
      </template>

      <!-- Overlay Layout -->
      <template v-if="currentLayout === 'overlay'">
        <div class="overlay-container">
          <Whiteboard />
          <div class="overlay-panel" :class="{ collapsed: overlayCollapsed }">
            <div class="overlay-header">
              <h3>关联笔记</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                @click="toggleOverlay"
              >
                {{ overlayCollapsed ? '展开' : '收起' }}
              </Button>
            </div>
            <div v-if="!overlayCollapsed" class="overlay-content">
              <div class="related-notes">
                <div 
                  v-for="note in notes.slice(0, 5)" 
                  :key="note.id"
                  class="related-note"
                  @click="selectNote(note.id)"
                >
                  <div class="note-title">{{ note.title || '无标题' }}</div>
                  <div class="note-snippet">{{ note.content.substring(0, 50) }}...</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Sync Status -->
    <div class="sync-status">
      <div class="status-indicator" :class="{ synced: isSynced }"></div>
      <span>{{ isSynced ? '已同步' : '同步中...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useWhiteboardStore } from '@/stores/whiteboard'
import Button from '@/components/ui/Button.vue'
import Notes from './Notes.vue'
import Whiteboard from './Whiteboard.vue'

const notesStore = useNotesStore()
const whiteboardStore = useWhiteboardStore()

const currentLayout = ref<'split' | 'tabs' | 'overlay'>('split')
const activeTab = ref<'notes' | 'whiteboard'>('notes')
const overlayCollapsed = ref(false)
const selectedNoteId = ref<string | null>(null)
const isSynced = ref(true)

const layouts = [
  { key: 'split', icon: '⚌', label: '分屏' },
  { key: 'tabs', icon: '📑', label: '标签' },
  { key: 'overlay', icon: '🔗', label: '叠加' }
] as const

const tabs = [
  { key: 'notes', icon: '📝', label: '笔记' },
  { key: 'whiteboard', icon: '🎨', label: '白板' }
] as const

// Computed properties
const notes = computed(() => notesStore.notes)
const whiteboardNodes = computed(() => whiteboardStore.nodes)
const selectedNote = computed(() => 
  notes.value.find(note => note.id === selectedNoteId.value)
)

// Actions
const { createNote } = notesStore
const { createNode } = whiteboardStore

function setCurrentLayout(layout: 'split' | 'tabs' | 'overlay') {
  currentLayout.value = layout
}

function setActiveTab(tab: 'notes' | 'whiteboard') {
  activeTab.value = tab
}

function toggleOverlay() {
  overlayCollapsed.value = !overlayCollapsed.value
}

function selectNote(noteId: string) {
  selectedNoteId.value = noteId
  notesStore.setCurrentNote(noteId)
}

function createNewNote() {
  const note = createNote({
    title: '',
    content: '',
    tags: [],
    isFolder: false
  })
  selectNote(note.id)
}

function createNodeFromNote() {
  if (!selectedNote.value) return

  // Create a whiteboard node from the selected note
  createNode({
    type: 'note',
    x: Math.random() * 300 + 50,
    y: Math.random() * 200 + 50,
    width: 200,
    height: 150,
    content: selectedNote.value.title || selectedNote.value.content.substring(0, 50),
    style: {
      backgroundColor: '#fef3c7',
      borderColor: '#f59e0b',
      textColor: '#92400e',
      fontSize: 12
    },
    connections: []
  })

  // Simulate sync
  isSynced.value = false
  setTimeout(() => {
    isSynced.value = true
  }, 1000)
}
</script>

<style scoped>
.hybrid-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.hybrid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.hybrid-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.hybrid-content {
  flex: 1;
  overflow: hidden;
}

/* Split Layout */
.layout-split {
  display: flex;
  height: 100%;
}

.split-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
}

.split-panel:last-child {
  border-right: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.panel-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.panel-content {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.note-item {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.note-item:hover {
  border-color: var(--accent-color);
  background-color: var(--bg-hover);
}

.note-item.active {
  border-color: var(--accent-color);
  background-color: var(--accent-light);
}

.note-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.note-preview {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.mini-whiteboard {
  width: 100%;
  height: 300px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.mini-canvas {
  width: 100%;
  height: 100%;
}

/* Tabs Layout */
.tabs-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.tab {
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all var(--transition-fast);
}

.tab:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.tab.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

.tabs-content {
  flex: 1;
  overflow: hidden;
}

.tab-panel {
  height: 100%;
}

/* Overlay Layout */
.overlay-container {
  position: relative;
  height: 100%;
}

.overlay-panel {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 300px;
  max-height: calc(100% - 2rem);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  z-index: 10;
}

.overlay-panel.collapsed {
  width: auto;
  height: auto;
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.overlay-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.overlay-content {
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.related-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.related-note {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.related-note:hover {
  border-color: var(--accent-color);
  background-color: var(--bg-hover);
}

.related-note .note-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.note-snippet {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.3;
}

/* Sync Status */
.sync-status {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
  box-shadow: var(--shadow-md);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--warning-color);
  animation: pulse 2s infinite;
}

.status-indicator.synced {
  background-color: var(--success-color);
  animation: none;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .layout-split {
    flex-direction: column;
  }
  
  .split-panel {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .split-panel:last-child {
    border-bottom: none;
  }
  
  .overlay-panel {
    width: calc(100% - 2rem);
    right: 1rem;
    left: 1rem;
  }
}
</style>
