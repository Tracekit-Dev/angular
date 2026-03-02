import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@tracekit/browser': path.resolve(__dirname, '../browser/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
  },
});
