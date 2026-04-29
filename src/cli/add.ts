import { resolve } from 'path';
import { readDeck, writeDeck, deckExists } from '../core/deck.js';
import { createFreeformSlideFromTemplate, createSlideTemplate } from '../core/template.js';
import { loadLayoutHtml, loadTemplateManifest } from '../core/templates.js';
import { SLIDE_TYPES, type Slide, type SlideType } from '../core/types.js';

interface AddOpts {
  after?: string;
  layout?: string;
  template?: string;
}

export async function addCommand(type?: string, opts?: AddOpts) {
  const dir = resolve(process.cwd());

  if (!deckExists(dir)) {
    console.error('Error: no deck.json in current directory. Run "marker init" first.');
    process.exit(1);
  }

  if (!type) {
    console.log('Available slide types:');
    SLIDE_TYPES.forEach(t => console.log(`  marker add ${t}`));
    console.log('\nFor freeform slides, pick a layout from a template:');
    console.log('  marker add freeform --template justcall-q1 --layout kpi-dashboard');
    return;
  }

  if (!SLIDE_TYPES.includes(type as SlideType)) {
    console.error(`Error: unknown slide type "${type}". Valid: ${SLIDE_TYPES.join(', ')}`);
    process.exit(1);
  }

  const deck = await readDeck(dir);

  let newSlide: Slide;

  if (type === 'freeform' && opts?.layout) {
    const templateName = opts.template || deck.config.theme;
    const manifest = loadTemplateManifest(templateName);
    if (!manifest) {
      console.error(`Error: no template "${templateName}" with manifest. Pass --template <name>.`);
      process.exit(1);
    }
    const entry = manifest.layouts.find(l => l.slug === opts.layout);
    if (!entry) {
      console.error(`Error: layout "${opts.layout}" not found in template "${templateName}". Available: ${manifest.layouts.map(l => l.slug).join(', ')}`);
      process.exit(1);
    }
    const html = loadLayoutHtml(templateName, entry.file);
    newSlide = createFreeformSlideFromTemplate(entry.slug, entry.label, html) as Slide;
  } else {
    const template = createSlideTemplate(type);
    if (!template) { console.error('Failed to create template.'); process.exit(1); }
    newSlide = template as unknown as Slide;
  }

  if (opts?.after) {
    const idx = deck.slides.findIndex(s => s.id === opts.after);
    if (idx === -1) {
      console.error(`Error: slide "${opts.after}" not found.`);
      process.exit(1);
    }
    deck.slides.splice(idx + 1, 0, newSlide);
  } else {
    deck.slides.push(newSlide);
  }

  await writeDeck(dir, deck);
  console.log(`Added ${type}${opts?.layout ? ` (${opts.layout})` : ''} slide (${newSlide.id}). Deck now has ${deck.slides.length} slides.`);
}
