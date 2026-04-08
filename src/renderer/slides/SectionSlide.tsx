import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'section' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function SectionSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;

  return (
    <div className="slide-frame justify-center">
      <div className="w-16 h-1 bg-marker-accent rounded-full mb-6" />
      <EditableText
        id={c.heading.id} text={c.heading.text}
        editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
        tag="h1"
        className="text-[42px] font-semibold leading-[50px] tracking-[-2px] text-marker-text"
      />
      {c.body && (
        <EditableText
          id={c.body.id} text={c.body.text}
          editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
          className="text-[18px] leading-[26px] text-marker-secondary mt-4 max-w-[600px]"
        />
      )}
    </div>
  );
}
