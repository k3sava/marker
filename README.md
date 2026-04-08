# Marker

A review tool for slides. Not a slide tool with review bolted on.

Build a deck, share a link, reviewer clicks elements and leaves comments, run one command, AI reads every comment and applies the edits. Three-minute review cycle.

## Install

```bash
npm install -g marker-slides
```

## Quick start

```bash
marker init quarterly-report     # creates deck with 4 starter slides
cd quarterly-report
marker dev                       # opens browser — edit slides, add comments
```

## The 3-minute review cycle

```bash
# 1. Author builds deck
marker dev

# 2. Author shares for review
marker share                     # deploys to surge.sh, prints URL

# 3. Reviewer opens URL, clicks elements, leaves comments, copies feedback

# 4. Author imports feedback
echo '<paste>' | marker import   # or: marker import feedback.json

# 5. AI processes all comments into edits
marker review                    # shows proposed edits, approve/reject

# 6. Done. Re-share if needed.
marker share
```

## Commands

| Command | What it does |
|---------|-------------|
| `marker init [name]` | Create a new deck (4 starter slides) |
| `marker dev` | Start local dev server with WYSIWYG editing |
| `marker add [type]` | Add a slide: title, section, bullets, comparison, metric, table |
| `marker status` | Show slide count, open comments, deck info |
| `marker share` | Build static deck and deploy to surge.sh |
| `marker share --local` | Build to ./dist/ without deploying |
| `marker import [file]` | Import reviewer comments from file or stdin |
| `marker review` | AI processes open comments into edits (needs ANTHROPIC_API_KEY) |
| `marker review --dry-run` | List open comments without calling the AI |
| `marker review --apply` | Apply all edits without confirmation |

## How it works

A deck is a JSON file. Every text element has a stable ID. Comments reference element IDs, not slide numbers. AI reads the comments and the content together and produces structured edits.

```
deck.json
├── meta          {title, author, date, version}
├── slides[]      6 types: title, section, bullets, comparison, metric, table
├── comments[]    element-level, with context snapshots
└── config        {theme, aspectRatio}
```

## Slide types

| Type | Use for |
|------|---------|
| **title** | Deck cover — heading, subheading, date |
| **section** | Section divider |
| **bullets** | Heading + bullet points + optional kicker |
| **comparison** | 2-3 column side-by-side (before/after, option A/B) |
| **metric** | Big number KPI cards with direction arrows |
| **table** | Data table with headers and rows |

## AI review

Set your API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Or add it to `marker.config.js`:

```js
export default {
  anthropicApiKey: 'sk-ant-...',
};
```

Then run:

```bash
marker review
```

The AI reads all open comments together (not one at a time) so it can reason about how they interact. Each edit is shown as a diff before you approve.

## For reviewers

When someone shares a Marker deck URL with you:

1. Open the link
2. Navigate slides with arrow keys
3. Click any element (heading, bullet, metric) to comment
4. Type your feedback
5. Click **"Copy all feedback to clipboard"**
6. Paste the result in Slack/email

No install, no login, no account needed.

## Why Marker

Every existing tool treats the review loop as someone else's problem:

- **Slidev, Marp, Reveal.js** — render slides, zero review features
- **Google Slides** — comments in a sidebar, no AI, no element targeting
- **Pitch** — best workflow at $20/seat, still slide-level comments
- **Gamma** — AI generates slides but has no review system

Marker is the only tool where comments are first-class data and AI processes feedback into edits.

## License

MIT
