import { describe, it, expect } from 'vitest';
import { createComment, mergeComments, openComments, commentsForSlide, resolveComment } from '../../src/core/comments';
import { createDefaultDeck } from '../../src/core/template';
import type { Comment } from '../../src/core/types';

describe('comments', () => {
  const deck = createDefaultDeck('Test', 'Author');
  const bulletSlide = deck.slides[1];
  const items = (bulletSlide.content as { items: { id: string }[] }).items;

  it('createComment creates a valid comment', () => {
    const comment = createComment(deck, items[0].id, 'Reviewer', 'Fix this');
    expect(comment).not.toBeNull();
    expect(comment!.targetId).toBe(items[0].id);
    expect(comment!.slideId).toBe(bulletSlide.id);
    expect(comment!.author).toBe('Reviewer');
    expect(comment!.text).toBe('Fix this');
    expect(comment!.status).toBe('open');
    expect(comment!.context).toBe(items[0].text);
  });

  it('createComment returns null for invalid target', () => {
    expect(createComment(deck, 'nonexistent', 'X', 'text')).toBeNull();
  });

  it('mergeComments deduplicates by ID', () => {
    const c1: Comment = {
      id: 'c1', targetId: 'x', slideId: 'y', author: 'A',
      text: 'hi', context: '', timestamp: '', status: 'open',
    };
    const c2: Comment = { ...c1, id: 'c2', text: 'new' };
    const { merged, added } = mergeComments([c1], [c1, c2]);
    expect(merged).toHaveLength(2);
    expect(added).toBe(1);
  });

  it('openComments filters to open only', () => {
    const comments: Comment[] = [
      { id: '1', targetId: 'x', slideId: 'y', author: 'A', text: '', context: '', timestamp: '', status: 'open' },
      { id: '2', targetId: 'x', slideId: 'y', author: 'A', text: '', context: '', timestamp: '', status: 'resolved' },
    ];
    expect(openComments(comments)).toHaveLength(1);
  });

  it('commentsForSlide filters by slide', () => {
    const comments: Comment[] = [
      { id: '1', targetId: 'x', slideId: 'a', author: 'A', text: '', context: '', timestamp: '', status: 'open' },
      { id: '2', targetId: 'x', slideId: 'b', author: 'A', text: '', context: '', timestamp: '', status: 'open' },
    ];
    expect(commentsForSlide(comments, 'a')).toHaveLength(1);
  });

  it('resolveComment changes status', () => {
    const comments: Comment[] = [
      { id: '1', targetId: 'x', slideId: 'a', author: 'A', text: '', context: '', timestamp: '', status: 'open' },
    ];
    const resolved = resolveComment(comments, '1');
    expect(resolved[0].status).toBe('resolved');
  });
});
