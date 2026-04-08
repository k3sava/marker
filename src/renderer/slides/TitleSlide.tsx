import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'title' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function TitleSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;

  return (
    <div className="slide-frame items-center justify-center text-center">
      {c.kicker && (
        <EditableText
          id={c.kicker.id} text={c.kicker.text}
          editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
          className="text-[13px] font-bold uppercase tracking-[0.5px] text-marker-muted mb-6"
        />
      )}
      <EditableText
        id={c.heading.id} text={c.heading.text}
        editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
        tag="h1"
        className="text-[52px] font-semibold leading-[60px] tracking-[-2.5px] text-marker-text"
      />
      {c.subheading && (
        <EditableText
          id={c.subheading.id} text={c.subheading.text}
          editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
          className="text-[20px] leading-[28px] text-marker-secondary mt-5"
        />
      )}
      {c.date && (
        <EditableText
          id={c.date.id} text={c.date.text}
          editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
          className="text-[14px] text-marker-muted mt-8"
        />
      )}
    </div>
  );
}
