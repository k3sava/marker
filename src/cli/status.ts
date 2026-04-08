import { resolve } from 'path';
import { readDeck, deckExists } from '../core/deck.js';
import { openComments } from '../core/comments.js';

export async function statusCommand() {
  const dir = resolve(process.cwd());

  if (!deckExists(dir)) {
    console.error('Error: no deck.json in current directory.');
    process.exit(1);
  }

  const deck = await readDeck(dir);
  const open = openComments(deck.comments);
  const resolved = deck.comments.filter(c => c.status === 'resolved');

  console.log(`\n  ${deck.meta.title}`);
  console.log(`  ${'─'.repeat(40)}`);
  console.log(`  Slides:    ${deck.slides.length}`);
  console.log(`  Comments:  ${deck.comments.length} total (${open.length} open, ${resolved.length} resolved)`);
  console.log(`  Author:    ${deck.meta.author || '(not set)'}`);
  console.log(`  Date:      ${deck.meta.date}`);
  console.log(`  Version:   ${deck.meta.version}`);
  console.log();

  if (open.length > 0) {
    console.log('  Open comments:');
    for (const c of open) {
      const slide = deck.slides.find(s => s.id === c.slideId);
      const slideNum = slide ? deck.slides.indexOf(slide) + 1 : '?';
      console.log(`    [slide ${slideNum}] ${c.author || 'anon'}: "${c.text}"`);
    }
    console.log();
  }
}
