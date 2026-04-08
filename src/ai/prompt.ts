import type { Deck, Comment, Slide } from '../core/types.js';
import { findElement, getSlideHeading } from '../core/deck.js';

export function buildReviewPrompt(deck: Deck, comments: Comment[]): string {
  // Find which slides have comments
  const commentedSlideIds = new Set(comments.map(c => c.slideId));

  const commentDetails = comments.map(c => {
    const found = findElement(deck, c.targetId);
    const slideIdx = deck.slides.findIndex(s => s.id === c.slideId);
    return {
      commentId: c.id,
      slideNumber: slideIdx + 1,
      targetId: c.targetId,
      currentText: found?.element.text ?? c.context,
      originalText: c.context,
      feedback: c.text,
      author: c.author,
    };
  });

  const slidesSummary = deck.slides.map((s, i) => {
    return `Slide ${i + 1} (${s.type}): ${getSlideHeading(s)}`;
  }).join('\n');

  // Include full content for slides that have comments
  const slideContent = deck.slides
    .filter(s => commentedSlideIds.has(s.id))
    .map((s, _i) => {
      const idx = deck.slides.indexOf(s);
      return `### Slide ${idx + 1} (${s.type}) — Full Content\n${JSON.stringify(serializeSlideContent(s), null, 2)}`;
    })
    .join('\n\n');

  return `You are a presentation editor. A reviewer has left comments on specific elements of a slide deck. Your job is to process each comment and produce the edit that satisfies the reviewer's feedback.

## Deck Overview
Title: ${deck.meta.title}
${slidesSummary}

## Commented Slides — Full Content
${slideContent}

## Comments to Process
${JSON.stringify(commentDetails, null, 2)}

## Instructions
For each comment, produce an edit operation. Return a JSON array of edit objects.

Each edit object must have:
- "commentId": the comment ID
- "operation": "edit" (change text), "add" (insert new item), or "remove" (delete item)
- "targetId": the element ID to modify
- "oldValue": the current text (for verification)
- "newValue": the replacement text (for edit/add operations)
- "explanation": brief explanation of what you changed and why

Rules:
- Process ALL comments. Do not skip any.
- Consider how comments interact. If comment A changes a heading, make sure comment B's edit on related content is coherent.
- For "edit" operations: rewrite the text to address the feedback. Be specific and concrete.
- For "remove" operations: set newValue to null.
- Keep the tone and style consistent with the rest of the deck.
- Do not add unnecessary words or filler. Be concise.

Return ONLY the JSON array. No other text.`;
}

/** Flatten slide content to a readable map of id -> text pairs */
function serializeSlideContent(slide: Slide): Record<string, string> {
  const result: Record<string, string> = {};
  collectText(slide.content, result);
  return result;
}

function collectText(obj: unknown, out: Record<string, string>): void {
  if (obj === null || obj === undefined || typeof obj !== 'object') return;
  if ('id' in obj && 'text' in obj && typeof (obj as { id: string }).id === 'string') {
    const el = obj as { id: string; text: string };
    out[el.id] = el.text;
    return;
  }
  if (Array.isArray(obj)) { obj.forEach(item => collectText(item, out)); return; }
  Object.values(obj as Record<string, unknown>).forEach(val => collectText(val, out));
}
