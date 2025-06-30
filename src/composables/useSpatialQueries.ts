import { computed } from 'vue'
import { useUnifiedStore } from '@/stores/unified'
import type { UnifiedBlock, Position, Size } from '@/types/unified'

/**
 * Spatial Queries Composable
 * Provides advanced spatial querying capabilities for whiteboard blocks
 */
export function useSpatialQueries() {
  const unifiedStore = useUnifiedStore()
  
  // ============================================================================
  // SPATIAL QUERY OPERATIONS
  // ============================================================================
  
  /**
   * Find blocks within a rectangular region
   */
  function findBlocksInRegion(
    canvasId: string,
    topLeft: Position,
    bottomRight: Position
  ): UnifiedBlock[] {
    return Array.from(unifiedStore.blocks.values()).filter(block => {
      if (!block.spatialProperties || 
          block.spatialProperties.canvasId !== canvasId || 
          !block.spatialProperties.isVisible) {
        return false
      }
      
      const { position, size } = block.spatialProperties
      const blockRight = position.x + size.width
      const blockBottom = position.y + size.height
      
      return position.x >= topLeft.x && 
             position.y >= topLeft.y && 
             blockRight <= bottomRight.x && 
             blockBottom <= bottomRight.y
    })
  }
  
  /**
   * Find blocks within a circular region
   */
  function findBlocksInCircle(
    canvasId: string,
    center: Position,
    radius: number
  ): UnifiedBlock[] {
    return Array.from(unifiedStore.blocks.values()).filter(block => {
      if (!block.spatialProperties || 
          block.spatialProperties.canvasId !== canvasId || 
          !block.spatialProperties.isVisible) {
        return false
      }
      
      const blockCenter = getBlockCenter(block)
      const distance = getDistance(center, blockCenter)
      
      return distance <= radius
    })
  }
  
  /**
   * Find blocks near a specific position
   */
  function findBlocksNear(
    canvasId: string,
    position: Position,
    maxDistance: number,
    limit?: number
  ): { block: UnifiedBlock; distance: number }[] {
    const candidates = Array.from(unifiedStore.blocks.values())
      .filter(block => 
        block.spatialProperties?.canvasId === canvasId && 
        block.spatialProperties?.isVisible
      )
      .map(block => ({
        block,
        distance: getDistance(position, getBlockCenter(block))
      }))
      .filter(item => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
    
    return limit ? candidates.slice(0, limit) : candidates
  }
  
  /**
   * Find blocks along a path
   */
  function findBlocksAlongPath(
    canvasId: string,
    startPos: Position,
    endPos: Position,
    tolerance: number = 50
  ): UnifiedBlock[] {
    return Array.from(unifiedStore.blocks.values()).filter(block => {
      if (!block.spatialProperties || 
          block.spatialProperties.canvasId !== canvasId || 
          !block.spatialProperties.isVisible) {
        return false
      }
      
      const blockCenter = getBlockCenter(block)
      const distanceToLine = getDistanceToLine(blockCenter, startPos, endPos)
      
      return distanceToLine <= tolerance
    })
  }
  
  /**
   * Find overlapping blocks
   */
  function findOverlappingBlocks(canvasId: string): UnifiedBlock[][] {
    const blocks = Array.from(unifiedStore.blocks.values()).filter(block =>
      block.spatialProperties?.canvasId === canvasId && 
      block.spatialProperties?.isVisible
    )
    
    const overlappingGroups: UnifiedBlock[][] = []
    const processed = new Set<string>()
    
    for (const block1 of blocks) {
      if (processed.has(block1.id)) continue
      
      const overlapping = [block1]
      processed.add(block1.id)
      
      for (const block2 of blocks) {
        if (block2.id === block1.id || processed.has(block2.id)) continue
        
        if (blocksOverlap(block1, block2)) {
          overlapping.push(block2)
          processed.add(block2.id)
        }
      }
      
      if (overlapping.length > 1) {
        overlappingGroups.push(overlapping)
      }
    }
    
    return overlappingGroups
  }
  
  /**
   * Find connected blocks (blocks with spatial connections)
   */
  function findConnectedBlocks(blockId: string): UnifiedBlock[] {
    const block = unifiedStore.blocks.get(blockId)
    if (!block?.spatialProperties) return []
    
    const connected: UnifiedBlock[] = []
    
    // Find blocks this block connects to
    for (const connection of block.spatialProperties.connections) {
      const targetBlock = unifiedStore.blocks.get(connection.targetBlockId)
      if (targetBlock) {
        connected.push(targetBlock)
      }
    }
    
    // Find blocks that connect to this block
    for (const otherBlock of unifiedStore.blocks.values()) {
      if (otherBlock.id === blockId || !otherBlock.spatialProperties) continue
      
      const hasConnection = otherBlock.spatialProperties.connections.some(
        conn => conn.targetBlockId === blockId
      )
      
      if (hasConnection && !connected.find(b => b.id === otherBlock.id)) {
        connected.push(otherBlock)
      }
    }
    
    return connected
  }
  
  /**
   * Find blocks by spatial pattern
   */
  function findBlocksByPattern(
    canvasId: string,
    pattern: 'grid' | 'line' | 'cluster' | 'scattered'
  ): UnifiedBlock[] {
    const blocks = Array.from(unifiedStore.blocks.values()).filter(block =>
      block.spatialProperties?.canvasId === canvasId && 
      block.spatialProperties?.isVisible
    )
    
    switch (pattern) {
      case 'grid':
        return findGridPattern(blocks)
      case 'line':
        return findLinePattern(blocks)
      case 'cluster':
        return findClusterPattern(blocks)
      case 'scattered':
        return findScatteredPattern(blocks)
      default:
        return []
    }
  }
  
  // ============================================================================
  // SPATIAL ANALYSIS
  // ============================================================================
  
  /**
   * Get spatial statistics for a canvas
   */
  function getSpatialStatistics(canvasId: string) {
    const blocks = Array.from(unifiedStore.blocks.values()).filter(block =>
      block.spatialProperties?.canvasId === canvasId && 
      block.spatialProperties?.isVisible
    )
    
    if (blocks.length === 0) {
      return {
        blockCount: 0,
        averageDistance: 0,
        density: 0,
        boundingBox: null,
        center: null
      }
    }
    
    const positions = blocks.map(block => getBlockCenter(block))
    const boundingBox = getBoundingBox(blocks)
    const center = getCenterPoint(positions)
    
    // Calculate average distance between blocks
    let totalDistance = 0
    let pairCount = 0
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        totalDistance += getDistance(positions[i], positions[j])
        pairCount++
      }
    }
    
    const averageDistance = pairCount > 0 ? totalDistance / pairCount : 0
    
    // Calculate density (blocks per unit area)
    const area = boundingBox ? 
      (boundingBox.width * boundingBox.height) : 0
    const density = area > 0 ? blocks.length / area : 0
    
    return {
      blockCount: blocks.length,
      averageDistance,
      density,
      boundingBox,
      center
    }
  }
  
  /**
   * Suggest optimal positions for new blocks
   */
  function suggestOptimalPositions(
    canvasId: string,
    count: number = 1,
    strategy: 'grid' | 'cluster' | 'spread' = 'spread'
  ): Position[] {
    const existingBlocks = Array.from(unifiedStore.blocks.values()).filter(block =>
      block.spatialProperties?.canvasId === canvasId && 
      block.spatialProperties?.isVisible
    )
    
    if (existingBlocks.length === 0) {
      // No existing blocks, start with a grid
      return generateGridPositions(count, { x: 100, y: 100 }, 200)
    }
    
    switch (strategy) {
      case 'grid':
        return suggestGridPositions(existingBlocks, count)
      case 'cluster':
        return suggestClusterPositions(existingBlocks, count)
      case 'spread':
        return suggestSpreadPositions(existingBlocks, count)
      default:
        return []
    }
  }
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  function getBlockCenter(block: UnifiedBlock): Position {
    if (!block.spatialProperties) return { x: 0, y: 0 }
    
    const { position, size } = block.spatialProperties
    return {
      x: position.x + size.width / 2,
      y: position.y + size.height / 2
    }
  }
  
  function getDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x
    const dy = pos1.y - pos2.y
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  function getDistanceToLine(point: Position, lineStart: Position, lineEnd: Position): number {
    const A = point.x - lineStart.x
    const B = point.y - lineStart.y
    const C = lineEnd.x - lineStart.x
    const D = lineEnd.y - lineStart.y
    
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) return getDistance(point, lineStart)
    
    const param = dot / lenSq
    
    let xx, yy
    
    if (param < 0) {
      xx = lineStart.x
      yy = lineStart.y
    } else if (param > 1) {
      xx = lineEnd.x
      yy = lineEnd.y
    } else {
      xx = lineStart.x + param * C
      yy = lineStart.y + param * D
    }
    
    const dx = point.x - xx
    const dy = point.y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  function blocksOverlap(block1: UnifiedBlock, block2: UnifiedBlock): boolean {
    if (!block1.spatialProperties || !block2.spatialProperties) return false
    
    const rect1 = {
      left: block1.spatialProperties.position.x,
      top: block1.spatialProperties.position.y,
      right: block1.spatialProperties.position.x + block1.spatialProperties.size.width,
      bottom: block1.spatialProperties.position.y + block1.spatialProperties.size.height
    }
    
    const rect2 = {
      left: block2.spatialProperties.position.x,
      top: block2.spatialProperties.position.y,
      right: block2.spatialProperties.position.x + block2.spatialProperties.size.width,
      bottom: block2.spatialProperties.position.y + block2.spatialProperties.size.height
    }
    
    return !(rect1.right < rect2.left || 
             rect2.right < rect1.left || 
             rect1.bottom < rect2.top || 
             rect2.bottom < rect1.top)
  }
  
  function getBoundingBox(blocks: UnifiedBlock[]) {
    if (blocks.length === 0) return null
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    for (const block of blocks) {
      if (!block.spatialProperties) continue
      
      const { position, size } = block.spatialProperties
      minX = Math.min(minX, position.x)
      minY = Math.min(minY, position.y)
      maxX = Math.max(maxX, position.x + size.width)
      maxY = Math.max(maxY, position.y + size.height)
    }
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  }
  
  function getCenterPoint(positions: Position[]): Position {
    if (positions.length === 0) return { x: 0, y: 0 }
    
    const sum = positions.reduce(
      (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
      { x: 0, y: 0 }
    )
    
    return {
      x: sum.x / positions.length,
      y: sum.y / positions.length
    }
  }
  
  function generateGridPositions(count: number, start: Position, spacing: number): Position[] {
    const positions: Position[] = []
    const cols = Math.ceil(Math.sqrt(count))
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      
      positions.push({
        x: start.x + col * spacing,
        y: start.y + row * spacing
      })
    }
    
    return positions
  }
  
  // Pattern detection helpers
  function findGridPattern(blocks: UnifiedBlock[]): UnifiedBlock[] {
    // Simplified grid detection - look for blocks aligned in rows/columns
    const threshold = 20 // Alignment tolerance
    const aligned: UnifiedBlock[] = []
    
    for (const block of blocks) {
      if (!block.spatialProperties) continue
      
      const alignedCount = blocks.filter(other => {
        if (!other.spatialProperties || other.id === block.id) return false
        
        const xAligned = Math.abs(
          other.spatialProperties.position.x - block.spatialProperties.position.x
        ) < threshold
        
        const yAligned = Math.abs(
          other.spatialProperties.position.y - block.spatialProperties.position.y
        ) < threshold
        
        return xAligned || yAligned
      }).length
      
      if (alignedCount >= 2) {
        aligned.push(block)
      }
    }
    
    return aligned
  }
  
  function findLinePattern(blocks: UnifiedBlock[]): UnifiedBlock[] {
    // Simplified line detection
    if (blocks.length < 3) return []
    
    const centers = blocks.map(block => ({ block, center: getBlockCenter(block) }))
    const lineBlocks: UnifiedBlock[] = []
    
    for (let i = 0; i < centers.length - 2; i++) {
      for (let j = i + 1; j < centers.length - 1; j++) {
        for (let k = j + 1; k < centers.length; k++) {
          const dist1 = getDistanceToLine(centers[j].center, centers[i].center, centers[k].center)
          
          if (dist1 < 30) { // Tolerance for line alignment
            lineBlocks.push(centers[i].block, centers[j].block, centers[k].block)
          }
        }
      }
    }
    
    return [...new Set(lineBlocks)] // Remove duplicates
  }
  
  function findClusterPattern(blocks: UnifiedBlock[]): UnifiedBlock[] {
    // Simplified clustering - find blocks that are close together
    const clusterThreshold = 150
    const clustered: UnifiedBlock[] = []
    
    for (const block of blocks) {
      if (!block.spatialProperties) continue
      
      const nearbyCount = blocks.filter(other => {
        if (!other.spatialProperties || other.id === block.id) return false
        
        const distance = getDistance(
          getBlockCenter(block),
          getBlockCenter(other)
        )
        
        return distance < clusterThreshold
      }).length
      
      if (nearbyCount >= 2) {
        clustered.push(block)
      }
    }
    
    return clustered
  }
  
  function findScatteredPattern(blocks: UnifiedBlock[]): UnifiedBlock[] {
    // Find blocks that are relatively isolated
    const isolationThreshold = 200
    
    return blocks.filter(block => {
      if (!block.spatialProperties) return false
      
      const nearbyCount = blocks.filter(other => {
        if (!other.spatialProperties || other.id === block.id) return false
        
        const distance = getDistance(
          getBlockCenter(block),
          getBlockCenter(other)
        )
        
        return distance < isolationThreshold
      }).length
      
      return nearbyCount === 0
    })
  }
  
  function suggestGridPositions(existingBlocks: UnifiedBlock[], count: number): Position[] {
    const boundingBox = getBoundingBox(existingBlocks)
    if (!boundingBox) return []
    
    const spacing = 200
    const startX = boundingBox.x + boundingBox.width + spacing
    const startY = boundingBox.y
    
    return generateGridPositions(count, { x: startX, y: startY }, spacing)
  }
  
  function suggestClusterPositions(existingBlocks: UnifiedBlock[], count: number): Position[] {
    const center = getCenterPoint(existingBlocks.map(getBlockCenter))
    const positions: Position[] = []
    const radius = 100
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI
      positions.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius
      })
    }
    
    return positions
  }
  
  function suggestSpreadPositions(existingBlocks: UnifiedBlock[], count: number): Position[] {
    const boundingBox = getBoundingBox(existingBlocks)
    if (!boundingBox) return []
    
    const positions: Position[] = []
    const margin = 300
    
    // Spread around the existing content
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI
      const distance = Math.max(boundingBox.width, boundingBox.height) / 2 + margin
      
      positions.push({
        x: boundingBox.x + boundingBox.width / 2 + Math.cos(angle) * distance,
        y: boundingBox.y + boundingBox.height / 2 + Math.sin(angle) * distance
      })
    }
    
    return positions
  }
  
  return {
    // Spatial Queries
    findBlocksInRegion,
    findBlocksInCircle,
    findBlocksNear,
    findBlocksAlongPath,
    findOverlappingBlocks,
    findConnectedBlocks,
    findBlocksByPattern,
    
    // Spatial Analysis
    getSpatialStatistics,
    suggestOptimalPositions,
    
    // Utilities
    getBlockCenter,
    getDistance,
    getBoundingBox,
    getCenterPoint
  }
}
