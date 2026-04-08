import { describe, it, expect } from 'vitest';
import { createDefaultDeck, createSlideTemplate } from '../../src/core/template';

describe('template', () => {
  it('createDefaultDeck produces valid structure', () => {
    const deck = createDefaultDeck('My Deck', 'Author');
    expect(deck.meta.title).toBe('My Deck');
    expect(deck.meta.author).toBe('Author');
    expect(deck.slides).toHaveLength(4);
    expect(deck.comments).toEqual([]);
    expect(deck.config.aspectRatio).toBe('16:9');

    // All slides have IDs
    deck.slides.forEach(s => {
      expect(s.id).toBeTruthy();
      expect(s.type).toBeTruthy();
    });
  });

  it('createSlideTemplate creates all 6 types', () => {
    const types = ['title', 'section', 'bullets', 'comparison', 'metric', 'table'];
    types.forEach(type => {
      const template = createSlideTemplate(type);
      expect(template).not.toBeNull();
      expect(template!.type).toBe(type);
      expect(template!.content).toBeTruthy();
    });
  });

  it('createSlideTemplate returns null for unknown type', () => {
    expect(createSlideTemplate('invalid')).toBeNull();
  });

  it('all elements have unique IDs', () => {
    const deck = createDefaultDeck('Test', '');
    const ids = new Set<string>();
    const collectIds = (obj: unknown): void => {
      if (!obj || typeof obj !== 'object') return;
      if ('id' in obj && 'text' in obj) {
        const el = obj as { id: string };
        expect(ids.has(el.id)).toBe(false);
        ids.add(el.id);
      }
      if (Array.isArray(obj)) obj.forEach(collectIds);
      else Object.values(obj as Record<string, unknown>).forEach(collectIds);
    };
    deck.slides.forEach(s => collectIds(s.content));
    expect(ids.size).toBeGreaterThan(10); // deck should have many elements
  });
});
