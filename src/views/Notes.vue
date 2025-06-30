<template>
  <div class="notes-view">
    <div class="notes-header">
      <h1>笔记系统</h1>
      <div class="header-actions">
        <Input 
          v-model="searchQuery" 
          placeholder="搜索笔记..." 
          size="sm"
        />
        <Button @click="createNewNote">
          新建笔记
        </Button>
      </div>
    </div>

    <div class="notes-content">
      <div class="notes-sidebar">
        <div class="notes-tree">
          <h3>笔记目录</h3>
          <div v-if="notes.length === 0" class="empty-state">
            <p>还没有笔记</p>
            <Button variant="outline" @click="createNewNote">
              创建第一个笔记
            </Button>
          </div>
          <div v-else class="notes-list">
            <div 
              v-for="note in filteredNotes" 
              :key="note.id"
              :class="['note-item', { active: currentNoteId === note.id }]"
              @click="setCurrentNote(note.id)"
            >
              <div class="note-icon">📄</div>
              <div class="note-info">
                <div class="note-title">{{ note.title || '无标题' }}</div>
                <div class="note-meta">
                  {{ formatDate(note.updatedAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="notes-editor">
        <div v-if="!currentNote" class="editor-placeholder">
          <h2>选择一个笔记开始编辑</h2>
          <p>从左侧选择一个笔记，或创建一个新笔记</p>
        </div>
        <div v-else class="editor-content">
          <div class="editor-header">
            <Input 
              v-model="currentNote.title" 
              placeholder="笔记标题..."
              size="lg"
              @input="updateCurrentNote"
            />
            <div class="editor-actions">
              <Button variant="outline" size="sm" @click="deleteCurrentNote">
                删除
              </Button>
            </div>
          </div>
          <div class="editor-body">
            <textarea 
              v-model="currentNote.content"
              placeholder="开始写作..."
              class="content-textarea"
              @input="updateCurrentNote"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'

const notesStore = useNotesStore()

// Computed properties
const notes = computed(() => notesStore.notes)
const currentNote = computed(() => notesStore.currentNote)
const currentNoteId = computed(() => notesStore.currentNoteId)
const filteredNotes = computed(() => notesStore.filteredNotes)
const searchQuery = computed({
  get: () => notesStore.searchQuery,
  set: (value) => notesStore.setSearchQuery(value)
})

// Actions
const { createNote, updateNote, deleteNote, setCurrentNote } = notesStore

function createNewNote() {
  const note = createNote({
    title: '',
    content: '',
    tags: [],
    isFolder: false
  })
  setCurrentNote(note.id)
}

function updateCurrentNote() {
  if (currentNote.value) {
    updateNote(currentNote.value.id, {
      title: currentNote.value.title,
      content: currentNote.value.content
    })
  }
}

function deleteCurrentNote() {
  if (currentNote.value && confirm('确定要删除这个笔记吗？')) {
    deleteNote(currentNote.value.id)
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.notes-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.notes-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.notes-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.notes-sidebar {
  width: 300px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.notes-tree {
  padding: 1rem;
}

.notes-tree h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.note-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.note-item:hover {
  background-color: var(--bg-hover);
}

.note-item.active {
  background-color: var(--accent-light);
  color: var(--accent-color);
}

.note-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.note-info {
  flex: 1;
  min-width: 0;
}

.note-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-item.active .note-title {
  color: var(--accent-color);
}

.note-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.notes-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
}

.editor-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--text-secondary);
}

.editor-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.editor-header .input-wrapper {
  flex: 1;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.editor-body {
  flex: 1;
  padding: 2rem;
}

.content-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: transparent;
}

.content-textarea::placeholder {
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .notes-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .notes-sidebar {
    width: 250px;
  }
  
  .editor-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
