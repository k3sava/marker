import type { Deck } from './types.js';
import { slideId, elementId, el } from './ids.js';

export function createDefaultDeck(title: string, author: string): Deck {
  const s1 = slideId();
  const s2 = slideId();
  const s3 = slideId();
  const s4 = slideId();

  return {
    meta: {
      title,
      author,
      date: new Date().toISOString().split('T')[0],
      version: 1,
    },
    slides: [
      {
        id: s1,
        type: 'title',
        content: {
          heading: el(elementId(s1, 'h'), title),
          subheading: el(elementId(s1, 'sh'), 'Created with Marker'),
        },
      },
      {
        id: s2,
        type: 'bullets',
        content: {
          heading: el(elementId(s2, 'h'), 'Key Points'),
          items: [
            el(elementId(s2, 'i1'), 'First point goes here'),
            el(elementId(s2, 'i2'), 'Second point goes here'),
            el(elementId(s2, 'i3'), 'Third point goes here'),
          ],
        },
      },
      {
        id: s3,
        type: 'metric',
        content: {
          heading: el(elementId(s3, 'h'), 'Results'),
          metrics: [
            { value: el(elementId(s3, 'v1'), '42%'), label: el(elementId(s3, 'l1'), 'Growth'), direction: 'up' as const },
            { value: el(elementId(s3, 'v2'), '$1.2M'), label: el(elementId(s3, 'l2'), 'Revenue') },
            { value: el(elementId(s3, 'v3'), '98%'), label: el(elementId(s3, 'l3'), 'Satisfaction'), direction: 'up' as const },
          ],
        },
      },
      {
        id: s4,
        type: 'comparison',
        content: {
          heading: el(elementId(s4, 'h'), 'Before vs After'),
          columns: [
            {
              label: el(elementId(s4, 'cl1'), 'Before'),
              items: [
                el(elementId(s4, 'c1i1'), 'Manual process'),
                el(elementId(s4, 'c1i2'), '3-hour review cycles'),
              ],
            },
            {
              label: el(elementId(s4, 'cl2'), 'After'),
              items: [
                el(elementId(s4, 'c2i1'), 'Automated with Marker'),
                el(elementId(s4, 'c2i2'), '3-minute review cycles'),
              ],
            },
          ],
        },
      },
    ],
    comments: [],
    config: {
      theme: 'default',
      aspectRatio: '16:9',
    },
  };
}

export function createSlideTemplate(type: string, sid?: string): { id: string; type: string; content: Record<string, unknown> } | null {
  const id = sid ?? slideId();

  switch (type) {
    case 'title':
      return {
        id, type: 'title',
        content: {
          heading: el(elementId(id, 'h'), 'Slide Title'),
          subheading: el(elementId(id, 'sh'), 'Subtitle'),
        },
      };
    case 'section':
      return {
        id, type: 'section',
        content: {
          heading: el(elementId(id, 'h'), 'Section Title'),
        },
      };
    case 'bullets':
      return {
        id, type: 'bullets',
        content: {
          heading: el(elementId(id, 'h'), 'Bullet Points'),
          items: [
            el(elementId(id, 'i1'), 'First item'),
            el(elementId(id, 'i2'), 'Second item'),
          ],
        },
      };
    case 'comparison':
      return {
        id, type: 'comparison',
        content: {
          heading: el(elementId(id, 'h'), 'Comparison'),
          columns: [
            { label: el(elementId(id, 'cl1'), 'Option A'), items: [el(elementId(id, 'c1i1'), 'Point one')] },
            { label: el(elementId(id, 'cl2'), 'Option B'), items: [el(elementId(id, 'c2i1'), 'Point one')] },
          ],
        },
      };
    case 'metric':
      return {
        id, type: 'metric',
        content: {
          heading: el(elementId(id, 'h'), 'Metrics'),
          metrics: [
            { value: el(elementId(id, 'v1'), '0'), label: el(elementId(id, 'l1'), 'Metric 1') },
            { value: el(elementId(id, 'v2'), '0'), label: el(elementId(id, 'l2'), 'Metric 2') },
          ],
        },
      };
    case 'table':
      return {
        id, type: 'table',
        content: {
          heading: el(elementId(id, 'h'), 'Data Table'),
          headers: [el(elementId(id, 'th1'), 'Column 1'), el(elementId(id, 'th2'), 'Column 2')],
          rows: [
            [el(elementId(id, 'r1c1'), 'Cell'), el(elementId(id, 'r1c2'), 'Cell')],
          ],
        },
      };
    default:
      return null;
  }
}
