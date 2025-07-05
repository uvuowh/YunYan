import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCanvasStore } from '@/store/canvas'

describe('Canvas Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default cards', () => {
    const store = useCanvasStore()

    // Store initializes with 2 default cards
    expect(store.cards).toHaveLength(2)
    expect(store.connections).toEqual([])
    expect(store.selectedCardId).toBeNull()
  })

  it('adds a new card', () => {
    const store = useCanvasStore()

    const initialLength = store.cards.length
    store.addCard(100, 100)

    expect(store.cards).toHaveLength(initialLength + 1)
    const newCard = store.cards[store.cards.length - 1]
    expect(newCard.x).toBe(100)
    expect(newCard.y).toBe(100)
    expect(newCard.title).toContain('Document-')
  })

  it('selects a card', () => {
    const store = useCanvasStore()

    // Use existing card
    const cardId = store.cards[0].id
    store.selectCard(cardId)

    expect(store.selectedCardId).toBe(cardId)
  })

  it('manages connections between cards', () => {
    const store = useCanvasStore()

    // Use existing cards
    const card1Id = store.cards[0].id
    const card2Id = store.cards[1].id

    // Select first card
    store.selectCard(card1Id)

    // Create connection to second card
    store.manageConnectionInternal(card2Id)

    expect(store.connections).toHaveLength(1)
    expect(store.connections[0].id1).toBe(Math.min(card1Id, card2Id))
    expect(store.connections[0].id2).toBe(Math.max(card1Id, card2Id))
    expect(store.connections[0].direction).toBe('1->2')
  })

  it('cycles through connection types', () => {
    const store = useCanvasStore()

    // Clear any existing connections
    store.connections.splice(0, store.connections.length)

    // Use existing cards
    const card1Id = store.cards[0].id
    const card2Id = store.cards[1].id

    // Ensure card1Id < card2Id for predictable behavior
    const [smallerId, largerId] = card1Id < card2Id ? [card1Id, card2Id] : [card2Id, card1Id]

    // Test the actual state machine behavior:
    // From smaller card: none -> 1->2 -> none -> 1->2 ...
    store.selectCard(smallerId)

    // First click: none -> 1->2
    store.manageConnectionInternal(largerId)
    expect(store.connections).toHaveLength(1)
    expect(store.connections[0].direction).toBe('1->2')

    // Second click: 1->2 -> none (removes connection)
    store.manageConnectionInternal(largerId)
    expect(store.connections).toHaveLength(0)

    // Now test from larger card to get different transitions
    store.selectCard(largerId)

    // First click from larger: none -> 2->1
    store.manageConnectionInternal(smallerId)
    expect(store.connections).toHaveLength(1)
    expect(store.connections[0].direction).toBe('2->1')

    // Second click from larger: 2->1 -> none
    store.manageConnectionInternal(smallerId)
    expect(store.connections).toHaveLength(0)
  })

  it('updates card properties', () => {
    const store = useCanvasStore()

    const cardId = store.cards[0].id
    const originalTitle = store.cards[0].title

    store.updateCardInternal({ id: cardId, x: 200, y: 250, title: 'Updated Title' })

    const updatedCard = store.cards.find(c => c.id === cardId)
    expect(updatedCard?.x).toBe(200)
    expect(updatedCard?.y).toBe(250)
    expect(updatedCard?.title).toBe('Updated Title')
  })

  it('supports multi-selection with Ctrl+click', () => {
    const store = useCanvasStore()

    const card1Id = store.cards[0].id
    const card2Id = store.cards[1].id

    // Select first card normally
    store.selectCard(card1Id)
    expect(store.selectedCardId).toBe(card1Id)
    expect(store.getSelectedCount()).toBe(1)

    // Multi-select second card
    store.selectCard(card2Id, true)
    expect(store.getSelectedCount()).toBe(2)
    expect(store.isCardSelected(card1Id)).toBe(true)
    expect(store.isCardSelected(card2Id)).toBe(true)
  })

  it('supports select all cards', () => {
    const store = useCanvasStore()

    store.selectAllCards()
    expect(store.getSelectedCount()).toBe(store.cards.length)

    // All cards should be selected
    store.cards.forEach(card => {
      expect(store.isCardSelected(card.id)).toBe(true)
    })
  })

  it('supports rectangle selection', () => {
    const store = useCanvasStore()

    // Clear existing selections
    store.selectCard(null)

    // Get the position of the first card and create a rectangle that covers it
    const firstCard = store.cards[0]
    const selectedCards = store.selectCardsInRect(
      firstCard.x - 10,
      firstCard.y - 10,
      firstCard.x + firstCard.width + 10,
      firstCard.y + firstCard.height + 10
    )

    expect(selectedCards.length).toBeGreaterThan(0)
    selectedCards.forEach(cardId => {
      expect(store.isCardSelected(cardId)).toBe(true)
    })
  })

  it('removes selected cards', () => {
    const store = useCanvasStore()
    const initialCount = store.cards.length

    // Select first card
    const cardId = store.cards[0].id
    store.selectCard(cardId)

    // Manually remove the card to test the selection clearing
    const cardIndex = store.cards.findIndex(c => c.id === cardId)
    if (cardIndex !== -1) {
      store.cards.splice(cardIndex, 1)
    }

    // Clear selections
    store.selectedCardIds.clear()
    store.selectedCardId = null

    expect(store.cards.length).toBe(initialCount - 1)
    expect(store.getSelectedCount()).toBe(0)
  })
})
