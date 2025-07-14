'use client';

import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/note';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

const NOTES_KEY = 'notes';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize localforage
  useEffect(() => {
    localforage.config({
      name: 'NotesApp',
      storeName: 'notes',
      description: 'Notes storage for the note-taking app',
    });
  }, []);

  // Load notes from IndexedDB
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await localforage.getItem<Note[]>(NOTES_KEY);
        if (storedNotes) {
          // Filter out expired notes
          const validNotes = storedNotes.map(note => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            expiresAt: note.expiresAt ? new Date(note.expiresAt) : null,
          })).filter(note => {
            if (!note.expiresAt) return true;
            return note.expiresAt > new Date();
          });
          setNotes(validNotes);
          
          // Update storage if any notes were filtered out
          if (validNotes.length !== storedNotes.length) {
            await localforage.setItem(NOTES_KEY, validNotes);
          }
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  // Save notes to IndexedDB
  const saveNotes = useCallback(async (notesToSave: Note[]) => {
    try {
      await localforage.setItem(NOTES_KEY, notesToSave);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }, []);

  // Auto-cleanup expired notes
  useEffect(() => {
    const interval = setInterval(async () => {
      const validNotes = notes.filter(note => {
        if (!note.expiresAt) return true;
        return note.expiresAt > new Date();
      });
      
      if (validNotes.length !== notes.length) {
        setNotes(validNotes);
        await saveNotes(validNotes);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [notes, saveNotes]);

  const createNote = useCallback((): Note => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPermanent: true,
      wordCount: 0,
      charCount: 0,
      hasCode: false,
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    return newNote;
  }, [notes, saveNotes]);

  const updateNote = useCallback((updatedNote: Note) => {
    // Calculate stats
    const words = updatedNote.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = updatedNote.content.length;
    const hasCode = updatedNote.content.includes('```');
    
    const noteWithStats = {
      ...updatedNote,
      updatedAt: new Date(),
      wordCount: words,
      charCount: chars,
      hasCode,
    };
    
    const updatedNotes = notes.map(note =>
      note.id === updatedNote.id ? noteWithStats : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  const deleteNote = useCallback((noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  const searchNotes = useCallback((query: string, tag?: string | null) => {
    return notes.filter(note => {
      const matchesQuery = !query || 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase());
      
      const matchesTag = !tag || (note.tags && note.tags.includes(tag));
      
      return matchesQuery && matchesTag;
    });
  }, [notes]);

  const getAllTags = useCallback(() => {
    return Array.from(new Set(notes.flatMap(note => note.tags || [])));
  }, [notes]);
  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    getAllTags,
  };
}