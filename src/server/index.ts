import express from 'express';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { getPort } from 'get-port-please';
import { WebSocketServer } from 'ws';
import { watch, type FSWatcher } from 'fs';
import { readDeck, writeDeck, deckPath, updateElement } from '../core/deck.js';
import { packageRoot, rendererDist, rendererSrc } from '../core/paths.js';

// Async mutex to prevent concurrent read-modify-write races on deck.json
let writeLock: Promise<void> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = writeLock;
  let release: () => void;
  writeLock = new Promise(r => { release = r; });
  return prev.then(fn).finally(() => release!());
}

export async function startServer(
  deckDir: string,
  opts: { port?: number; open?: boolean } = {},
) {
  const port = opts.port || await getPort({ port: 3000, portRange: [3000, 3100] });
  const app = express();
  app.use(express.json());

  // --- API endpoints ---

  app.get('/api/deck', async (_req, res) => {
    try { res.json(await readDeck(deckDir)); }
    catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.patch('/api/deck', async (req, res) => {
    try {
      const { targetId, value } = req.body ?? {};
      if (typeof targetId !== 'string' || typeof value !== 'string') {
        res.status(400).json({ error: 'targetId and value must be strings' }); return;
      }
      await withLock(async () => {
        const deck = await readDeck(deckDir);
        if (updateElement(deck, targetId, value)) {
          await writeDeck(deckDir, deck);
          res.json({ ok: true });
        } else {
          res.status(404).json({ error: 'Element not found' });
        }
      });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.post('/api/deck/slides', async (req, res) => {
    try {
      const { slide, afterId } = req.body ?? {};
      if (!slide?.id || !slide?.type || !slide?.content) {
        res.status(400).json({ error: 'slide must have id, type, and content' }); return;
      }
      await withLock(async () => {
        const deck = await readDeck(deckDir);
        if (afterId) {
          const idx = deck.slides.findIndex(s => s.id === afterId);
          deck.slides.splice(idx >= 0 ? idx + 1 : deck.slides.length, 0, slide);
        } else {
          deck.slides.push(slide);
        }
        await writeDeck(deckDir, deck);
        res.json({ ok: true, count: deck.slides.length });
      });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.delete('/api/deck/slides/:id', async (req, res) => {
    try {
      await withLock(async () => {
        const deck = await readDeck(deckDir);
        const before = deck.slides.length;
        deck.slides = deck.slides.filter(s => s.id !== req.params.id);
        if (deck.slides.length === before) {
          res.status(404).json({ error: 'Slide not found' }); return;
        }
        await writeDeck(deckDir, deck);
        res.json({ ok: true, count: deck.slides.length });
      });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  app.put('/api/deck/comments', async (req, res) => {
    try {
      const { comments } = req.body ?? {};
      if (!Array.isArray(comments)) {
        res.status(400).json({ error: 'comments must be an array' }); return;
      }
      await withLock(async () => {
        const deck = await readDeck(deckDir);
        deck.comments = comments;
        await writeDeck(deckDir, deck);
        res.json({ ok: true });
      });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  // --- Renderer: Vite dev or static files ---

  const builtRenderer = rendererDist();
  const useVite = !existsSync(resolve(builtRenderer, 'index.html'));

  if (useVite) {
    // Dev mode: use Vite middleware for HMR
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: rendererSrc(),
      server: { middlewareMode: true, hmr: { port: port + 1 } },
      appType: 'spa',
      resolve: {
        alias: { '@marker': resolve(packageRoot(), 'src') },
      },
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve pre-built static files
    app.use(express.static(builtRenderer));
    // Express 5 requires named wildcard parameter
    app.get('{*path}', (_req, res) => {
      res.sendFile(resolve(builtRenderer, 'index.html'));
    });
  }

  const server = app.listen(port, () => {
    console.log(`\n  Marker dev server running at http://localhost:${port}\n`);
  });

  // --- WebSocket + file watcher ---

  const wss = new WebSocketServer({ server, path: '/ws' });
  let debounce: ReturnType<typeof setTimeout> | null = null;
  const watcher: FSWatcher = watch(deckPath(deckDir), () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      wss.clients.forEach(client => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ type: 'deck-changed' }));
        }
      });
    }, 200);
  });

  server.on('close', () => { watcher.close(); wss.close(); });

  if (opts.open) {
    const open = (await import('open')).default;
    open(`http://localhost:${port}`);
  }

  return server;
}
