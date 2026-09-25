import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';
export default defineConfig(
  // Downloaded publisher evidence is not application code; keep the research
  // tools themselves, source modules and tests in the normal checks.
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'artifacts/**', 'playwright-report/**', 'test-results/**', 'research/source-files/**', '.claude/worktrees/**'] },
  js.configs.recommended, ...tseslint.configs.recommended, ...astro.configs.recommended,
  { files: ['**/*.js', '**/*.ts', '**/*.tsx', '**/*.astro'], languageOptions: { globals: { process: 'readonly', console: 'readonly', Buffer: 'readonly', URL: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', fetch: 'readonly', AbortSignal: 'readonly' } } },
);
