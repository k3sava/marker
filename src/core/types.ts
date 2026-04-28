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

// -- Rich review-deck slide types (added 2026-04-28 for quarterly-review format) --

export type ScoreboardStatus = 'met' | 'partial' | 'miss' | 'neutral';

export interface ScoreboardRow {
  stream: TextElement;
  context?: TextElement;          // small caption under stream label
  delta: TextElement;             // achieved-vs-committed prose
  statusLabel: TextElement;       // pill text e.g. "Met" or "Wins met · paid missed"
  status: ScoreboardStatus;
}

export interface ScoreboardContent {
  heading: TextElement;
  kicker?: TextElement;
  rows: ScoreboardRow[];
  footnote?: TextElement;         // e.g. "Cross-pod where PMM contributed: ..."
}

export type KpiTileVariant = 'paper' | 'accent' | 'invert';

export interface KpiTile {
  label: TextElement;             // small uppercase label
  value: TextElement;             // big number
  sub?: TextElement;              // small caption beneath value
  delta?: TextElement;            // optional change indicator
  direction?: 'up' | 'down' | 'neutral';
  variant?: KpiTileVariant;       // default: paper
}

export interface KpiGridContent {
  heading: TextElement;
  kicker?: TextElement;
  tiles: KpiTile[];               // typically 3-4 tiles
  footstrip?: TextElement;        // optional caption row beneath tiles
}

export interface LagPlanContent {
  heading: TextElement;
  kicker?: TextElement;
  lagItems: TextElement[];        // "Where we lag" bullets
  planItems: TextElement[];       // "Q-N+1 plan" bullets
  planOwnerLabel?: TextElement;   // e.g. "owner: Reshma · per Apr 15 realignment"
  spendNote?: TextElement;        // optional spend strip below the panels
}

// -- Slide type union --

export type SlideType =
  | 'title'
  | 'section'
  | 'bullets'
  | 'comparison'
  | 'metric'
  | 'table'
  | 'scoreboard'
  | 'kpi-grid'
  | 'lag-plan';

export const SLIDE_TYPES: SlideType[] = [
  'title', 'section', 'bullets', 'comparison', 'metric', 'table',
  'scoreboard', 'kpi-grid', 'lag-plan',
];

export type Slide =
  | { id: string; type: 'title'; content: TitleContent }
  | { id: string; type: 'section'; content: SectionContent }
  | { id: string; type: 'bullets'; content: BulletsContent }
  | { id: string; type: 'comparison'; content: ComparisonContent }
  | { id: string; type: 'metric'; content: MetricContent }
  | { id: string; type: 'table'; content: TableContent }
  | { id: string; type: 'scoreboard'; content: ScoreboardContent }
  | { id: string; type: 'kpi-grid'; content: KpiGridContent }
  | { id: string; type: 'lag-plan'; content: LagPlanContent };

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
