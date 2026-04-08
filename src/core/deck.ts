import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import type { Deck } from './types.js';

// Re-export pure element functions so existing imports from 'deck.js' still work
export { findElement, updateElement, findSlideForElement, getSlideElementIds, getSlideHeading } from './elements.js';

const DECK_FILE = 'deck.json';

export function deckPath(dir: string): string {
  return join(dir, DECK_FILE);
}

export async function readDeck(dir: string): Promise<Deck> {
  const raw = await readFile(deckPath(dir), 'utf-8');
  return JSON.parse(raw) as Deck;
}

export async function writeDeck(dir: string, deck: Deck): Promise<void> {
  await writeFile(deckPath(dir), JSON.stringify(deck, null, 2) + '\n', 'utf-8');
}

export function deckExists(dir: string): boolean {
  return existsSync(deckPath(dir));
}
