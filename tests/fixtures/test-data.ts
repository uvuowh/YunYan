import type { Card, Connection } from '@/types'

export const mockCards: Card[] = [
  {
    id: 'card-1',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    title: 'Test Card 1',
    content: 'This is test content for card 1'
  },
  {
    id: 'card-2',
    x: 400,
    y: 100,
    width: 200,
    height: 150,
    title: 'Test Card 2',
    content: 'This is test content for card 2'
  },
  {
    id: 'card-3',
    x: 250,
    y: 300,
    width: 200,
    height: 150,
    title: 'Test Card 3',
    content: 'This is test content for card 3'
  }
]

export const mockConnections: Connection[] = [
  {
    id: 'connection-1',
    from: 'card-1',
    to: 'card-2',
    type: 'one-way'
  },
  {
    id: 'connection-2',
    from: 'card-2',
    to: 'card-3',
    type: 'two-way'
  }
]

export const createMockCard = (overrides: Partial<Card> = {}): Card => ({
  id: `card-${Date.now()}`,
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  title: 'Mock Card',
  content: 'Mock content',
  ...overrides
})

export const createMockConnection = (overrides: Partial<Connection> = {}): Connection => ({
  id: `connection-${Date.now()}`,
  from: 'card-1',
  to: 'card-2',
  type: 'one-way',
  ...overrides
})

export const mockCanvasState = {
  cards: mockCards,
  connections: mockConnections,
  selectedCardId: null,
  canvasWidth: 1200,
  canvasHeight: 800
}
