# YunYan

A modern desktop application built with Tauri, Vue 3, and TypeScript, featuring a clean and scalable architecture.

## 🚀 Features

- **Modern Tech Stack**: Tauri + Vue 3 + TypeScript + Vite
- **Type Safety**: Full TypeScript coverage with strict type checking
- **State Management**: Pinia for reactive state management
- **Routing**: Vue Router with lazy loading
- **UI Components**: Custom component library with dark mode support
- **Styling**: SCSS with design system variables
- **Development Tools**: ESLint, Prettier, and VSCode configuration

## 📁 Project Structure

```
yunyan/
├── src/                          # Frontend source code
│   ├── assets/                   # Static assets
│   │   └── scss/                 # Global styles and design system
│   │       ├── _variables.scss   # Design tokens and CSS variables
│   │       └── index.scss        # Global styles and utilities
│   ├── components/               # Reusable Vue components
│   │   ├── ui/                   # Basic UI components
│   │   │   ├── Button.vue        # Button component with variants
│   │   │   ├── Input.vue         # Form input component
│   │   │   ├── Card.vue          # Card container component
│   │   │   └── index.ts          # Component exports
│   │   └── layout/               # Layout components
│   │       ├── AppHeader.vue     # Application header
│   │       ├── Sidebar.vue       # Navigation sidebar
│   │       └── index.ts          # Layout exports
│   ├── core/                     # Core application modules
│   │   ├── api/                  # API layer
│   │   │   ├── tauri/            # Tauri IPC wrappers
│   │   │   │   ├── system.ts     # System information API
│   │   │   │   ├── files.ts      # File operations API
│   │   │   │   └── types.ts      # Shared type definitions
│   │   │   ├── http.ts           # HTTP client for external APIs
│   │   │   └── index.ts          # API exports
│   │   ├── stores/               # Pinia state stores
│   │   │   ├── app.ts            # Application global state
│   │   │   ├── user.ts           # User state and preferences
│   │   │   └── index.ts          # Store exports and initialization
│   │   ├── hooks/                # Vue composables
│   │   │   ├── useAsync.ts       # Async operation handling
│   │   │   └── index.ts          # Hook exports
│   │   ├── utils/                # Utility functions
│   │   │   ├── platform.ts       # Platform detection utilities
│   │   │   └── index.ts          # Utility exports
│   │   └── index.ts              # Core module exports
│   ├── router/                   # Vue Router configuration
│   │   └── index.ts              # Route definitions and guards
│   ├── views/                    # Page components
│   │   ├── Dashboard.vue         # Dashboard page
│   │   ├── Files.vue             # File management page
│   │   └── Settings.vue          # Settings page
│   ├── App.vue                   # Root application component
│   ├── main.ts                   # Application entry point
│   └── vite-env.d.ts            # Vite environment types
├── src-tauri/                    # Tauri backend
│   ├── src/                      # Rust source code
│   │   ├── commands/             # Tauri command handlers
│   │   │   ├── system.rs         # System information commands
│   │   │   ├── files.rs          # File operation commands
│   │   │   └── mod.rs            # Command module exports
│   │   ├── models/               # Shared data structures
│   │   │   ├── system.rs         # System information models
│   │   │   ├── user.rs           # User data models
│   │   │   └── mod.rs            # Model exports
│   │   ├── error.rs              # Error handling and types
│   │   ├── lib.rs                # Library entry point
│   │   └── main.rs               # Application entry point
│   ├── tauri.conf.json           # Tauri configuration
│   ├── Cargo.toml                # Rust dependencies
│   └── build.rs                  # Build script
├── .vscode/                      # VSCode configuration
│   └── settings.json             # Editor settings
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
├── package.json                  # Node.js dependencies
└── README.md                     # Project documentation
```

## 🏗️ Architecture Overview

### Backend (Tauri/Rust)

- **Commands**: IPC handlers for frontend-backend communication
- **Models**: Shared data structures between frontend and backend
- **Error Handling**: Centralized error management with custom types

### Frontend (Vue 3/TypeScript)

- **Core Layer**: Reusable utilities, API wrappers, and state management
- **Component Layer**: UI components organized by complexity (ui/layout)
- **View Layer**: Page-level components connected to routing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Rust 1.70+
- Platform-specific dependencies for Tauri

### Installation

```bash
# Install frontend dependencies
pnpm install

# Install Tauri CLI (if not already installed)
cargo install tauri-cli

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## 🛠️ Development

### Code Style

- ESLint + Prettier for code formatting
- TypeScript strict mode enabled
- Vue 3 Composition API preferred

### Adding New Features

1. Create feature module in `src/features/`
2. Add Tauri commands in `src-tauri/src/commands/`
3. Define shared types in both frontend and backend
4. Add routes and navigation

### Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## 📝 License

This project is licensed under the GPL v3 License.
