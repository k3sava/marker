import { describe, it, expect } from 'vitest';
import { findElement, updateElement, findSlideForElement, getSlideElementIds } from '../../src/core/deck';
import { createDefaultDeck } from '../../src/core/template';

describe('deck operations', () => {
  const deck = createDefaultDeck('Test Deck', 'Tester');

  it('creates a deck with 4 slides', () => {
    expect(deck.slides).toHaveLength(4);
    expect(deck.slides.map(s => s.type)).toEqual(['title', 'bullets', 'metric', 'comparison']);
  });

  it('findElement finds by ID', () => {
    const titleSlide = deck.slides[0];
    const headingId = (titleSlide.content as { heading: { id: string } }).heading.id;
    const result = findElement(deck, headingId);
    expect(result).not.toBeNull();
    expect(result!.element.text).toBe('Test Deck');
    expect(result!.slide.id).toBe(titleSlide.id);
  });

  it('findElement returns null for missing ID', () => {
    expect(findElement(deck, 'nonexistent')).toBeNull();
  });

  it('updateElement changes text', () => {
    const copy = JSON.parse(JSON.stringify(deck));
    const headingId = (copy.slides[0].content as { heading: { id: string } }).heading.id;
    const updated = updateElement(copy, headingId, 'New Title');
    expect(updated).toBe(true);
    expect(findElement(copy, headingId)!.element.text).toBe('New Title');
  });

  it('updateElement returns false for missing ID', () => {
    const copy = JSON.parse(JSON.stringify(deck));
    expect(updateElement(copy, 'nope', 'text')).toBe(false);
  });

  it('findSlideForElement returns correct slide', () => {
    const bulletSlide = deck.slides[1];
    const items = (bulletSlide.content as { items: { id: string }[] }).items;
    const slide = findSlideForElement(deck, items[0].id);
    expect(slide!.id).toBe(bulletSlide.id);
  });

  it('getSlideElementIds returns all IDs', () => {
    const bulletSlide = deck.slides[1];
    const ids = getSlideElementIds(bulletSlide);
    // heading + 3 items = 4 minimum
    expect(ids.length).toBeGreaterThanOrEqual(4);
    ids.forEach(id => expect(typeof id).toBe('string'));
  });
});
