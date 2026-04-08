import React, { useRef, useCallback } from 'react';
import type { Comment } from '../../core/types';

interface Props {
  id: string;
  text: string;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
  className?: string;
  tag?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
}

export function EditableText({
  id, text, editing, comments, onEdit, onComment, className = '', tag = 'span',
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const hasComment = comments.some(c => c.targetId === id && c.status === 'open');

  const handleBlur = useCallback(() => {
    if (ref.current) {
      const newText = ref.current.textContent || '';
      if (newText !== text) onEdit(id, newText);
    }
  }, [id, text, onEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === ' ') {
      e.stopPropagation();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ref.current?.blur();
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!editing) {
      e.stopPropagation();
      onComment(id);
    }
  }, [editing, id, onComment]);

  const props = {
    ref: ref as React.RefObject<HTMLElement>,
    className: `relative inline ${className} ${!editing ? 'cursor-pointer' : ''}`.trim(),
    contentEditable: editing || undefined,
    suppressContentEditableWarning: true as const,
    onBlur: editing ? handleBlur : undefined,
    onKeyDown: editing ? handleKeyDown : undefined,
    onClick: !editing ? handleClick : undefined,
  };

  const children = (
    <>
      {text}
      {hasComment && <span className="comment-indicator" />}
    </>
  );

  // Use createElement to avoid TS dynamic tag issues
  return React.createElement(tag, props, children);
}
