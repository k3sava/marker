import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'metric' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function MetricSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;

  return (
    <div className="slide-frame">
      <EditableText
        id={c.heading.id} text={c.heading.text}
        editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
        tag="h2"
        className="text-[36px] font-semibold leading-[42px] tracking-[-1px] text-marker-text"
      />
      <div className="mt-8 flex-1 flex items-center">
        <div className="grid gap-5 w-full" style={{ gridTemplateColumns: `repeat(${Math.min(c.metrics.length, 4)}, 1fr)` }}>
          {c.metrics.map(m => (
            <div
              key={m.value.id}
              className="rounded-xl border border-marker-border bg-marker-bg-card p-6 text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <EditableText
                  id={m.value.id} text={m.value.text}
                  editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
                  className="text-[40px] font-semibold tracking-[-1px] text-marker-text tabular-nums"
                />
                {m.direction && (
                  <span className={`text-[20px] ${m.direction === 'up' ? 'text-marker-success' : m.direction === 'down' ? 'text-marker-error' : 'text-marker-muted'}`}>
                    {m.direction === 'up' ? '\u2191' : m.direction === 'down' ? '\u2193' : '\u2192'}
                  </span>
                )}
              </div>
              {m.delta && (
                <EditableText
                  id={m.delta.id} text={m.delta.text}
                  editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
                  className={`text-[14px] font-medium mt-1 ${
                    m.direction === 'up' ? 'text-marker-success' : m.direction === 'down' ? 'text-marker-error' : 'text-marker-muted'
                  }`}
                />
              )}
              <EditableText
                id={m.label.id} text={m.label.text}
                editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
                className="text-[14px] text-marker-muted mt-2 block"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
