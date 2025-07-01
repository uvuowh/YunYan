// ESLint 配置 - 基础版本
export default [
  {
    ignores: [
      'dist/**',
      'assets/**',
      'node_modules/**',
      'src-tauri/target/**',
      'src-tauri/gen/**',
      'coverage/**',
      'test-results.*',
      '*.d.ts',
    ],
  },
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]
