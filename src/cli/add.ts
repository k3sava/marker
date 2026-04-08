import { resolve } from 'path';
import { readDeck, writeDeck, deckExists } from '../core/deck.js';
import { createSlideTemplate } from '../core/template.js';
import { SLIDE_TYPES, type Slide, type SlideType } from '../core/types.js';

export async function addCommand(type?: string, opts?: { after?: string }) {
  const dir = resolve(process.cwd());

  if (!deckExists(dir)) {
    console.error('Error: no deck.json in current directory. Run "marker init" first.');
    process.exit(1);
  }

  if (!type) {
    console.log('Available slide types:');
    SLIDE_TYPES.forEach(t => console.log(`  marker add ${t}`));
    return;
  }

  if (!SLIDE_TYPES.includes(type as SlideType)) {
    console.error(`Error: unknown slide type "${type}". Valid: ${SLIDE_TYPES.join(', ')}`);
    process.exit(1);
  }

  const deck = await readDeck(dir);
  const template = createSlideTemplate(type);
  if (!template) { console.error('Failed to create template.'); process.exit(1); }

  const newSlide = template as unknown as Slide;

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
  console.log(`Added ${type} slide (${newSlide.id}). Deck now has ${deck.slides.length} slides.`);
}
