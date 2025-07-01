import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // 设置根目录为 frontend
  root: resolve(__dirname, 'frontend'),

  // 设置构建输出目录
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,

    // 构建优化
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development',

    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库打包到一个 chunk
          vue: ['vue', 'pinia'],
          // 将 Tauri API 打包到一个 chunk
          tauri: ['@tauri-apps/api'],
          // 将工具库打包到一个 chunk
          utils: ['@shared/types'],
        },
        // 优化 chunk 文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // 构建性能优化
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend'),
      '@shared': resolve(__dirname, 'shared'),
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
      ignored: ['**/src-tauri/**', '**/node_modules/**', '**/dist/**'],
    },
    // 开发服务器优化
    fs: {
      // 允许访问项目根目录之外的文件
      allow: ['..'],
    },
  },

  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'pinia', '@tauri-apps/api/core', '@tauri-apps/api/event'],
    exclude: ['@tauri-apps/plugin-opener'],
  },

  // 预构建配置
  esbuild: {
    // 移除 console 和 debugger（仅在生产环境）
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
}))
