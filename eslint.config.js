import js from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  // 全局忽略配置
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'test-results/**',
      'playwright-report/**',
      'src-tauri/**',
      '**/*.min.js',
      '**/*.min.css',
    ],
  },

  // 基础 JavaScript 推荐配置
  js.configs.recommended,

  // TypeScript 推荐配置
  ...tseslint.configs.recommended,

  // Vue 推荐配置
  ...pluginVue.configs['flat/recommended'],

  // Prettier 配置，确保与 ESLint 无冲突
  prettier,

  // JavaScript 文件配置
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Vite 环境变量
        import: 'readonly',
        // 浏览器环境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        // Node.js 环境（用于配置文件）
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },

    rules: {
      // 基础代码质量规则
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // 代码风格规则（与 Prettier 兼容）
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
    },
  },

  // TypeScript 文件配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        // Vite 环境变量
        import: 'readonly',
        // 浏览器环境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        // Node.js 环境
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      // 禁用 JavaScript 规则，使用 TypeScript 版本
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',

      // TypeScript 特定规则
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',

      // 基础代码质量规则
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // 代码风格规则（与 Prettier 兼容）
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
    },
  },

  // Vue 文件配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
      globals: {
        // Vue 环境变量
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        // Vite 环境变量
        import: 'readonly',
        // 浏览器环境
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
      },
    },

    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      // Vue 特定规则
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-vars': 'warn',
      'vue/prefer-import-from-vue': 'error',
      'vue/no-deprecated-slot-attribute': 'error',
      'vue/no-deprecated-slot-scope-attribute': 'error',

      // TypeScript 规则（适用于 Vue 中的 script）
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // 基础代码质量规则
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // 代码风格规则（与 Prettier 兼容）
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
    },
  },
]
