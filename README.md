# YunYan

A modern desktop application built with Tauri, Vue 3, and TypeScript, featuring a powerful canvas-based whiteboard interface and block-based file system.

## 🚀 Features

- **Canvas Whiteboard**: Interactive whiteboard with nodes, connections, and grid-based layout
- **Block-based File System**: Efficient file management with block-based architecture
- **Modern Tech Stack**: Built with Tauri + Vue 3 + TypeScript + Vite
- **Responsive Design**: Optimized for desktop with mobile-friendly responsive layout
- **Dark Mode Support**: Complete dark/light theme system
- **Maple Mono Font**: Optimized typography for Chinese characters and code
- **Real-time Interaction**: Smooth drag-and-drop, zooming, and panning
- **Type Safety**: Full TypeScript coverage with strict type checking

## 🏗️ Architecture

### Frontend (Vue 3 + TypeScript)

- **Components**: Modular UI components with canvas nodes, infinite grid, and layout elements
- **Views**: Dashboard, Canvas whiteboard, Files, and Settings pages
- **State Management**: Pinia stores for application state and user preferences
- **Styling**: SCSS with design system variables and Maple Mono font integration

### Backend (Tauri + Rust)

- **Commands**: IPC handlers for system operations and file management
- **Models**: Shared data structures between frontend and backend
- **Error Handling**: Centralized error management with custom types

## 📁 Project Structure

```
yunyan/
├── src/                          # Frontend source code
│   ├── assets/
│   │   ├── scss/                 # Design system and global styles
│   │   └── resources/            # Fonts and static resources
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── layout/               # App header and sidebar
│   │   └── canvas/               # Canvas-specific components
│   ├── core/
│   │   ├── api/                  # Tauri IPC and HTTP wrappers
│   │   ├── stores/               # Pinia state management
│   │   ├── hooks/                # Vue composables
│   │   └── utils/                # Utility functions
│   ├── views/                    # Page components
│   ├── router/                   # Vue Router configuration
│   ├── App.vue                   # Root application component
│   └── main.ts                   # Application entry point
└── src-tauri/                    # Tauri backend
    ├── src/
    │   ├── commands/             # Tauri command handlers
    │   ├── models/               # Data models
    │   └── error.rs              # Error handling
    └── tauri.conf.json           # Tauri configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **pnpm**
- **Rust** 1.70+
- **Tauri CLI**: `cargo install tauri-cli`
- Platform-specific dependencies for Tauri development

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd YunYan
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Run in development mode**

   ```bash
   pnpm tauri dev
   ```

4. **Build for production**
   ```bash
   pnpm tauri build
   ```

## 🎨 Key Features

### Canvas Whiteboard

- **Interactive Nodes**: Create, edit, and connect nodes with drag-and-drop
- **Infinite Grid**: Smooth panning and zooming with grid snapping
- **Node Types**: Support for text, notes, and image nodes
- **Connections**: Visual connections between nodes with different types
- **Grid Alignment**: Optimized for Chinese characters with Maple Mono font

### Modern UI/UX

- **Responsive Layout**: Mobile-friendly design with collapsible sidebar
- **Dark Mode**: Complete theme system with smooth transitions
- **Typography**: Maple Mono font optimized for code and Chinese characters
- **Smooth Interactions**: Optimized drag thresholds and mouse handling

## 🛠️ Development

### Code Style

- **ESLint + Prettier**: Automated code formatting and linting
- **TypeScript**: Strict mode enabled for maximum type safety
- **Vue 3 Composition API**: Modern Vue development patterns
- **SCSS**: Organized styling with design system variables

### Adding New Features

1. **Canvas Components**: Add new node types in `src/components/canvas/`
2. **UI Components**: Create reusable components in `src/components/ui/`
3. **Backend Commands**: Add Tauri commands in `src-tauri/src/commands/`
4. **State Management**: Extend Pinia stores in `src/core/stores/`
5. **Views**: Add new pages in `src/views/`

## 🎯 Roadmap

- [ ] Enhanced node types (images, files, links)
- [ ] Collaborative editing features
- [ ] Plugin system for extensibility
- [ ] Advanced file management
- [ ] Export/import functionality
- [ ] Performance optimizations

## 📝 License

This project is licensed under the **GPL v3 License**.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Tauri, Vue 3, and TypeScript.
