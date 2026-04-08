import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { createDefaultDeck } from '../core/template.js';
import { writeDeck } from '../core/deck.js';

export async function initCommand(name?: string, opts?: { author?: string }) {
  const deckName = name || 'my-deck';
  const dir = resolve(process.cwd(), deckName);

  if (existsSync(dir)) {
    console.error(`Error: directory "${deckName}" already exists.`);
    process.exit(1);
  }

  await mkdir(dir, { recursive: true });
  await mkdir(join(dir, 'assets'), { recursive: true });

  const deck = createDefaultDeck(
    deckName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    opts?.author || '',
  );

  await writeDeck(dir, deck);

  await writeFile(
    join(dir, 'marker.config.js'),
    `export default {
  theme: 'default',
  // Set your Anthropic API key for AI review:
  // anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};
`,
    'utf-8',
  );

  console.log(`\n  Created ${deckName}/`);
  console.log(`  ├── deck.json        (${deck.slides.length} slides)`);
  console.log(`  ├── marker.config.js (theme + settings)`);
  console.log(`  └── assets/\n`);
  console.log(`  Next: cd ${deckName} && marker dev\n`);
}
