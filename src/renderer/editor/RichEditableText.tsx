import React, { useRef, useCallback, useEffect } from 'react';
import type { Comment } from '../../core/types';

interface Props {
  id: string;
  html: string;
  tag: string;
  attrs: Record<string, unknown>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

/**
 * Edits the innerHTML of one element. Used by the freeform slide type so that
 * inline children (color spans, <b>, links) survive editing — contentEditable
 * preserves them as the user types. We persist innerHTML, not textContent.
 *
 * Important: we only set innerHTML on mount and when `html` changes from outside
 * editing — otherwise React would clobber the user's caret on every keystroke.
 */
export function RichEditableText({
  id, html, tag, attrs, editing, comments, onEdit, onComment,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const lastExternalHtml = useRef(html);
  const hasComment = comments.some(c => c.targetId === id && c.status === 'open');

  // Sync external html updates into the DOM, but never while the element is focused
  // (would move the caret). Editing changes are pushed via onBlur.
  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    if (html !== lastExternalHtml.current || ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
      lastExternalHtml.current = html;
    }
  }, [html]);

  const handleBlur = useCallback(() => {
    if (!ref.current) return;
    const next = ref.current.innerHTML;
    if (next !== lastExternalHtml.current) {
      lastExternalHtml.current = next;
      onEdit(id, next);
    }
  }, [id, onEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Don't let arrow / space bubble out to the slide-nav handler.
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') {
      e.stopPropagation();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      ref.current?.blur();
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!editing) {
      e.stopPropagation();
      e.preventDefault();
      onComment(id);
    }
  }, [editing, id, onComment]);

  // Build props from the original HTML attrs, layered with edit/comment behavior.
  const elementProps: Record<string, unknown> = {
    ...attrs,
    ref: ref as React.RefObject<HTMLElement>,
    'data-mid': id,
    contentEditable: editing || undefined,
    suppressContentEditableWarning: true,
    onBlur: editing ? handleBlur : undefined,
    onKeyDown: editing ? handleKeyDown : undefined,
    onClick: editing ? undefined : handleClick,
    // Defer html injection to the effect above so we don't fight contentEditable.
  };

  // Children: a marker indicator span, only when not editing (so it doesn't end up
  // inside the editable region).
  return React.createElement(
    tag,
    elementProps,
    !editing && hasComment ? <span className="marker-comment-indicator" contentEditable={false} /> : null,
  );
}
