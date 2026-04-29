import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Slide, Comment } from '../../core/types';
import { RichEditableText } from '../editor/RichEditableText';

interface Props {
  slide: Extract<Slide, { type: 'freeform' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
  totalSlides?: number;
  slideIndex?: number;
}

const STAGE_W = 1920;
const STAGE_H = 1080;

/**
 * Render a freeform slide. The slide HTML is parsed once into React nodes;
 * any element with `data-mid` becomes a RichEditableText so the marker editor
 * can hover, click-to-comment, and inline-edit it.
 *
 * The slide content is rendered at its native 1920×1080 design size, then
 * scaled to fit whatever container the renderer gives us — this matches the
 * deck-stage scaling behaviour of the published deck.
 */
export function FreeformSlide({ slide, editing, comments, onEdit, onComment, totalSlides, slideIndex }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current;
    const compute = () => {
      const r = el.getBoundingClientRect();
      const s = Math.min(r.width / STAGE_W, r.height / STAGE_H);
      setScale(s > 0 ? s : 1);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const reactTree = useMemo(() => {
    return parseHtmlToReact(slide.content.html, {
      editing,
      comments,
      onEdit,
      onComment,
      totalSlides,
      slideIndex,
    });
  }, [slide.content.html, editing, comments, onEdit, onComment, totalSlides, slideIndex]);

  // We render an actual <deck-stage> custom element inside a scaled wrapper so
  // every CSS selector that targets `deck-stage > section` (most of the ported
  // theme) matches verbatim. Marker-mode overrides in justcall.css strip the
  // published-deck's position:fixed and make the single slide always visible.
  return (
    <div
      ref={wrapperRef}
      className="marker-freeform-wrapper"
      data-marker-mode="editor"
      style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', overflow: 'hidden', background: '#0a0a0a' }}
    >
      {React.createElement(
        'deck-stage',
        {
          className: 'marker-deck-stage',
          style: {
            width: `${STAGE_W}px`,
            height: `${STAGE_H}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            position: 'relative',
            background: '#fff',
          },
        },
        reactTree,
      )}
    </div>
  );
}

// ------------------------------ HTML → React ------------------------------

interface ParseCtx {
  editing: boolean;
  comments: Comment[];
  onEdit: (id: string, v: string) => void;
  onComment: (id: string) => void;
  totalSlides?: number;
  slideIndex?: number;
}

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
  'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const ATTR_RENAME: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
};

interface DomNode {
  type: 'element' | 'text';
  tag?: string;
  attrs?: Record<string, string>;
  children?: DomNode[];
  text?: string;
}

/**
 * Parse a chunk of HTML into a lightweight DomNode tree using the browser's
 * built-in DOMParser, then walk it producing React. We could pull a parser dep,
 * but DOMParser is already free and handles every edge case we care about.
 */
function parseHtmlToReact(html: string, ctx: ParseCtx): React.ReactNode {
  // Wrap in a container so DOMParser doesn't autocrop top-level <section>.
  const doc = new DOMParser().parseFromString(`<div id="__root">${html}</div>`, 'text/html');
  const root = doc.getElementById('__root');
  if (!root) return null;
  return Array.from(root.childNodes).map((node, i) => domNodeToReact(node, ctx, `${i}`));
}

function domNodeToReact(node: ChildNode, ctx: ParseCtx, key: string): React.ReactNode {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    return node.nodeValue;
  }
  if (node.nodeType !== 1 /* ELEMENT_NODE */) {
    return null;
  }
  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const attrs: Record<string, string> = {};
  for (const a of Array.from(el.attributes)) attrs[a.name] = a.value;

  // --- Marker placeholder elements (logo, pattern, progress) ----------------
  if ('data-marker-logo' in attrs || el.hasAttribute('data-marker-logo')) {
    const variant = el.getAttribute('data-marker-logo-variant') || 'dark';
    return <JustCallLogo key={key} variant={variant === 'light' ? 'light' : 'dark'} />;
  }
  if (el.hasAttribute('data-marker-pattern')) {
    return <CoverPattern key={key} />;
  }
  if (el.hasAttribute('data-marker-progress')) {
    const total = ctx.totalSlides ?? 10;
    const explicit = parseInt(el.getAttribute('data-active-index') || '', 10);
    const active = Number.isFinite(explicit) ? explicit : (ctx.slideIndex ?? 0);
    const className = el.getAttribute('class') || 'progress';
    return (
      <span key={key} className={className}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`dot${i === active ? ' active' : ''}`} />
        ))}
      </span>
    );
  }

  // --- Editable mid elements ------------------------------------------------
  const mid = attrs['data-mid'];
  if (mid && !VOID_TAGS.has(tag)) {
    const reactAttrs = mapAttrs(attrs);
    delete reactAttrs['data-mid'];
    return (
      <RichEditableText
        key={key}
        id={mid}
        html={el.innerHTML}
        tag={tag}
        attrs={reactAttrs}
        editing={ctx.editing}
        comments={ctx.comments}
        onEdit={ctx.onEdit}
        onComment={ctx.onComment}
      />
    );
  }

  // --- Plain element -> recurse ---------------------------------------------
  const reactAttrs = mapAttrs(attrs);
  if (VOID_TAGS.has(tag)) {
    return React.createElement(tag, { key, ...reactAttrs });
  }
  const children = Array.from(el.childNodes).map((c, i) => domNodeToReact(c, ctx, `${key}-${i}`));
  return React.createElement(tag, { key, ...reactAttrs }, ...children);
}

function mapAttrs(attrs: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style') {
      out.style = parseInlineStyle(v);
      continue;
    }
    const reactKey = ATTR_RENAME[k] ?? k;
    out[reactKey] = v;
  }
  return out;
}

function parseInlineStyle(css: string): Record<string, string> {
  const style: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!prop || !val) continue;
    style[cssToCamel(prop)] = val;
  }
  return style;
}

function cssToCamel(prop: string): string {
  if (prop.startsWith('--')) return prop;
  return prop.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
}

// --- Static asset components -------------------------------------------------

function JustCallLogo({ variant }: { variant: 'light' | 'dark' }) {
  if (variant === 'light') {
    return (
      <svg height="32" viewBox="0 0 532 135" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <path d="M11.0094 41.8879L1.05448 50.3838C-0.351492 51.5883 -0.351492 53.7565 1.05448 54.961L11.0094 63.4087" />
        <path d="M89.5726 76.7842L99.5275 68.2882C100.933 67.0837 100.933 64.9156 99.5275 63.711L89.5726 55.2633" />
        <path d="M63.3778 28.8349C62.3273 28.8349 61.3415 29.0276 60.3234 29.14C62.2142 32.7376 63.3778 36.7527 63.3778 41.0889V72.3745C63.3778 85.7046 53.2451 96.5774 40.2358 98.0871C44.5992 106.422 53.2774 112.172 63.3778 112.172C77.8414 112.172 89.574 100.512 89.574 86.1543V54.8687C89.574 40.4947 77.8414 28.8349 63.3778 28.8349Z" />
        <path d="M37.2082 86.1606V54.875C37.2082 41.5449 47.3408 30.6721 60.3501 29.1624C55.9867 20.8271 47.3085 15.0775 37.2082 15.0775C22.7445 15.0775 11.0119 26.7373 11.0119 41.0952V72.3808C11.0119 86.7548 22.7445 98.3985 37.2082 98.3985C38.2424 98.3985 39.2444 98.2058 40.2463 98.0934C38.3717 94.5119 37.2082 90.4969 37.2082 86.1606Z" />
        <path d="M135.312 114.24C129.112 114.24 123.137 113.113 119.98 111.196L125.955 98.2325C127.533 99.3597 130.126 100.036 133.17 100.036C138.468 100.036 142.414 97.6688 142.414 91.4687V34.0894H158.196V92.0323C158.196 107.364 148.501 114.24 135.312 114.24ZM194.015 114.353C181.389 114.353 171.694 104.996 171.694 90.2287V54.3807H186.913V86.5086C186.913 96.6542 191.084 101.051 198.636 101.051C205.062 101.051 210.811 96.6542 210.811 86.5086V54.3807H226.03V113H211.262V104.207C208.444 110.971 203.146 114.353 194.015 114.353ZM259.583 114.465C249.662 114.465 241.659 111.084 235.233 104.207L245.491 94.8506C249.775 99.6979 254.284 102.065 259.244 102.065C264.43 102.065 267.361 99.4725 267.361 95.9779C267.361 92.9342 265.895 91.2432 256.652 89.1014C240.982 85.3813 238.615 78.2794 238.615 70.8392C238.615 60.5808 246.731 52.9152 260.484 52.9152C269.954 52.9152 276.266 55.2826 282.241 63.0609L271.194 71.5156C268.375 67.0064 264.768 65.2028 260.823 65.2028C256.652 65.2028 253.495 66.781 253.495 70.3883C253.495 72.4174 254.397 74.2211 261.386 76.0248C278.408 80.4212 282.354 86.7341 282.354 95.5269C282.354 106.349 272.546 114.465 259.583 114.465ZM314.011 113C302.4 113 296.087 107.589 296.087 94.8506V67.3446H287.858V54.3807H296.087V42.5442L311.306 40.9659V54.3807H323.706V67.3446H311.306V94.0615C311.306 97.7815 313.11 99.4725 316.041 99.4725H322.353V113H314.011ZM372.758 114.465C349.31 114.465 331.611 96.2033 331.611 73.6575C331.611 50.9989 348.408 32.624 372.758 32.624C385.609 32.624 394.514 36.5695 401.616 45.0242L390.456 54.7189C385.721 49.7588 379.859 47.2788 372.758 47.2788C357.539 47.2788 347.957 59.2281 347.957 73.6575C347.957 88.0868 357.539 99.8107 373.096 99.8107C380.761 99.8107 386.511 97.2179 391.132 92.1451L402.631 101.953C396.656 109.167 386.511 114.465 372.758 114.465ZM435.865 114.465C419.745 114.465 406.893 100.825 406.893 83.9158C406.893 67.0064 419.745 53.1407 435.865 53.1407C446.01 53.1407 451.309 57.3117 454.465 63.6245V54.3807H469.571V113H454.803V103.418C451.647 110.069 446.349 114.465 435.865 114.465ZM422.112 83.8031C422.112 92.7087 428.65 100.712 438.345 100.712C448.378 100.712 454.803 93.0469 454.803 83.9158C454.803 74.7847 448.378 66.8937 438.345 66.8937C428.65 66.8937 422.112 74.672 422.112 83.8031ZM483.122 113V30.7076H498.341V113H483.122ZM511.851 113V30.7076H527.069V113H511.851Z" />
      </svg>
    );
  }
  return (
    <svg height="28" viewBox="0 0 100 135" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <path d="M11.0094 41.8879L1.05448 50.3838C-0.351492 51.5883 -0.351492 53.7565 1.05448 54.961L11.0094 63.4087" fill="#03008F" />
      <path d="M89.5726 76.7842L99.5275 68.2882C100.933 67.0837 100.933 64.9156 99.5275 63.711L89.5726 55.2633" fill="#004CE6" />
      <path d="M63.3778 28.8349C62.3273 28.8349 61.3415 29.0276 60.3234 29.14C62.2142 32.7376 63.3778 36.7527 63.3778 41.0889V72.3745C63.3778 85.7046 53.2451 96.5774 40.2358 98.0871C44.5992 106.422 53.2774 112.172 63.3778 112.172C77.8414 112.172 89.574 100.512 89.574 86.1543V54.8687C89.574 40.4947 77.8414 28.8349 63.3778 28.8349Z" fill="#004CE6" />
      <path d="M37.2081 86.1606V54.875C37.2081 41.5449 47.3408 30.6721 60.35 29.1624C55.9867 20.8271 47.3084 15.0775 37.2081 15.0775C22.7444 15.0775 11.0118 26.7373 11.0118 41.0952V72.3808C11.0118 86.7548 22.7444 98.3985 37.2081 98.3985C38.2424 98.3985 39.2443 98.2058 40.2463 98.0934C38.3717 94.5119 37.2081 90.4969 37.2081 86.1606Z" fill="#03008F" />
    </svg>
  );
}

function CoverPattern() {
  return (
    <svg className="pattern" viewBox="0 0 760 920" fill="none" aria-hidden="true">
      <g stroke="white" strokeWidth="1.5" fill="none">
        <circle cx="380" cy="460" r="80" />
        <circle cx="380" cy="460" r="160" />
        <circle cx="380" cy="460" r="240" />
        <circle cx="380" cy="460" r="320" />
        <circle cx="380" cy="460" r="400" />
      </g>
      <g fill="white">
        <circle cx="380" cy="60" r="6" />
        <circle cx="540" cy="240" r="5" />
        <circle cx="700" cy="460" r="6" />
        <circle cx="540" cy="700" r="5" />
        <circle cx="380" cy="780" r="6" />
        <circle cx="220" cy="700" r="5" />
        <circle cx="60" cy="460" r="6" />
        <circle cx="220" cy="240" r="5" />
      </g>
    </svg>
  );
}
