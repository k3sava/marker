import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm'],
  outDir: 'dist/cli',
  target: 'node18',
  platform: 'node',
  splitting: true,
  sourcemap: true,
  clean: true,
  // Don't bundle deps — they'll be in node_modules at runtime
  external: [/^[^./]/],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});
