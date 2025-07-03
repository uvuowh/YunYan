export interface Connection {
  id: string
  sourceNodeId: string
  targetNodeId: string
  type: 'reference' | 'dependency' | 'related'
  created: number
}
