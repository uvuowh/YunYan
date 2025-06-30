import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  parentId?: string
  isFolder: boolean
}

export interface NotesState {
  notes: Note[]
  currentNoteId: string | null
  searchQuery: string
  selectedTags: string[]
}

export const useNotesStore = defineStore('notes', () => {
  // State
  const notes = ref<Note[]>([])
  const currentNoteId = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedTags = ref<string[]>([])

  // Getters
  const currentNote = computed(() => {
    return notes.value.find(note => note.id === currentNoteId.value) || null
  })

  const filteredNotes = computed(() => {
    let filtered = notes.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      )
    }

    // Filter by selected tags
    if (selectedTags.value.length > 0) {
      filtered = filtered.filter(note =>
        selectedTags.value.some(tag => note.tags.includes(tag))
      )
    }

    return filtered
  })

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    notes.value.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

  const noteTree = computed(() => {
    const rootNotes = notes.value.filter(note => !note.parentId)
    return buildNoteTree(rootNotes)
  })

  // Actions
  function createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const note: Note = {
      ...noteData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    notes.value.push(note)
    return note
  }

  function updateNote(id: string, updates: Partial<Note>) {
    const index = notes.value.findIndex(note => note.id === id)
    if (index !== -1) {
      notes.value[index] = {
        ...notes.value[index],
        ...updates,
        updatedAt: new Date()
      }
    }
  }

  function deleteNote(id: string) {
    const index = notes.value.findIndex(note => note.id === id)
    if (index !== -1) {
      notes.value.splice(index, 1)
      if (currentNoteId.value === id) {
        currentNoteId.value = null
      }
    }
  }

  function setCurrentNote(id: string | null) {
    currentNoteId.value = id
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  function setSelectedTags(tags: string[]) {
    selectedTags.value = tags
  }

  function buildNoteTree(notes: Note[]): Note[] {
    return notes.map(note => ({
      ...note,
      children: buildNoteTree(
        notes.filter(child => child.parentId === note.id)
      )
    }))
  }

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  return {
    // State
    notes,
    currentNoteId,
    searchQuery,
    selectedTags,
    // Getters
    currentNote,
    filteredNotes,
    allTags,
    noteTree,
    // Actions
    createNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    setSearchQuery,
    setSelectedTags
  }
})
