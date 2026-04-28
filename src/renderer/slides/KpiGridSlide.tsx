import React from 'react';
import type { Slide, Comment, KpiTileVariant } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'kpi-grid' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

const VARIANT_CLASSES: Record<KpiTileVariant, { card: string; lbl: string; val: string; sub: string }> = {
  paper: {
    card: 'bg-marker-bg-card border-marker-border',
    lbl: 'text-marker-muted',
    val: 'text-marker-text',
    sub: 'text-marker-muted',
  },
  accent: {
    card: 'bg-marker-accent border-transparent',
    lbl: 'text-white/75',
    val: 'text-white',
    sub: 'text-white/85',
  },
  invert: {
    card: 'bg-marker-accent-deep border-transparent',
    lbl: 'text-white/60',
    val: 'text-white',
    sub: 'text-white/70',
  },
};

export function KpiGridSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;
  const ed = { editing, comments, onEdit, onComment };
  const cols = Math.min(c.tiles.length, 4);

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

      <div className="mt-8 flex-1 flex items-center">
        <div
          className="grid gap-4 w-full"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {c.tiles.map((tile) => {
            const v = VARIANT_CLASSES[tile.variant ?? 'paper'];
            return (
              <div
                key={tile.value.id}
                className={`rounded-2xl border px-7 pt-6 pb-7 flex flex-col gap-1 ${v.card}`}
              >
                <EditableText
                  {...ed}
                  id={tile.label.id}
                  text={tile.label.text}
                  className={`text-[12px] font-bold uppercase tracking-[0.16em] ${v.lbl}`}
                />
                <EditableText
                  {...ed}
                  id={tile.value.id}
                  text={tile.value.text}
                  className={`text-[56px] font-semibold leading-none tracking-[-1.5px] tabular-nums mt-3 ${v.val}`}
                />
                {tile.delta && (
                  <EditableText
                    {...ed}
                    id={tile.delta.id}
                    text={tile.delta.text}
                    className={`text-[14px] font-medium mt-2 ${
                      tile.direction === 'up'
                        ? 'text-marker-success'
                        : tile.direction === 'down'
                        ? 'text-marker-error'
                        : v.sub
                    }`}
                  />
                )}
                {tile.sub && (
                  <EditableText
                    {...ed}
                    id={tile.sub.id}
                    text={tile.sub.text}
                    className={`text-[13px] leading-[1.4] mt-2 ${v.sub}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {c.footstrip && (
        <div className="mt-5 rounded-xl border border-marker-border bg-marker-bg-card px-6 py-3">
          <EditableText
            {...ed}
            id={c.footstrip.id}
            text={c.footstrip.text}
            className="text-[14px] text-marker-tertiary"
          />
        </div>
      )}
    </div>
  );
}
