import { resolve } from 'path';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFile, writeFile, cp, mkdir } from 'fs/promises';
import { readDeck, deckExists } from '../core/deck.js';
import { rendererDist } from '../core/paths.js';

export async function shareCommand(opts?: { local?: boolean }) {
  const dir = resolve(process.cwd());

  if (!deckExists(dir)) {
    console.error('Error: no deck.json in current directory.');
    process.exit(1);
  }

  const prebuilt = rendererDist();
  if (!existsSync(resolve(prebuilt, 'index.html'))) {
    console.error('Error: renderer not built. Run from an installed marker-slides package or build first.');
    process.exit(1);
  }

  console.log('Building deck for sharing...');

  const distDir = resolve(dir, 'dist');
  await mkdir(distDir, { recursive: true });

  // Copy pre-built renderer
  await cp(prebuilt, distDir, { recursive: true });

  // Read deck and embed as static data
  const deck = await readDeck(dir);

  // Inject deck data into index.html so it works without a server
  const indexPath = resolve(distDir, 'index.html');
  let html = await readFile(indexPath, 'utf-8');
  const deckScript = `<script>window.__MARKER_DECK__=${JSON.stringify(deck)};</script>`;
  html = html.replace('</head>', `${deckScript}\n</head>`);
  await writeFile(indexPath, html, 'utf-8');

  console.log(`Built to ${distDir}/ (${deck.slides.length} slides)`);

  if (opts?.local) {
    console.log('Serve with: npx serve dist');
    return;
  }

  // Try surge
  let hasSurge = false;
  try { execSync('which surge', { stdio: 'pipe' }); hasSurge = true; } catch { /* */ }

  if (hasSurge) {
    const slug = dir.split('/').pop()?.replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'deck';
    const domain = `${slug}-${Date.now().toString(36)}.surge.sh`;
    console.log(`Deploying to ${domain}...`);
    try {
      execSync(`surge ${distDir} ${domain}`, { stdio: 'inherit' });
      console.log(`\n  Live at: https://${domain}\n`);
    } catch {
      console.error('Surge deploy failed. Your build is at ./dist/');
    }
  } else {
    console.log('\nTo share online: npm i -g surge && surge dist');
  }
}
