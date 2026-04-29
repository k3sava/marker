import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import type { Deck } from '../core/types';
// Both themes are bundled. We pick the active one via the [data-theme] attribute
// on <html> so CSS already scopes all justcall rules.
import './theme/default.css';
import './theme/justcall.css';

function applyTheme(theme: string) {
  document.documentElement.dataset.theme = theme || 'default';
}

async function bootstrap() {
  const staticDeck = (window as unknown as { __MARKER_DECK__?: Deck }).__MARKER_DECK__;
  let theme = 'default';

  if (staticDeck?.config?.theme) {
    theme = staticDeck.config.theme;
  } else {
    try {
      const res = await fetch('/api/deck');
      if (res.ok) {
        const deck = (await res.json()) as Deck;
        if (deck?.config?.theme) theme = deck.config.theme;
      }
    } catch { /* fall through to default */ }
  }
  applyTheme(theme);

  // Watch for theme changes mid-session (dev-mode WebSocket already triggers a
  // reload of the deck JSON; we re-read the config on every load so editing
  // marker.config or deck.config.theme is picked up after a save).
  window.addEventListener('marker:theme', (e: Event) => {
    const detail = (e as CustomEvent<{ theme: string }>).detail;
    if (detail?.theme) applyTheme(detail.theme);
  });

  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
