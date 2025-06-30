import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/composables': resolve(__dirname, 'src/composables'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/views': resolve(__dirname, 'src/views'),
      '@/layouts': resolve(__dirname, 'src/layouts'),
      '@/router': resolve(__dirname, 'src/router'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
    },
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
  },

  // Build configuration
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@vueuse/core'],
        },
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },

  // Environment variables
  envPrefix: ['VITE_', 'TAURI_'],

  // Development optimizations
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
  },
}))
