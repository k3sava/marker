import type { Deck, Slide, TextElement } from './types.js';

/** Find a TextElement anywhere in the deck by its id */
export function findElement(deck: Deck, targetId: string): { slide: Slide; element: TextElement } | null {
  for (const slide of deck.slides) {
    const el = findElementInContent(slide.content, targetId);
    if (el) return { slide, element: el };
  }
  return null;
}

/** Update element text by ID. Returns true if found and updated. */
export function updateElement(deck: Deck, targetId: string, newText: string): boolean {
  for (const slide of deck.slides) {
    if (updateElementInContent(slide.content, targetId, newText)) return true;
  }
  return false;
}

/** Find the slide that contains a given element ID */
export function findSlideForElement(deck: Deck, targetId: string): Slide | null {
  for (const slide of deck.slides) {
    if (findElementInContent(slide.content, targetId)) return slide;
  }
  return null;
}

/** Get all element IDs in a slide */
export function getSlideElementIds(slide: Slide): string[] {
  const ids: string[] = [];
  collectIds(slide.content, ids);
  return ids;
}

/** Extract the heading text from any slide */
export function getSlideHeading(slide: Slide): string {
  const content = slide.content as unknown as Record<string, unknown>;
  const heading = content.heading as { text?: string } | undefined;
  return heading?.text ?? '(untitled)';
}

// --- Internal helpers ---

function findElementInContent(obj: unknown, targetId: string): TextElement | null {
  if (obj === null || obj === undefined || typeof obj !== 'object') return null;
  if (isTextElement(obj) && obj.id === targetId) return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findElementInContent(item, targetId);
      if (found) return found;
    }
    return null;
  }
  for (const val of Object.values(obj as Record<string, unknown>)) {
    const found = findElementInContent(val, targetId);
    if (found) return found;
  }
  return null;
}

function updateElementInContent(obj: unknown, targetId: string, newText: string): boolean {
  if (obj === null || obj === undefined || typeof obj !== 'object') return false;
  if (isTextElement(obj) && obj.id === targetId) { obj.text = newText; return true; }
  if (Array.isArray(obj)) {
    for (const item of obj) { if (updateElementInContent(item, targetId, newText)) return true; }
    return false;
  }
  for (const val of Object.values(obj as Record<string, unknown>)) {
    if (updateElementInContent(val, targetId, newText)) return true;
  }
  return false;
}

function isTextElement(obj: unknown): obj is TextElement {
  return (
    typeof obj === 'object' && obj !== null &&
    'id' in obj && 'text' in obj &&
    typeof (obj as TextElement).id === 'string' &&
    typeof (obj as TextElement).text === 'string'
  );
}

function collectIds(obj: unknown, ids: string[]): void {
  if (obj === null || obj === undefined || typeof obj !== 'object') return;
  if (isTextElement(obj)) { ids.push(obj.id); return; }
  if (Array.isArray(obj)) { obj.forEach(item => collectIds(item, ids)); return; }
  Object.values(obj as Record<string, unknown>).forEach(val => collectIds(val, ids));
}
