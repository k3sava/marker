import { nanoid } from 'nanoid';

export function slideId(): string {
  return `s-${nanoid(8)}`;
}

export function elementId(slideId: string, suffix: string): string {
  return `${slideId}-${suffix}`;
}

export function commentId(): string {
  return `c-${nanoid(8)}`;
}

export function el(id: string, text: string) {
  return { id, text };
}
