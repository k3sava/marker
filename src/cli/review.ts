import { resolve } from 'path';
import { readDeck, writeDeck, deckExists, findElement, updateElement } from '../core/deck.js';
import { openComments, resolveComment } from '../core/comments.js';
import type { ReviewEdit, Deck, Comment } from '../core/types.js';
import { buildReviewPrompt } from '../ai/prompt.js';

export async function reviewCommand(opts?: { apply?: boolean; dryRun?: boolean }) {
  const dir = resolve(process.cwd());

  if (!deckExists(dir)) {
    console.error('Error: no deck.json in current directory.');
    process.exit(1);
  }

  const deck = await readDeck(dir);
  const open = openComments(deck.comments);

  if (open.length === 0) {
    console.log('No open comments to review.');
    return;
  }

  console.log(`\n  ${open.length} open comment${open.length !== 1 ? 's' : ''} to review.\n`);

  // Dry run: just list the comments
  if (opts?.dryRun) {
    for (const c of open) {
      const slideIdx = deck.slides.findIndex(s => s.id === c.slideId);
      console.log(`  [slide ${slideIdx + 1}] ${c.author}: "${c.text}"`);
      console.log(`    on: "${c.context}"`);
      console.log();
    }
    console.log('(dry run -- would send these to Claude for review)');
    return;
  }

  // Check for API key: env var first, then marker.config.js
  let apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    try {
      const configPath = resolve(dir, 'marker.config.js');
      const config = await import(configPath);
      apiKey = config.default?.anthropicApiKey;
    } catch { /* no config or no key in config */ }
  }
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY not set.');
    console.error('Set it: export ANTHROPIC_API_KEY=your-key');
    process.exit(1);
  }

  console.log('Sending to Claude for review...\n');

  let edits: ReviewEdit[];
  try {
    edits = await callClaude(apiKey, deck, open);
  } catch (e) {
    console.error('AI review failed:', (e as Error).message);
    process.exit(1);
  }

  if (edits.length === 0) {
    console.log('AI returned no edits.');
    return;
  }

  // Show proposals
  for (const edit of edits) {
    const comment = deck.comments.find(c => c.id === edit.commentId);
    console.log(`  Comment: "${comment?.text}"`);
    console.log(`  Action:  ${edit.operation}`);
    if (edit.oldValue) console.log(`  Before:  ${edit.oldValue}`);
    if (edit.newValue) console.log(`  After:   ${edit.newValue}`);
    console.log(`  Why:     ${edit.explanation}`);
    console.log();
  }

  // Apply edits
  if (!opts?.apply) {
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise<string>(res =>
      rl.question(`Apply ${edits.length} edit(s)? [y/N] `, res),
    );
    rl.close();
    if (answer.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      return;
    }
  }

  let applied = 0;
  for (const edit of edits) {
    if (edit.operation === 'edit' && edit.newValue) {
      if (updateElement(deck, edit.targetId, edit.newValue)) {
        deck.comments = resolveComment(deck.comments, edit.commentId);
        applied++;
      }
    } else if (edit.operation === 'remove') {
      // For v0.1, we resolve the comment but don't delete elements
      deck.comments = resolveComment(deck.comments, edit.commentId);
      applied++;
    }
  }

  deck.meta.version++;
  await writeDeck(dir, deck);
  console.log(`Applied ${applied} edit${applied !== 1 ? 's' : ''}. Deck version: ${deck.meta.version}`);
}

async function callClaude(apiKey: string, deck: Deck, comments: Comment[]): Promise<ReviewEdit[]> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });

  const prompt = buildReviewPrompt(deck, comments);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Extract the outermost JSON array by finding balanced brackets
  const start = text.indexOf('[');
  if (start === -1) throw new Error('No JSON array in AI response');

  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error('Unbalanced JSON array in AI response');

  return JSON.parse(text.slice(start, end + 1)) as ReviewEdit[];
}
