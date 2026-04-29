import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { createDefaultDeck } from '../core/template.js';
import { buildDeckFromTemplate, listTemplates, loadTemplateManifest } from '../core/templates.js';
import { writeDeck } from '../core/deck.js';

interface InitOpts {
  author?: string;
  template?: string;
}

export async function initCommand(name?: string, opts?: InitOpts) {
  const deckName = name || 'my-deck';
  const dir = resolve(process.cwd(), deckName);

  if (existsSync(dir)) {
    console.error(`Error: directory "${deckName}" already exists.`);
    process.exit(1);
  }

  const templateName = opts?.template;
  let deck;
  let theme = 'default';

  if (templateName && templateName !== 'default') {
    const manifest = loadTemplateManifest(templateName);
    if (!manifest) {
      const available = listTemplates();
      console.error(`Error: unknown template "${templateName}". Available: default, ${available.join(', ')}`);
      process.exit(1);
    }
    deck = buildDeckFromTemplate(manifest, {
      title: deckName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      author: opts?.author || '',
    });
    theme = deck.config.theme;
  } else {
    deck = createDefaultDeck(
      deckName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      opts?.author || '',
    );
  }

  await mkdir(dir, { recursive: true });
  await mkdir(join(dir, 'assets'), { recursive: true });
  await writeDeck(dir, deck);

  await writeFile(
    join(dir, 'marker.config.js'),
    `export default {
  theme: '${theme}',
  // Set your Anthropic API key for AI review:
  // anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};
`,
    'utf-8',
  );

  console.log(`\n  Created ${deckName}/`);
  console.log(`  ├── deck.json        (${deck.slides.length} slides, theme: ${theme})`);
  console.log(`  ├── marker.config.js`);
  console.log(`  └── assets/\n`);
  console.log(`  Next: cd ${deckName} && marker dev\n`);
}
