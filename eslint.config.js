import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import checkFile from 'eslint-plugin-check-file'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const sharedDirectories = ['components', 'hooks', 'lib', 'types', 'utils']
const featureDirectories = ['auth', 'users']

const nodeFiles = [
  'vite.config.ts',
  'playwright.config.ts',
  'mock-server.ts',
  'e2e/**/*.ts',
]

const testFiles = [
  'src/**/*.test.ts',
  'src/**/*.test.tsx',
  'src/**/*.spec.ts',
  'src/**/*.spec.tsx',
  'src/testing/**/*.ts',
  'src/testing/**/*.tsx',
]

export default defineConfig([
  {
    plugins: {
      'check-file': checkFile,
    },
  },
  globalIgnores(['dist', 'node_modules', 'coverage', 'generators/*']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      reactPlugin.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          noWarnOnMultipleProjects: true,
          project: [
            './tsconfig.app.json',
            './tsconfig.node.json',
            './tsconfig.test.json',
          ],
        },
      },
    },
    rules: {
      curly: ['error', 'all'],
      'linebreak-style': ['error', 'unix'],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'import/default': 'off',
      'import/no-cycle': 'error',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',
      'import/no-relative-parent-imports': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*'],
              message:
                'Use an absolute/aliased import instead of a parent-relative import.',
            },
          ],
        },
      ],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Disable cross-feature imports.
            ...featureDirectories.map((directory) => ({
              target: `./src/features/${directory}`,
              from: './src/features',
              except: [`./${directory}`],
            })),
            // Enforce unidirectional codebase: app can import features, not the reverse.
            {
              target: './src/features',
              from: './src/app',
            },
            // Shared modules can be imported by app/features, but not the reverse.
            {
              target: sharedDirectories.map(
                (directory) => `./src/${directory}`,
              ),
              from: ['./src/features', './src/app'],
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
            {
              pattern: '@app/**',
              group: 'internal',
            },
            {
              pattern: '@components/**',
              group: 'internal',
            },
            {
              pattern: '@config/**',
              group: 'internal',
            },
            {
              pattern: '@features/**',
              group: 'internal',
            },
            {
              pattern: '@hooks/**',
              group: 'internal',
            },
            {
              pattern: '@lib/**',
              group: 'internal',
            },
            {
              pattern: '@testing/**',
              group: 'internal',
            },
            {
              pattern: '@types/**',
              group: 'internal',
            },
            {
              pattern: '@utils/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: testFiles,
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: testFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: nodeFiles,
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/**/!(__tests__)/*'],
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/*': 'KEBAB_CASE',
        },
      ],
    },
  },
])
