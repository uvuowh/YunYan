# YunYan - Vue 3 + TypeScript + Tauri Desktop Application

A modern, production-ready desktop application built with Vue 3, TypeScript, and Tauri. This project follows best practices and includes a comprehensive development setup with testing, linting, and modern UI components.

## ✨ Features

- **🚀 Vue 3** - Latest Vue.js with Composition API and `<script setup>` syntax
- **📝 TypeScript** - Full TypeScript support with strict type checking
- **💻 Tauri** - Lightweight, secure desktop application framework
- **🎨 Modern UI** - Beautiful interface with Tailwind CSS and DaisyUI
- **🗃️ State Management** - Pinia for efficient state management
- **🧩 Composables** - VueUse integration for reusable composition functions
- **🔧 Developer Experience** - Hot reload, ESLint, Prettier, and comprehensive tooling
- **🧪 Testing** - Unit tests with Vitest and E2E tests with Playwright
- **📱 Responsive** - Mobile-first responsive design
- **🌙 Dark Mode** - Built-in theme switching with system preference detection
- **🔔 Notifications** - Toast notification system
- **🛡️ Type Safety** - Comprehensive TypeScript interfaces and type guards

## 🏗️ Project Structure

```
yunyan/
├── src/
│   ├── assets/          # Static assets and styles
│   ├── components/      # Reusable Vue components
│   │   ├── ui/         # Base UI components
│   │   └── app/        # App-specific components
│   ├── composables/     # Reusable composition functions
│   ├── layouts/         # Layout components
│   ├── router/          # Vue Router configuration
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── src-tauri/           # Tauri backend (Rust)
├── tests/               # Test files
│   ├── unit/           # Unit tests
│   └── e2e/            # End-to-end tests
├── docs/                # Documentation
└── public/              # Public assets
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm
- [Rust](https://rustup.rs/) (for Tauri)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yunyan
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm tauri:dev
   ```

## 📜 Available Scripts

### Development
- `pnpm dev` - Start Vite development server
- `pnpm tauri:dev` - Start Tauri development mode
- `pnpm type-check` - Run TypeScript type checking

### Building
- `pnpm build` - Build for production
- `pnpm tauri:build` - Build Tauri application
- `pnpm preview` - Preview production build

### Code Quality
- `pnpm lint` - Run ESLint and fix issues
- `pnpm lint:check` - Check for linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

### Testing
- `pnpm test` - Run unit tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run tests with coverage
- `pnpm test:e2e` - Run E2E tests
- `pnpm test:e2e:ui` - Run E2E tests with UI

## 🛠️ Technology Stack

### Frontend
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript framework
- **[TypeScript](https://www.typescriptlang.org/)** - Typed superset of JavaScript
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Vue Router](https://router.vuejs.org/)** - Official router for Vue.js
- **[Pinia](https://pinia.vuejs.org/)** - Vue Store that you will enjoy using

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[DaisyUI](https://daisyui.com/)** - Tailwind CSS component library
- **[VueUse](https://vueuse.org/)** - Collection of Vue Composition Utilities

### Desktop
- **[Tauri](https://tauri.app/)** - Build smaller, faster, and more secure desktop applications

### Development Tools
- **[ESLint](https://eslint.org/)** - Linting utility for JavaScript and TypeScript
- **[Prettier](https://prettier.io/)** - Code formatter
- **[Vitest](https://vitest.dev/)** - Unit testing framework
- **[Playwright](https://playwright.dev/)** - End-to-end testing

## 🎨 UI Components

The project includes a comprehensive set of reusable UI components:

### Base Components
- `BaseButton` - Flexible button component with variants and states
- `BaseCard` - Card container with customizable styling
- `BaseInput` - Form input with validation support
- `BaseModal` - Modal dialog with backdrop and keyboard handling

### Layout Components
- `DefaultLayout` - Main application layout with header, sidebar, and footer
- `AuthLayout` - Authentication pages layout

### App Components
- `AppHeader` - Navigation header with user menu and theme toggle
- `AppSidebar` - Navigation sidebar with menu items
- `AppFooter` - Application footer
- `NotificationContainer` - Toast notification system

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_APP_NAME=YunYan
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://api.example.com
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- DaisyUI theme integration
- Typography plugin
- Custom animations and utilities

### TypeScript Configuration
Strict TypeScript configuration with:
- Path mapping for clean imports
- Strict type checking
- Vue SFC support
- Comprehensive type definitions

## 📱 Features Overview

### Authentication
- Login and registration forms
- User profile management
- Session persistence
- Route protection

### Theme System
- Light/Dark/Auto theme modes
- System preference detection
- Persistent theme selection
- Smooth theme transitions

### State Management
- Centralized app state with Pinia
- User authentication state
- Theme preferences
- Notification system

### Notifications
- Toast notifications with different types
- Auto-dismiss functionality
- Manual dismissal
- Progress indicators for timed notifications

## 🧪 Testing Strategy

### Unit Tests
- Component testing with Vue Test Utils
- Store testing with Pinia
- Utility function testing
- Composable testing

### E2E Tests
- User flow testing
- Cross-browser compatibility
- Visual regression testing
- Performance testing

## 📚 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use `<script setup>` syntax
- Implement proper error handling
- Write comprehensive JSDoc comments

### Component Guidelines
- Use PascalCase for component names
- Implement proper prop validation
- Use TypeScript interfaces for props
- Follow atomic design principles
- Ensure accessibility compliance

### State Management
- Use Pinia stores for global state
- Keep stores focused and modular
- Implement proper error handling
- Use TypeScript for store definitions

## 🚀 Deployment

### Building for Production
```bash
pnpm tauri:build
```

This will create platform-specific installers in the `src-tauri/target/release/bundle/` directory.

### Supported Platforms
- Windows (MSI, NSIS)
- macOS (DMG, App Bundle)
- Linux (AppImage, DEB, RPM)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup
1. Install dependencies: `pnpm install`
2. Run tests: `pnpm test`
3. Start development server: `pnpm tauri:dev`
4. Follow the coding guidelines
5. Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vue.js Team](https://vuejs.org/) for the amazing framework
- [Tauri Team](https://tauri.app/) for the desktop application framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [DaisyUI](https://daisyui.com/) for the beautiful component library

## 📞 Support

If you have any questions or need help, please:
- Check the [documentation](docs/)
- Open an [issue](https://github.com/your-username/yunyan/issues)
- Join our [Discord community](https://discord.gg/your-invite)

---

Built with ❤️ using Vue 3, TypeScript, and Tauri
