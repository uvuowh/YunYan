// Vitest 配置
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],

  // 路径别名配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend'),
      '@shared': resolve(__dirname, 'shared'),
    },
  },

  test: {
    // 测试环境
    environment: 'happy-dom',

    // 全局测试设置
    globals: true,

    // 包含的测试文件
    include: [
      'frontend/**/*.{test,spec}.{js,ts,vue}',
      'shared/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{js,ts,vue}',
    ],

    // 排除的文件
    exclude: ['node_modules', 'dist', 'src-tauri', '.git', '.cache'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'src-tauri/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts', // 通常只是导出文件
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 类型检查
    typecheck: {
      include: ['**/*.{test,spec}.{js,ts,vue}'],
    },

    // 测试超时
    testTimeout: 10000,

    // 并发设置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // 监听模式配置
    watch: {
      ignore: ['node_modules', 'dist', 'src-tauri'],
    },

    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-results.html',
    },

    // Mock 配置
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
})
