import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { readDeck, writeDeck, deckExists } from '../core/deck.js';
import { mergeComments } from '../core/comments.js';
import type { Comment } from '../core/types.js';

export async function importCommand(source?: string) {
  const dir = resolve(process.cwd());

  if (!deckExists(dir)) {
    console.error('Error: no deck.json in current directory.');
    process.exit(1);
  }

  let raw: string;

  if (source === '-' || !source) {
    // Read from stdin
    if (process.stdin.isTTY && !source) {
      console.error('Usage: echo \'<json>\' | marker import');
      console.error('       marker import feedback.json');
      process.exit(1);
    }
    raw = await readStdin();
  } else {
    raw = await readFile(resolve(source), 'utf-8');
  }

  let incoming: Comment[];
  try {
    incoming = JSON.parse(raw.trim());
    if (!Array.isArray(incoming)) throw new Error('Expected array');
  } catch {
    console.error('Error: could not parse comments. Expected a JSON array of Comment objects.');
    process.exit(1);
  }

  const deck = await readDeck(dir);
  const { merged, added } = mergeComments(deck.comments, incoming);
  deck.comments = merged;
  await writeDeck(dir, deck);

  // Summarize by slide
  const bySlide = new Map<string, number>();
  for (const c of incoming) {
    const count = bySlide.get(c.slideId) || 0;
    bySlide.set(c.slideId, count + 1);
  }

  const slideSummary = Array.from(bySlide.entries())
    .map(([sid, count]) => {
      const idx = deck.slides.findIndex(s => s.id === sid);
      return `${count} on slide ${idx + 1}`;
    })
    .join(', ');

  console.log(`Imported ${added} new comment${added !== 1 ? 's' : ''}${slideSummary ? ` (${slideSummary})` : ''}.`);
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}
