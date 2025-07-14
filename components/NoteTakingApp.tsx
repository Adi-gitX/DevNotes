'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { NoteEditor } from './NoteEditor';
import { MacOSTopBar } from './MacOSTopBar';
import { CommandPalette } from './CommandPalette';
import { QuickCapture } from './QuickCapture';
import { useNotes } from '@/hooks/useNotes';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Note } from '@/types/note';

export function NoteTakingApp() {
  const { notes, loading, createNote, updateNote, deleteNote, searchNotes } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredNotes = searchNotes(searchQuery, selectedTag);

  useEffect(() => {
    if (!loading && notes.length > 0 && !selectedNote) {
      setSelectedNote(notes[0]);
    }
  }, [notes, selectedNote, loading]);

  const handleCreateNote = () => {
    const newNote = createNote();
    setSelectedNote(newNote);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    updateNote(updatedNote);
    setSelectedNote(updatedNote);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    if (selectedNote?.id === noteId) {
      const remainingNotes = notes.filter(n => n.id !== noteId);
      setSelectedNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
    }
  };

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const handleOpenQuickCapture = useCallback(() => {
    setQuickCaptureOpen(true);
  }, []);

  useKeyboardShortcuts({
    onNewNote: handleCreateNote,
    onSearch: () => setCommandPaletteOpen(true),
    onQuickCapture: handleOpenQuickCapture,
    onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
    onToggleFullscreen: handleToggleFullscreen,
  });

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading DevNotes...</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`h-screen bg-background flex flex-col overflow-hidden ${isFullscreen ? 'fullscreen' : ''}`}>
      {!isFullscreen && <MacOSTopBar />}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          notes={filteredNotes}
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isFullscreen={isFullscreen}
        />
        <div className="flex-1 overflow-hidden relative">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Welcome to DevNotes</h2>
                <p className="mb-4">The ultimate developer note-taking app</p>
                <p className="text-sm mb-4">Create your first note to get started</p>
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Create Note
                </button>
                <div className="mt-6 text-xs text-muted-foreground">
                  <p>💡 Pro tip: Use Cmd/Ctrl + N to create a new note</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={handleSelectNote}
        onCreateNote={handleCreateNote}
      />
      
      <QuickCapture
        isOpen={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onCreateNote={(title, content, tags) => {
          const note = createNote();
          const updatedNote = {
            ...note,
            title,
            content,
            tags: tags || [],
          };
          updateNote(updatedNote);
          setSelectedNote(updatedNote);
        }}
      />
    </div>
  );
}