# Unified Integration System

This document describes the unified integration system that seamlessly combines SiYuan's block-based note-taking with Heptabase's whiteboard functionality.

## Overview

The unified system creates a single, cohesive data architecture where all content exists as **unified blocks** that can appear in both document and whiteboard views simultaneously. This is fundamentally different from having two separate systems that share data - it's a true unified approach where the distinction between "document blocks" and "whiteboard nodes" becomes a matter of presentation rather than separate data entities.

## Key Features

### 🔗 Unified Data Model
- **Single Source of Truth**: All content stored as unified blocks
- **Dual Representation**: Blocks can appear in both hierarchical documents and spatial whiteboards
- **Real-time Synchronization**: Changes in one view automatically reflect in the other
- **Shared Properties**: Blocks maintain both hierarchical and spatial properties

### 📝 Document View (SiYuan-style)
- Hierarchical block structure with parent-child relationships
- Traditional note-taking interface with rich text editing
- Block-based content organization
- Outline view and document navigation
- Right-click context menu to add blocks to whiteboard

### 🎨 Whiteboard View (Heptabase-style)
- Spatial arrangement of blocks on infinite canvas
- Visual connections between blocks
- Drag-and-drop positioning and resizing
- Multiple canvas support with portals
- Right-click context menu to add blocks to documents

### ⚡ Cross-View Operations
- **Drag & Drop**: Seamlessly move blocks between document and whiteboard views
- **Bidirectional Linking**: Create connections that work in both views
- **Auto-layout**: Intelligent positioning based on hierarchical relationships
- **Multi-canvas Management**: Organize content across multiple whiteboards

## Architecture

### Core Components

#### 1. Unified Store (`src/stores/unified.ts`)
The central state management system that handles all blocks, documents, and canvases.

```typescript
interface UnifiedBlock {
  id: string
  type: UnifiedBlockType
  content: string
  properties: Record<string, any>
  children: string[]
  parentId?: string
  position: number
  spatialProperties?: SpatialProperties  // Optional spatial representation
  metadata: UnifiedBlockMetadata
}
```

#### 2. View Adapters
- **DocumentView** (`src/composables/useDocumentView.ts`): Presents blocks hierarchically
- **WhiteboardView** (`src/composables/useWhiteboardView.ts`): Presents blocks spatially
- **UnifiedIntegration** (`src/composables/useUnifiedIntegration.ts`): Handles cross-view operations

#### 3. Advanced Features
- **Block References** (`src/composables/useBlockReferences.ts`): Transclusion and linking
- **Spatial Queries** (`src/composables/useSpatialQueries.ts`): Advanced spatial analysis
- **Multi-Canvas** (`src/composables/useMultiCanvas.ts`): Canvas management and portals
- **Drag & Drop** (`src/composables/useDragAndDrop.ts`): Cross-view interactions

### Data Flow

```
User Action → View Adapter → Unified Store → Real-time Sync → All Views Update
```

1. User performs action in any view (document or whiteboard)
2. View adapter translates the action to unified store operations
3. Unified store updates the block data
4. Vue's reactivity system automatically updates all views
5. Changes are persisted to Tauri backend

## Usage Examples

### Creating Content
1. **In Document View**: Create blocks using traditional text editing
2. **In Whiteboard View**: Create spatial blocks by clicking on canvas
3. **Cross-View**: Right-click any block to add it to the other view

### Linking Content
1. **Manual Linking**: Right-click blocks and select "Add to Whiteboard/Document"
2. **Drag & Drop**: Drag blocks between document outline and whiteboard canvas
3. **Auto-detection**: System automatically detects `[[Block Title]]` references

### Advanced Operations
1. **Block References**: Use `[[Block Title]]` or `@BlockId` syntax for linking
2. **Spatial Queries**: Find blocks by pattern, proximity, or region
3. **Multi-Canvas**: Create portals between canvases, merge canvases
4. **Auto-layout**: Intelligent positioning based on content relationships

## Technical Implementation

### Frontend (Vue 3 + TypeScript)
- **Unified Store**: Pinia store managing all application state
- **Composables**: Reusable logic for different aspects of the system
- **Components**: Vue components for document and whiteboard interfaces
- **Types**: Comprehensive TypeScript definitions for type safety

### Backend (Tauri + Rust)
- **Unified Storage**: File-based storage with JSON serialization
- **Query Engine**: Advanced querying capabilities for blocks
- **Persistence**: Automatic saving and loading of workspace data
- **Cross-platform**: Desktop application with native performance

### Key Technologies
- **Vue 3**: Composition API with `<script setup>` syntax
- **TypeScript**: Full type safety throughout the application
- **Pinia**: State management with reactive stores
- **Tauri**: Desktop application framework with Rust backend
- **Tailwind CSS + DaisyUI**: Styling and UI components

## API Reference

### Unified Store Methods

```typescript
// Block Operations
createBlock(type: UnifiedBlockType, content: string, options?: CreateBlockOptions)
updateBlock(blockId: string, updates: UpdateBlockOptions)
deleteBlock(blockId: string)

// Cross-View Operations
addBlockToCanvas(blockId: string, canvasId: string, position: Position)
removeBlockFromCanvas(blockId: string, canvasId: string)

// Advanced Queries
queryBlocks(query: BlockQuery): QueryResult
createBlockReference(fromBlockId: string, toBlockId: string, type: 'embed' | 'link' | 'mention')
```

### View Adapter Methods

```typescript
// Document View
createDocument(title?: string)
createBlockAfter(afterBlockId: string, type?: UnifiedBlockType)
addBlockToWhiteboard(blockId: string, canvasId?: string)

// Whiteboard View
createCanvas(name?: string)
createSpatialBlock(type: UnifiedBlockType, position: Position, content?: string)
addBlockToDocument(blockId: string, documentId?: string)
```

## Development Guidelines

### Adding New Features
1. Define types in `src/types/unified.ts`
2. Implement logic in appropriate composable
3. Update unified store if needed
4. Add Tauri commands for persistence
5. Create UI components
6. Write tests

### Best Practices
1. **Type Safety**: Always use TypeScript interfaces
2. **Reactivity**: Leverage Vue's reactivity system
3. **Composables**: Extract reusable logic into composables
4. **Error Handling**: Provide user-friendly error messages
5. **Performance**: Optimize for large numbers of blocks

### Testing Strategy
1. **Unit Tests**: Test individual composables and utilities
2. **Integration Tests**: Test cross-view operations
3. **E2E Tests**: Test complete user workflows
4. **Performance Tests**: Test with large datasets

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user editing with conflict resolution
- **Plugin System**: Extensible architecture for custom functionality
- **Import/Export**: Support for various file formats
- **Advanced Visualizations**: Graph views, timeline views, etc.
- **AI Integration**: Smart suggestions and content generation

### Scalability Considerations
- **Virtual Scrolling**: Handle large numbers of blocks efficiently
- **Lazy Loading**: Load content on demand
- **Indexing**: Fast search and query capabilities
- **Caching**: Intelligent caching strategies

## Conclusion

The unified integration system represents a new paradigm in knowledge management tools, where the traditional boundaries between different content organization methods dissolve into a seamless, unified experience. By treating all content as unified blocks that can be presented in multiple ways, users can leverage the strengths of both hierarchical and spatial organization without the friction of context switching between separate tools.

This architecture provides a solid foundation for future enhancements while maintaining simplicity and performance in the current implementation.
