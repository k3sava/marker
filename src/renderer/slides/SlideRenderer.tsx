import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { TitleSlide } from './TitleSlide';
import { SectionSlide } from './SectionSlide';
import { BulletsSlide } from './BulletsSlide';
import { ComparisonSlide } from './ComparisonSlide';
import { MetricSlide } from './MetricSlide';
import { TableSlide } from './TableSlide';
import { ScoreboardSlide } from './ScoreboardSlide';
import { KpiGridSlide } from './KpiGridSlide';
import { LagPlanSlide } from './LagPlanSlide';

export interface SlideProps {
  slide: Slide;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function SlideRenderer(props: SlideProps) {
  switch (props.slide.type) {
    case 'title': return <TitleSlide {...props} slide={props.slide} />;
    case 'section': return <SectionSlide {...props} slide={props.slide} />;
    case 'bullets': return <BulletsSlide {...props} slide={props.slide} />;
    case 'comparison': return <ComparisonSlide {...props} slide={props.slide} />;
    case 'metric': return <MetricSlide {...props} slide={props.slide} />;
    case 'table': return <TableSlide {...props} slide={props.slide} />;
    case 'scoreboard': return <ScoreboardSlide {...props} slide={props.slide} />;
    case 'kpi-grid': return <KpiGridSlide {...props} slide={props.slide} />;
    case 'lag-plan': return <LagPlanSlide {...props} slide={props.slide} />;
    default:
      return (
        <div className="slide-frame flex items-center justify-center">
          <p className="text-marker-muted">Unknown slide type</p>
        </div>
      );
  }
}
