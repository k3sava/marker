import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'bullets' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function BulletsSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;

  return (
    <div className="slide-frame">
      <EditableText
        id={c.heading.id} text={c.heading.text}
        editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
        tag="h2"
        className="text-[36px] font-semibold leading-[42px] tracking-[-1px] text-marker-text"
      />
      <ul className="mt-6 space-y-4 flex-1">
        {c.items.map(item => (
          <li key={item.id} className="flex items-start gap-3">
            <span className="mt-[9px] w-[6px] h-[6px] rounded-full bg-marker-accent shrink-0" />
            <EditableText
              id={item.id} text={item.text}
              editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
              className="text-[18px] leading-[26px] text-marker-secondary"
            />
          </li>
        ))}
      </ul>
      {c.kicker && (
        <div className="mt-auto pt-4 flex items-start gap-2">
          <span className="w-[3px] self-stretch bg-marker-accent rounded-full shrink-0" />
          <EditableText
            id={c.kicker.id} text={c.kicker.text}
            editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
            className="text-[14px] font-medium leading-[20px] text-marker-text"
          />
        </div>
      )}
    </div>
  );
}
