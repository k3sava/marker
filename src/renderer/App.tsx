import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Deck } from '../core/types';
import { findElement } from '../core/elements';
import { SlideRenderer } from './slides/SlideRenderer';
import { ThumbnailRail } from './nav/ThumbnailRail';
import { CommentPanel } from './review/CommentPanel';
import { Toolbar } from './nav/Toolbar';

export function App() {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mode: embedded static data (shared) vs live API (dev server)
  const isStatic = !!(window as unknown as { __MARKER_DECK__?: unknown }).__MARKER_DECK__;

  const loadDeck = useCallback(async () => {
    if (isStatic) {
      setDeck((window as unknown as { __MARKER_DECK__: Deck }).__MARKER_DECK__);
      return;
    }
    try {
      const res = await fetch('/api/deck');
      const data = await res.json();
      setDeck(data);
    } catch {
      console.error('Failed to load deck');
    }
  }, [isStatic]);

  useEffect(() => { loadDeck(); }, [loadDeck]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (statusResetTimer.current) clearTimeout(statusResetTimer.current);
    };
  }, []);

  // WebSocket for external changes (dev mode only)
  useEffect(() => {
    if (isStatic) return;
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${location.host}/ws`);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'deck-changed') loadDeck();
    };
    return () => ws.close();
  }, [loadDeck, isStatic]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setSlideIdx(i => Math.min(i + 1, (deck?.slides.length ?? 1) - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSlideIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Home') {
        setSlideIdx(0);
      } else if (e.key === 'End') {
        setSlideIdx((deck?.slides.length ?? 1) - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deck]);

  const showSaveStatus = useCallback((status: 'saved' | 'error') => {
    setSaveStatus(status);
    if (statusResetTimer.current) clearTimeout(statusResetTimer.current);
    statusResetTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  // Edit handler with debounce
  const handleEdit = useCallback((targetId: string, value: string) => {
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/deck', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetId, value }),
        });
        showSaveStatus(res.ok ? 'saved' : 'error');
        if (res.ok) loadDeck();
      } catch {
        showSaveStatus('error');
      }
    }, 500);
  }, [loadDeck, showSaveStatus]);

  // Comment handler using core findElement for context
  const handleAddComment = useCallback(async (targetId: string, text: string, author: string) => {
    if (!deck) return;

    const slide = deck.slides[slideIdx];
    const found = findElement(deck, targetId);
    const context = found?.element.text ?? '';

    const newComment = {
      id: `c-${crypto.randomUUID().slice(0, 8)}`,
      targetId,
      slideId: slide.id,
      author: author || 'Reviewer',
      text,
      context,
      timestamp: new Date().toISOString(),
      status: 'open' as const,
    };

    try {
      const updated = [...deck.comments, newComment];
      await fetch('/api/deck/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: updated }),
      });
      loadDeck();
      setCommentingOn(null);
    } catch {
      console.error('Failed to save comment');
    }
  }, [deck, slideIdx, loadDeck]);

  if (!deck) {
    return <div className="flex items-center justify-center h-full text-marker-muted">Loading...</div>;
  }

  const slide = deck.slides[slideIdx];
  const slideComments = deck.comments.filter(c => c.slideId === slide?.id);
  const openCount = deck.comments.filter(c => c.status === 'open').length;

  return (
    <div className="flex h-full w-full">
      <ThumbnailRail
        slides={deck.slides}
        currentIdx={slideIdx}
        comments={deck.comments}
        onSelect={setSlideIdx}
      />

      <div className="flex-1 flex flex-col min-w-0" style={{ marginRight: panelOpen ? 360 : 0 }}>
        <div className="flex-1 relative overflow-hidden">
          {slide && (
            <SlideRenderer
              slide={slide}
              editing={editing}
              comments={slideComments}
              onEdit={handleEdit}
              onComment={(targetId) => { setCommentingOn(targetId); setPanelOpen(true); }}
              totalSlides={deck.slides.length}
              slideIndex={slideIdx}
            />
          )}
        </div>

        <Toolbar
          slideIdx={slideIdx}
          totalSlides={deck.slides.length}
          editing={editing}
          onToggleEdit={() => setEditing(!editing)}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen(!panelOpen)}
          openCommentCount={openCount}
          slideHasComments={slideComments.length > 0}
          saveStatus={saveStatus}
          onPrev={() => setSlideIdx(i => Math.max(i - 1, 0))}
          onNext={() => setSlideIdx(i => Math.min(i + 1, deck.slides.length - 1))}
        />

        <div className="h-[3px] bg-marker-bg-alt relative">
          <div
            className="h-full bg-marker-accent transition-all duration-300 ease-out"
            style={{ width: `${((slideIdx + 1) / deck.slides.length) * 100}%` }}
          />
          {deck.slides.map((s, i) => {
            const hasComment = deck.comments.some(c => c.slideId === s.id && c.status === 'open');
            if (!hasComment) return null;
            return (
              <div
                key={s.id}
                className="absolute top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-marker-error"
                style={{ left: `${((i + 0.5) / deck.slides.length) * 100}%` }}
              />
            );
          })}
        </div>
      </div>

      {panelOpen && (
        <CommentPanel
          comments={slideComments}
          allComments={deck.comments}
          commentingOn={commentingOn}
          onAddComment={handleAddComment}
          onClose={() => { setPanelOpen(false); setCommentingOn(null); }}
          slideNumber={slideIdx + 1}
        />
      )}
    </div>
  );
}
