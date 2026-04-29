import { resolve } from 'path';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { packageRoot } from './paths.js';
import { createFreeformSlideFromTemplate } from './template.js';
import type { Deck, Slide } from './types.js';

export interface LayoutManifestEntry {
  slug: string;
  file: string;
  label: string;
}

export interface TemplateManifest {
  name: string;
  title: string;
  description?: string;
  theme?: string;          // theme to set on the new deck
  layouts: LayoutManifestEntry[];
}

/** Path to the bundled templates directory (templates/<name>/). */
export function templatesDir(): string {
  return resolve(packageRoot(), 'src', 'templates');
}

/** Read a template manifest by name. */
export function loadTemplateManifest(name: string): TemplateManifest | null {
  const file = resolve(templatesDir(), name, 'manifest.json');
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf-8')) as TemplateManifest;
}

/** Read a single layout HTML by template + slug. */
export function loadLayoutHtml(templateName: string, layoutFile: string): string {
  const file = resolve(templatesDir(), templateName, layoutFile);
  return readFileSync(file, 'utf-8');
}

/** List available templates. */
export function listTemplates(): string[] {
  const dir = templatesDir();
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(n => existsSync(resolve(dir, n, 'manifest.json')));
}

/**
 * Build a full Deck from a template manifest. Each layout becomes a freeform
 * slide; data-mid attributes inside the layout are namespaced under the new
 * slide id so duplicates of the same layout don't collide.
 */
export function buildDeckFromTemplate(manifest: TemplateManifest, opts: { title: string; author: string }): Deck {
  const slides: Slide[] = manifest.layouts.map(entry => {
    const html = loadLayoutHtml(manifest.name, entry.file);
    return createFreeformSlideFromTemplate(entry.slug, entry.label, html) as Slide;
  });
  return {
    meta: {
      title: opts.title,
      author: opts.author,
      date: new Date().toISOString().split('T')[0],
      version: 1,
    },
    slides,
    comments: [],
    config: {
      theme: manifest.theme || manifest.name,
      aspectRatio: '16:9',
    },
  };
}
