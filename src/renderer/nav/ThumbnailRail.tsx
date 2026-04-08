import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { getSlideHeading } from '../../core/elements';

interface Props {
  slides: Slide[];
  currentIdx: number;
  comments: Comment[];
  onSelect: (idx: number) => void;
}

export function ThumbnailRail({ slides, currentIdx, comments, onSelect }: Props) {
  return (
    <div className="w-[180px] bg-marker-bg-card border-r border-marker-border overflow-y-auto py-3 px-3 shrink-0">
      {slides.map((slide, idx) => {
        const hasComment = comments.some(c => c.slideId === slide.id && c.status === 'open');
        const isCurrent = idx === currentIdx;

        return (
          <button
            key={slide.id}
            onClick={() => onSelect(idx)}
            className={`w-full mb-2 rounded-lg border-2 transition-all text-left relative ${
              isCurrent
                ? 'border-marker-accent shadow-sm'
                : 'border-transparent hover:border-marker-border'
            }`}
          >
            <div className="aspect-video bg-white rounded-md p-2 overflow-hidden">
              <div className="text-[7px] font-semibold text-marker-text truncate">
                {getSlideHeading(slide)}
              </div>
              <div className="text-[5px] text-marker-muted mt-0.5 truncate">
                {slide.type}
              </div>
            </div>
            <div className="text-[10px] text-marker-muted text-center py-1">
              {idx + 1}
            </div>
            {hasComment && (
              <div className="absolute top-1 right-1 w-[8px] h-[8px] rounded-full bg-marker-error border border-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}
