'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Zap, Hash, Clock } from 'lucide-react';

interface QuickCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: (title: string, content: string, tags?: string[]) => void;
}

export function QuickCapture({ isOpen, onClose, onCreateNote }: QuickCaptureProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() || content.trim()) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      onCreateNote(title || 'Quick Note', content, tagArray);
      setTitle('');
      setContent('');
      setTags('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-popover border border-border rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Quick Capture</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Note title (optional)"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind? (Cmd/Ctrl + Enter to save)"
              rows={6}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tags (comma separated)"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="text-xs text-muted-foreground">
                <span>Cmd/Ctrl + Enter to save • Esc to cancel</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Save Note
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}