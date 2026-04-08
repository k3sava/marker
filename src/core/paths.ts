import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Root of the marker-slides package (where package.json lives) */
export function packageRoot(): string {
  // From src/core/paths.ts -> go up 2 levels to package root
  // From dist/cli/paths.js -> go up 2 levels to package root
  const candidate = resolve(__dirname, '..', '..');
  if (existsSync(resolve(candidate, 'package.json'))) return candidate;

  // Fallback: walk up until we find package.json with name "marker-slides"
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    const pkg = resolve(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        const { name } = JSON.parse(require('fs').readFileSync(pkg, 'utf-8'));
        if (name === 'marker-slides') return dir;
      } catch { /* keep walking */ }
    }
    dir = resolve(dir, '..');
  }

  return candidate;
}

/** Pre-built renderer directory (dist/renderer/) */
export function rendererDist(): string {
  return resolve(packageRoot(), 'dist', 'renderer');
}

/** Source renderer directory (src/renderer/) for dev mode */
export function rendererSrc(): string {
  return resolve(packageRoot(), 'src', 'renderer');
}
