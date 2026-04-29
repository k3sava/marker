// -- Element wrapper: every text field has a stable ID --

export interface TextElement {
  id: string;
  text: string;
}

// -- Slide content types --

export interface TitleContent {
  heading: TextElement;
  subheading?: TextElement;
  kicker?: TextElement;
  date?: TextElement;
}

export interface SectionContent {
  heading: TextElement;
  body?: TextElement;
}

export interface BulletsContent {
  heading: TextElement;
  items: TextElement[];
  kicker?: TextElement;
}

export interface ComparisonContent {
  heading: TextElement;
  columns: { label: TextElement; items: TextElement[] }[];
  kicker?: TextElement;
}

export interface MetricContent {
  heading: TextElement;
  metrics: {
    value: TextElement;
    label: TextElement;
    delta?: TextElement;
    direction?: 'up' | 'down' | 'neutral';
  }[];
}

export interface TableContent {
  heading: TextElement;
  headers: TextElement[];
  rows: TextElement[][];
  kicker?: TextElement;
}

// -- Freeform slide: raw HTML with data-mid attributes for editable regions.
//    Used by the justcall theme and any custom layouts authored as HTML.
export interface FreeformContent {
  label: string;   // shown in the thumbnail rail
  layout: string;  // layout slug (e.g. 'cover', 'kpi-dashboard') — for thumbnails / templating
  html: string;    // full slide HTML; every editable element carries data-mid="<id>"
}

// -- Slide type union --

export type SlideType = 'title' | 'section' | 'bullets' | 'comparison' | 'metric' | 'table' | 'freeform';

export const SLIDE_TYPES: SlideType[] = ['title', 'section', 'bullets', 'comparison', 'metric', 'table', 'freeform'];

export type Slide =
  | { id: string; type: 'title'; content: TitleContent }
  | { id: string; type: 'section'; content: SectionContent }
  | { id: string; type: 'bullets'; content: BulletsContent }
  | { id: string; type: 'comparison'; content: ComparisonContent }
  | { id: string; type: 'metric'; content: MetricContent }
  | { id: string; type: 'table'; content: TableContent }
  | { id: string; type: 'freeform'; content: FreeformContent };

// -- Comments --

export type CommentStatus = 'open' | 'resolved' | 'rejected';

export interface Comment {
  id: string;
  targetId: string;
  slideId: string;
  author: string;
  text: string;
  context: string; // snapshot of target text when comment was made
  timestamp: string; // ISO 8601
  status: CommentStatus;
}

// -- Review operations --

export type ReviewOperation = 'edit' | 'add' | 'remove';

export interface ReviewEdit {
  commentId: string;
  operation: ReviewOperation;
  targetId: string;
  oldValue?: string;
  newValue?: string;
  explanation: string;
}

// -- Deck --

export interface DeckMeta {
  title: string;
  author: string;
  date: string;
  version: number;
}

export interface DeckConfig {
  theme: string;
  aspectRatio: '16:9' | '4:3';
}

export interface Deck {
  meta: DeckMeta;
  slides: Slide[];
  comments: Comment[];
  config: DeckConfig;
}
