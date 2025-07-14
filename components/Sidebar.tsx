'use client';

import React, { useState } from 'react';
import { Search, Plus, Hash, Calendar, Clock, MoreVertical, Download, Trash2, Copy } from 'lucide-react';
import { Note } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { exportNoteToMarkdown } from '@/lib/exportUtils';

interface SidebarProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  isFullscreen?: boolean;
}

export function Sidebar({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  isOpen,
  onToggle,
  isFullscreen = false,
}: SidebarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const allTags = Array.from(
    new Set(notes.flatMap(note => note.tags || []))
  );

  const getExpirationText = (note: Note) => {
    if (!note.expiresAt) return 'Permanent';
    const now = new Date();
    const expiry = note.expiresAt instanceof Date ? note.expiresAt : new Date(note.expiresAt);
    if (expiry < now) return 'Expired';
    return `Expires ${formatDistanceToNow(expiry, { addSuffix: true })}`;
  };

  const handleExport = (note: Note) => {
    exportNoteToMarkdown(note);
    setActiveDropdown(null);
  };

  const handleDelete = (noteId: string) => {
    onDeleteNote(noteId);
    setActiveDropdown(null);
  };

  const handleCopy = async (note: Note) => {
    try {
      await navigator.clipboard.writeText(note.content);
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to copy note content:', err);
    }
  };
  if (!isOpen) {
    return (
      <div className={`w-12 bg-muted/30 border-r border-border flex flex-col items-center py-4 ${isFullscreen ? 'hidden' : ''}`}>
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-accent transition-colors"
        >
          <Hash className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`w-80 bg-muted/30 border-r border-border flex flex-col ${isFullscreen ? 'hidden' : ''}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">DevNotes</h2>
          <button
            onClick={onCreateNote}
            className="p-2 rounded-md hover:bg-accent transition-colors"
            title="Create new note (Cmd/Ctrl + N)"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTagChange(null)}
            className={cn(
              'px-3 py-1 rounded-full text-sm transition-colors',
              selectedTag === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-accent'
            )}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={cn(
                'px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1',
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent'
              )}
            >
              <Hash className="w-3 h-3" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>No notes found</p>
            <p className="text-xs mt-2">Press Cmd/Ctrl + N to create your first note</p>
          </div>
        ) : (
          <div className="p-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-colors mb-2 group relative',
                  selectedNote?.id === note.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-accent'
                )}
                onClick={() => onSelectNote(note)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate mb-1">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {note.content.substring(0, 100)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {mounted ? formatDistanceToNow(note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt), { addSuffix: true }) : 'Recently'}
                      {note.hasCode && (
                        <span className="px-1 py-0.5 bg-primary/10 text-primary rounded text-xs">CODE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      {mounted ? getExpirationText(note) : 'Loading...'}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === note.id ? null : note.id);
                      }}
                      className="p-1 rounded-md hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeDropdown === note.id && (
                      <div className="absolute right-0 top-6 bg-popover border border-border rounded-md shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(note);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(note);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(note.id);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}