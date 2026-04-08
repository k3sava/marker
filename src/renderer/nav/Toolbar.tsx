import React from 'react';

interface Props {
  slideIdx: number;
  totalSlides: number;
  editing: boolean;
  onToggleEdit: () => void;
  panelOpen: boolean;
  onTogglePanel: () => void;
  openCommentCount: number;
  slideHasComments: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onPrev: () => void;
  onNext: () => void;
}

export function Toolbar({
  slideIdx, totalSlides, editing, onToggleEdit,
  panelOpen, onTogglePanel, openCommentCount, slideHasComments,
  saveStatus, onPrev, onNext,
}: Props) {
  return (
    <div className="h-11 border-t border-marker-bg-alt flex items-center px-4 shrink-0 select-none">
      {/* Left section */}
      <div className="flex items-center gap-3 flex-1">
        <span className="text-[11px] text-marker-faint">{'< >'} to navigate</span>

        <button
          onClick={onToggleEdit}
          className={`text-[12px] px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
            editing
              ? 'bg-marker-bg-edit text-marker-accent'
              : 'text-marker-muted hover:text-marker-secondary'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8.5 1.5l2 2L4 10H2v-2L8.5 1.5z" />
          </svg>
          Edit
        </button>

        <button
          onClick={onTogglePanel}
          className={`text-[12px] px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors ${
            panelOpen
              ? 'bg-marker-bg-edit text-marker-accent'
              : 'text-marker-muted hover:text-marker-secondary'
          }`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 3h10M1 6h7M1 9h5" />
          </svg>
          Comments
          {openCommentCount > 0 && (
            <span className="bg-marker-accent text-white text-[9px] font-bold px-1.5 rounded-full">
              {openCommentCount}
            </span>
          )}
          {slideHasComments && !panelOpen && (
            <span className="w-[6px] h-[6px] rounded-full bg-marker-accent" />
          )}
        </button>

        {saveStatus === 'saving' && <span className="text-[11px] text-amber-500">Saving...</span>}
        {saveStatus === 'saved' && <span className="text-[11px] text-marker-success">Saved</span>}
        {saveStatus === 'error' && <span className="text-[11px] text-marker-error">Save failed</span>}
      </div>

      {/* Center: nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={slideIdx === 0}
          className="w-8 h-8 flex items-center justify-center rounded-md text-marker-muted hover:text-marker-text disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 4l-4 4 4 4" />
          </svg>
        </button>
        <span className="text-[13px] text-marker-muted tabular-nums min-w-[48px] text-center">
          {slideIdx + 1} / {totalSlides}
        </span>
        <button
          onClick={onNext}
          disabled={slideIdx === totalSlides - 1}
          className="w-8 h-8 flex items-center justify-center rounded-md text-marker-muted hover:text-marker-text disabled:opacity-30"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      <div className="flex-1" />
    </div>
  );
}
