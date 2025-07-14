'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Hash, Clock, Zap, Brain, Download, Trash2 } from 'lucide-react';
import { Note } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
}

export function CommandPalette({ isOpen, onClose, notes, onSelectNote, onCreateNote }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const commands = [
    { id: 'new', label: 'Create New Note', icon: Plus, action: onCreateNote },
    { id: 'search', label: 'Search Notes', icon: Search, action: () => {} },
  ];

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(query.toLowerCase()) ||
    note.content.toLowerCase().includes(query.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
  );

  const allItems = query ? filteredNotes : [...commands, ...notes.slice(0, 5)];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(Math.min(selectedIndex + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(Math.max(selectedIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = allItems[selectedIndex];
      if ('action' in item) {
        item.action();
      } else {
        onSelectNote(item);
      }
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-32 z-50">
      <div className="bg-popover border border-border rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes or type a command..."
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-lg"
            />
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No notes found</p>
            </div>
          ) : (
            allItems.map((item, index) => (
              <div
                key={'action' in item ? item.id : item.id}
                className={`p-4 cursor-pointer transition-colors ${
                  index === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  if ('action' in item) {
                    item.action();
                  } else {
                    onSelectNote(item);
                  }
                  onClose();
                }}
              >
                {'action' in item ? (
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{item.title || 'Untitled Note'}</h3>
                      <span className="text-xs text-muted-foreground">
                        {mounted ? formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.content.substring(0, 100)}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>{allItems.length} results</span>
        </div>
      </div>
    </div>
  );
}