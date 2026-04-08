import { resolve } from 'path';
import { deckExists } from '../core/deck.js';
import { startServer } from '../server/index.js';

export async function devCommand(opts?: { port?: string; open?: boolean }) {
  const dir = resolve(process.cwd());

  if (!deckExists(dir)) {
    console.error('Error: no deck.json in current directory. Run "marker init" first.');
    process.exit(1);
  }

  const port = opts?.port ? parseInt(opts.port, 10) : undefined;
  const shouldOpen = opts?.open !== false;

  await startServer(dir, { port, open: shouldOpen });
}
