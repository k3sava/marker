import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'comparison' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function ComparisonSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;

  return (
    <div className="slide-frame">
      <EditableText
        id={c.heading.id} text={c.heading.text}
        editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
        tag="h2"
        className="text-[36px] font-semibold leading-[42px] tracking-[-1px] text-marker-text"
      />
      <div className="mt-6 flex-1 grid gap-6" style={{ gridTemplateColumns: `repeat(${c.columns.length}, 1fr)` }}>
        {c.columns.map((col, colIdx) => (
          <div
            key={col.label.id}
            className={`rounded-xl p-6 ${colIdx === 0 ? 'bg-marker-bg-card' : 'bg-marker-bg-edit'}`}
          >
            <EditableText
              id={col.label.id} text={col.label.text}
              editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
              className={`text-[13px] font-bold uppercase tracking-[0.3px] ${
                colIdx === 0 ? 'text-marker-muted' : 'text-marker-accent'
              }`}
            />
            <ul className="mt-4 space-y-3">
              {col.items.map(item => (
                <li key={item.id} className="flex items-start gap-3">
                  <span className={`mt-[7px] w-[5px] h-[5px] rounded-full shrink-0 ${
                    colIdx === 0 ? 'bg-marker-muted' : 'bg-marker-accent'
                  }`} />
                  <EditableText
                    id={item.id} text={item.text}
                    editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
                    className="text-[16px] leading-[23px] text-marker-secondary"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {c.kicker && (
        <div className="mt-4 flex items-start gap-2">
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
