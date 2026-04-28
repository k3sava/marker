import React from 'react';
import type { Slide, Comment, ScoreboardStatus } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'scoreboard' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

const STATUS_CLASSES: Record<ScoreboardStatus, string> = {
  met: 'bg-marker-success-50 text-marker-success',
  partial: 'bg-marker-warn-50 text-marker-warn',
  miss: 'bg-marker-error-50 text-marker-error',
  neutral: 'bg-marker-bg-alt text-marker-muted',
};

export function ScoreboardSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;
  const ed = { editing, comments, onEdit, onComment };

  return (
    <div className="slide-frame">
      {c.kicker && (
        <EditableText
          {...ed}
          id={c.kicker.id}
          text={c.kicker.text}
          className="text-[13px] font-bold uppercase tracking-[0.18em] text-marker-accent mb-3"
        />
      )}
      <EditableText
        {...ed}
        id={c.heading.id}
        text={c.heading.text}
        tag="h2"
        className="text-[40px] font-semibold leading-[44px] tracking-[-1px] text-marker-text"
      />

      <div className="mt-8 flex-1 flex flex-col justify-center">
        {c.rows.map((row) => (
          <div
            key={row.stream.id}
            className="grid items-center gap-6 py-5 border-b border-marker-bg-alt last:border-b-0"
            style={{ gridTemplateColumns: '1.05fr 0.18fr 1.4fr 0.62fr' }}
          >
            <div>
              <EditableText
                {...ed}
                id={row.stream.id}
                text={row.stream.text}
                className="block text-[20px] font-bold tracking-[-0.005em] text-marker-text"
              />
              {row.context && (
                <EditableText
                  {...ed}
                  id={row.context.id}
                  text={row.context.text}
                  className="block text-[12px] font-medium tracking-[0.04em] text-marker-muted mt-1"
                />
              )}
            </div>
            <div className="text-center text-[20px] text-marker-muted">→</div>
            <EditableText
              {...ed}
              id={row.delta.id}
              text={row.delta.text}
              className="text-[15px] leading-[1.45] text-marker-tertiary"
            />
            <div className="justify-self-end">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap ${STATUS_CLASSES[row.status]}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <EditableText
                  {...ed}
                  id={row.statusLabel.id}
                  text={row.statusLabel.text}
                  className="text-current"
                />
              </span>
            </div>
          </div>
        ))}
      </div>

      {c.footnote && (
        <div className="mt-5 rounded-xl border border-marker-border bg-marker-bg-card px-5 py-3">
          <EditableText
            {...ed}
            id={c.footnote.id}
            text={c.footnote.text}
            className="text-[14px] text-marker-tertiary"
          />
        </div>
      )}
    </div>
  );
}
