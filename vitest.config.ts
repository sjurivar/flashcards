import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      '@app': resolve(rootDir, 'src/app'),
      '@shared': resolve(rootDir, 'src/shared'),
      '@features': resolve(rootDir, 'src/features'),
    },
  },
  define: {
    'import.meta.env.BASE_URL': JSON.stringify('/'),
  },
  test: {
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
  },
});
