import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'lag-plan' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function LagPlanSlide({ slide, editing, comments, onEdit, onComment }: Props) {
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

      <div className="mt-8 flex-1 grid grid-cols-2 gap-6">
        {/* Lag panel */}
        <div className="rounded-2xl border border-[#F2E2C5] bg-[#FDF6EC] px-8 py-7">
          <div className="flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-marker-warn mb-4">
            <span className="w-2 h-2 rounded-full bg-current" />
            Where we lag
          </div>
          <ul className="space-y-2.5">
            {c.lagItems.map((item) => (
              <li
                key={item.id}
                className="relative pl-5 text-[16px] leading-[1.5] text-marker-warn-text"
              >
                <span className="absolute left-0 top-[10px] w-[5px] h-[5px] rounded-full bg-current opacity-65" />
                <EditableText
                  {...ed}
                  id={item.id}
                  text={item.text}
                  className="text-current"
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Plan panel */}
        <div className="rounded-2xl border border-marker-accent-100 bg-marker-accent-50 px-8 py-7">
          <div className="flex items-center gap-2.5 text-[12px] font-bold uppercase tracking-[0.18em] text-marker-accent mb-4">
            <span className="w-2 h-2 rounded-full bg-current" />
            Q-N+1 plan
            {c.planOwnerLabel && (
              <span className="ml-2 text-[13px] font-medium normal-case tracking-[0.04em] text-marker-muted">
                <EditableText
                  {...ed}
                  id={c.planOwnerLabel.id}
                  text={c.planOwnerLabel.text}
                  className="text-marker-muted"
                />
              </span>
            )}
          </div>
          <ul className="space-y-2.5">
            {c.planItems.map((item) => (
              <li
                key={item.id}
                className="relative pl-5 text-[16px] leading-[1.5] text-[#1B3A8A]"
              >
                <span className="absolute left-0 top-[10px] w-[5px] h-[5px] rounded-full bg-current opacity-65" />
                <EditableText
                  {...ed}
                  id={item.id}
                  text={item.text}
                  className="text-current"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {c.spendNote && (
        <div className="mt-5 rounded-xl border border-marker-border bg-marker-bg-card px-6 py-3">
          <EditableText
            {...ed}
            id={c.spendNote.id}
            text={c.spendNote.text}
            className="text-[14px] text-marker-tertiary"
          />
        </div>
      )}
    </div>
  );
}
