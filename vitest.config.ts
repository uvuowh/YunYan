import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'src-tauri'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'src-tauri/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts', // Re-export files
      ],
    },
  },
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
})
