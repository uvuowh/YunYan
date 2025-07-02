# YunYan - Simplified Architecture

## What Was Simplified

The project has been streamlined to focus on the core architecture while removing complex features that aren't essential for the basic framework.

### Removed Features
- ❌ Authentication module (`src/features/auth/`)
- ❌ Complex validation utilities
- ❌ Local storage hooks
- ❌ Theme management hooks
- ❌ Test infrastructure
- ❌ Complex navigation with submenus
- ❌ File persistence for user preferences

### Kept Core Features
- ✅ Tauri backend with commands and models
- ✅ Vue 3 + TypeScript frontend
- ✅ Pinia state management (simplified)
- ✅ Basic UI components (Button, Input, Card)
- ✅ Layout components (Header, Sidebar)
- ✅ Router with basic navigation
- ✅ SCSS design system
- ✅ Platform utilities
- ✅ Async handling hooks
- ✅ Development tooling (ESLint, Prettier)

## Current Structure

```
yunyan/
├── src/
│   ├── assets/scss/              # Design system and global styles
│   ├── components/
│   │   ├── ui/                   # Basic UI components
│   │   └── layout/               # Header and Sidebar
│   ├── core/
│   │   ├── api/                  # Tauri IPC and HTTP wrappers
│   │   ├── stores/               # Simplified Pinia stores
│   │   ├── hooks/                # Basic async hook
│   │   └── utils/                # Platform detection only
│   ├── router/                   # Simple routing
│   ├── views/                    # Dashboard, Files, Settings pages
│   ├── App.vue                   # Main app layout
│   └── main.ts                   # App initialization
└── src-tauri/
    ├── src/
    │   ├── commands/             # System and file commands
    │   ├── models/               # Data structures
    │   └── error.rs              # Error handling
    └── tauri.conf.json           # Tauri configuration
```

## What You Get

This simplified version provides:

1. **Clean Architecture Foundation**
   - Modular structure ready for expansion
   - Type-safe communication between frontend and backend
   - Proper separation of concerns

2. **Working Application**
   - Dashboard with system information
   - File management placeholder
   - Settings page structure
   - Dark/light mode support

3. **Development Ready**
   - Hot reload in development
   - Code formatting and linting
   - TypeScript strict mode
   - Path aliases configured

## Next Steps

To extend this foundation:

1. **Add Features**: Create new modules in `src/features/`
2. **Expand UI**: Add more components to `src/components/ui/`
3. **Backend Logic**: Add more commands in `src-tauri/src/commands/`
4. **State Management**: Extend stores as needed
5. **Testing**: Add test infrastructure when ready

## Running the Project

```bash
# Install dependencies
pnpm install

# Run in development
pnpm tauri dev

# Build for production
pnpm tauri build
```

This simplified version gives you a solid foundation to build upon while keeping the codebase clean and maintainable.
