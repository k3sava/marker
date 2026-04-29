// Utilities for the `freeform` slide type. The slide stores raw HTML with
// `data-mid="<id>"` attributes on every editable element. We need to be able
// to (a) find the inner HTML of an element by mid, (b) replace it, and (c)
// list every mid on a slide. No DOM available in Node, no parser dependency.

const TAG_NAME = '[a-zA-Z][a-zA-Z0-9]*';

function escapeRegex(s: string): string {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export interface MidMatch {
  tag: string;
  innerHtml: string;
  openStart: number;
  openEnd: number;
  closeStart: number;
  closeEnd: number;
}

/**
 * Locate the element bearing data-mid="<mid>". Returns its tag, innerHTML, and
 * positions of the opening/closing tag boundaries so callers can splice. Handles
 * nested same-name tags by tracking depth. Self-closing void elements are not
 * supported (we never put data-mid on those).
 */
export function findMidElement(html: string, mid: string): MidMatch | null {
  const openRe = new RegExp(
    `<(${TAG_NAME})\\b([^>]*\\bdata-mid="${escapeRegex(mid)}"[^>]*)>`,
    'i',
  );
  const m = openRe.exec(html);
  if (!m) return null;
  const tag = m[1].toLowerCase();
  const openStart = m.index;
  const openEnd = m.index + m[0].length;

  // Walk forward, tracking depth on same-tag opens vs closes.
  const sameOpen = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  const sameClose = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 1;
  let cursor = openEnd;
  while (cursor < html.length) {
    sameOpen.lastIndex = cursor;
    sameClose.lastIndex = cursor;
    const o = sameOpen.exec(html);
    const c = sameClose.exec(html);
    if (!c) return null;
    if (o && o.index < c.index) {
      depth++;
      cursor = o.index + o[0].length;
    } else {
      depth--;
      if (depth === 0) {
        return {
          tag,
          innerHtml: html.slice(openEnd, c.index),
          openStart,
          openEnd,
          closeStart: c.index,
          closeEnd: c.index + c[0].length,
        };
      }
      cursor = c.index + c[0].length;
    }
  }
  return null;
}

/** Replace the innerHTML of the element with data-mid="<mid>". */
export function updateMidElement(html: string, mid: string, newInnerHtml: string): string | null {
  const found = findMidElement(html, mid);
  if (!found) return null;
  return html.slice(0, found.openEnd) + newInnerHtml + html.slice(found.closeStart);
}

/** Return every data-mid value present in the html, in document order. */
export function listMids(html: string): string[] {
  const ids: string[] = [];
  const re = /\bdata-mid="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) ids.push(m[1]);
  return ids;
}

/** Read a freeform mid's current innerHTML; returns null if missing. */
export function readMid(html: string, mid: string): string | null {
  return findMidElement(html, mid)?.innerHtml ?? null;
}

/** Remove HTML tags for plain-text excerpts (used in comment context, thumbnails). */
export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
