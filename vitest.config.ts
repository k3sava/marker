import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: { '@marker': resolve(__dirname, 'src') },
  },
  test: {
    include: ['test/**/*.test.ts'],
  },
});
