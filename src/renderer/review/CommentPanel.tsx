import React, { useState } from 'react';
import type { Comment } from '../../core/types';

interface Props {
  comments: Comment[];
  allComments: Comment[];
  commentingOn: string | null;
  onAddComment: (targetId: string, text: string, author: string) => void;
  onClose: () => void;
  slideNumber: number;
}

export function CommentPanel({ comments, allComments, commentingOn, onAddComment, onClose, slideNumber }: Props) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleSubmit = () => {
    if (!text.trim() || !commentingOn) return;
    onAddComment(commentingOn, text.trim(), author.trim());
    setText('');
  };

  const handleExport = async () => {
    const openComments = allComments.filter(c => c.status === 'open');
    const json = JSON.stringify(openComments, null, 2);
    await navigator.clipboard.writeText(json);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[360px] bg-white border-l border-marker-border shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-marker-border">
        <h3 className="text-[14px] font-semibold text-marker-text">
          Slide {slideNumber} Comments
        </h3>
        <button onClick={onClose} className="text-marker-muted hover:text-marker-text text-[18px]">
          &times;
        </button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {comments.length === 0 && !commentingOn && (
          <p className="text-[13px] text-marker-muted text-center py-8">
            No comments on this slide yet.
            <br />Click any element to add one.
          </p>
        )}
        {comments.map(c => (
          <div
            key={c.id}
            className={`rounded-lg p-3 text-[13px] ${
              c.status === 'resolved' ? 'bg-marker-bg-alt opacity-60' : 'bg-marker-bg-card'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-marker-text">{c.author || 'Reviewer'}</span>
              <span className="text-[11px] text-marker-muted">
                {new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            {c.context && (
              <div className="text-[11px] text-marker-muted italic mb-1 truncate">
                on: "{c.context}"
              </div>
            )}
            <p className="text-marker-secondary leading-[18px]">{c.text}</p>
            {c.status === 'resolved' && (
              <span className="inline-block mt-1 text-[10px] font-bold uppercase text-marker-success">Resolved</span>
            )}
          </div>
        ))}
      </div>

      {/* Add comment form */}
      {commentingOn && (
        <div className="border-t border-marker-border p-4 space-y-2">
          <input
            type="text"
            placeholder="Your name"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            className="w-full text-[13px] px-3 py-2 rounded-md border border-marker-border focus:outline-none focus:ring-2 focus:ring-marker-accent/30"
          />
          <textarea
            placeholder="Add a comment..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
            rows={2}
            className="w-full text-[13px] px-3 py-2 rounded-md border border-marker-border focus:outline-none focus:ring-2 focus:ring-marker-accent/30 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-full py-2 rounded-md bg-marker-accent text-white text-[13px] font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            Add Comment
          </button>
        </div>
      )}

      {/* Export button */}
      <div className="border-t border-marker-border p-3">
        <button
          onClick={handleExport}
          className={`w-full py-2 rounded-md border text-[12px] transition-colors ${
            copyStatus === 'copied'
              ? 'border-marker-success text-marker-success'
              : 'border-marker-border text-marker-muted hover:text-marker-text hover:border-marker-tertiary'
          }`}
        >
          {copyStatus === 'copied'
            ? `Copied ${allComments.filter(c => c.status === 'open').length} comment(s)`
            : 'Copy all feedback to clipboard'}
        </button>
      </div>
    </div>
  );
}
