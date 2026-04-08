import { describe, it, expect } from 'vitest';
import { buildReviewPrompt } from '../../src/ai/prompt';
import { createDefaultDeck } from '../../src/core/template';
import type { Comment } from '../../src/core/types';

describe('AI prompt', () => {
  it('builds a prompt with deck context and comments', () => {
    const deck = createDefaultDeck('Test Deck', 'Author');
    const bulletSlide = deck.slides[1];
    const items = (bulletSlide.content as { items: { id: string; text: string }[] }).items;

    const comments: Comment[] = [{
      id: 'c-1',
      targetId: items[0].id,
      slideId: bulletSlide.id,
      author: 'Reviewer',
      text: 'Make this more specific',
      context: items[0].text,
      timestamp: '2026-04-08T10:00:00Z',
      status: 'open',
    }];

    const prompt = buildReviewPrompt(deck, comments);

    expect(prompt).toContain('Test Deck');
    expect(prompt).toContain('Make this more specific');
    expect(prompt).toContain(items[0].id);
    expect(prompt).toContain('JSON array');
    expect(prompt).toContain('commentId');
    expect(prompt).toContain('operation');
  });
});
