# Marker

You build the deck. You send it for review. Feedback arrives in Slack, email, screenshot markup. You open the source file, find each thing mentioned, make the edit, re-export, re-send. The reviewer sends more notes. You do it again. The content work takes 30 minutes. The review loop takes 3 hours.

Marker fixes the loop. Not the slides.

An open-source CLI that renders a JSON file as a slide deck with inline editing and element-level comments. Click to add comments. Run one command. AI reads every comment together, produces the edits, you approve, done. Time taken? 3 minutes instead of 30.

## Install

```bash
npm install -g marker-slides
```

## Quick start

```bash
marker init quarterly-report
cd quarterly-report
marker dev
```

Browser opens. Four starter slides. Click to edit. Arrow keys to navigate.

## The review loop

This is the whole product. Everything else is plumbing.

```bash
# Build your deck
marker dev

# Share it
marker share                     # deploys to surge.sh, prints URL

# Reviewer opens the link, clicks elements, types comments, hits "Copy feedback"
# They paste the result in Slack. No install, no login, no account.

# Import the feedback
echo '<paste>' | marker import

# AI processes every comment into a concrete edit
marker review

# Approve the edits. Re-share.
marker share
```

## Commands

| Command | What it does |
|---------|-------------|
| `marker init [name]` | Create a new deck |
| `marker dev` | Local dev server with editing and comments |
| `marker add [type]` | Add a slide (title, section, bullets, comparison, metric, table) |
| `marker status` | Slide count, open comments, deck info |
| `marker share` | Build and deploy for review |
| `marker share --local` | Build to ./dist/ only |
| `marker import [file]` | Import reviewer comments from file or stdin |
| `marker review` | AI turns comments into edits |
| `marker review --dry-run` | List comments without calling the AI |
| `marker review --apply` | Apply all edits without asking |

## How it works

A deck is a JSON file. Every text element gets a stable ID. Comments reference IDs, not slide numbers. The AI sees all the comments and the surrounding content in one pass, so it can reason about how edits interact.

```
deck.json
├── meta          title, author, date, version
├── slides[]      6 types, each with typed content
├── comments[]    element-level, with context snapshots
└── config        theme, aspect ratio
```

### Slide types

**title** for covers. **section** for dividers. **bullets** for the workhorse slides. **comparison** for side-by-side columns. **metric** for big KPI numbers. **table** for data.

These six cover 90% of recurring exec decks, monthly reports, and client deliverables.

## AI review

```bash
export ANTHROPIC_API_KEY=sk-ant-...
marker review
```

Or set it in `marker.config.js`:

```js
export default {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};
```

The model reads every open comment in a single prompt. Not one at a time. This matters because comment A might change a heading, and comment B might reference that heading. Sequential processing produces incoherent edits. Batch processing doesn't.

Each proposed edit shows a before/after diff. You approve, reject, or let it run with `--apply`.

## For reviewers

Someone shared a Marker URL with you. Here's what you do:

1. Open the link
2. Arrow keys to navigate
3. Click any element to comment on it
4. Type your feedback
5. Click "Copy all feedback to clipboard"
6. Paste it in Slack

That's it. No install. No account. Just a URL and a clipboard.

## License

MIT

