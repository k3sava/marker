import type { Comment, Deck } from './types.js';
import { commentId } from './ids.js';
import { findElement } from './deck.js';

export function createComment(
  deck: Deck,
  targetId: string,
  author: string,
  text: string,
): Comment | null {
  const found = findElement(deck, targetId);
  if (!found) return null;

  return {
    id: commentId(),
    targetId,
    slideId: found.slide.id,
    author,
    text,
    context: found.element.text,
    timestamp: new Date().toISOString(),
    status: 'open',
  };
}

export function mergeComments(existing: Comment[], incoming: Comment[]): { merged: Comment[]; added: number } {
  const existingIds = new Set(existing.map(c => c.id));
  const newComments = incoming.filter(c => !existingIds.has(c.id));
  return {
    merged: [...existing, ...newComments],
    added: newComments.length,
  };
}

export function openComments(comments: Comment[]): Comment[] {
  return comments.filter(c => c.status === 'open');
}

export function commentsForSlide(comments: Comment[], slideId: string): Comment[] {
  return comments.filter(c => c.slideId === slideId);
}

export function resolveComment(comments: Comment[], commentId: string): Comment[] {
  return comments.map(c =>
    c.id === commentId ? { ...c, status: 'resolved' as const } : c
  );
}
