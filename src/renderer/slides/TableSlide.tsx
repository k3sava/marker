import React from 'react';
import type { Slide, Comment } from '../../core/types';
import { EditableText } from '../editor/EditableText';

interface Props {
  slide: Extract<Slide, { type: 'table' }>;
  editing: boolean;
  comments: Comment[];
  onEdit: (targetId: string, value: string) => void;
  onComment: (targetId: string) => void;
}

export function TableSlide({ slide, editing, comments, onEdit, onComment }: Props) {
  const c = slide.content;

  return (
    <div className="slide-frame">
      <EditableText
        id={c.heading.id} text={c.heading.text}
        editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
        tag="h2"
        className="text-[36px] font-semibold leading-[42px] tracking-[-1px] text-marker-text"
      />
      <div className="mt-6 flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {c.headers.map(header => (
                <th key={header.id} className="text-left px-4 py-3 bg-marker-bg-card border border-marker-border">
                  <EditableText
                    id={header.id} text={header.text}
                    editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
                    className="text-[13px] font-bold uppercase tracking-[0.3px] text-marker-tertiary"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 1 ? 'bg-marker-bg-card' : ''}>
                {row.map(cell => (
                  <td key={cell.id} className="px-4 py-3 border border-marker-border align-top">
                    <EditableText
                      id={cell.id} text={cell.text}
                      editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
                      className="text-[14px] leading-[20px] text-marker-secondary"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {c.kicker && (
        <div className="mt-4 flex items-start gap-2">
          <span className="w-[3px] self-stretch bg-marker-accent rounded-full shrink-0" />
          <EditableText
            id={c.kicker.id} text={c.kicker.text}
            editing={editing} comments={comments} onEdit={onEdit} onComment={onComment}
            className="text-[14px] font-medium leading-[20px] text-marker-text"
          />
        </div>
      )}
    </div>
  );
}
