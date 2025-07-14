'use client';

import { useEffect } from 'react';

interface KeyboardShortcuts {
  onNewNote: () => void;
  onSearch: () => void;
  onQuickCapture: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
}

export function useKeyboardShortcuts({
  onNewNote,
  onSearch,
  onQuickCapture,
  onToggleSidebar,
  onToggleFullscreen,
}: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + N - New note
      if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        onNewNote();
      }

      // Cmd/Ctrl + K - Search/Command palette
      if (cmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        onSearch();
      }

      // Cmd/Ctrl + Shift + N - Quick capture
      if (cmdOrCtrl && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        onQuickCapture();
      }

      // Cmd/Ctrl + B - Toggle sidebar
      if (cmdOrCtrl && e.key === 'b') {
        e.preventDefault();
        onToggleSidebar();
      }

      // Cmd/Ctrl + Shift + F - Toggle fullscreen
      if (cmdOrCtrl && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        onToggleFullscreen();
      }

      // F11 - Toggle fullscreen (alternative)
      if (e.key === 'F11') {
        e.preventDefault();
        onToggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewNote, onSearch, onQuickCapture, onToggleSidebar, onToggleFullscreen]);
}