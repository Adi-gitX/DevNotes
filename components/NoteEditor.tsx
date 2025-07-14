'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from '@/types/note';
import { Calendar, Clock, Hash, Save, Download, Maximize2, Minimize2, Copy, Check, Brain, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { detectAndHighlightCode, processCodeKeywords, formatCodeBlock } from '@/lib/codeDetection';
import { exportNoteToMarkdown } from '@/lib/exportUtils';
import { AIAssistant } from './AIAssistant';

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function NoteEditor({ 
  note, 
  onUpdateNote, 
  isFullscreen = false, 
  onToggleFullscreen 
}: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags?.join(', ') || '');
  const [expiryDuration, setExpiryDuration] = useState<string>('permanent');
  const [lastSaved, setLastSaved] = useState<Date>(new Date(note.updatedAt));
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags?.join(', ') || '');
    setLastSaved(new Date(note.updatedAt));
  }, [note]);

  const autoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      setIsAutoSaving(true);
      const updatedNote: Note = {
        ...note,
        title: title || 'Untitled Note',
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      onUpdateNote(updatedNote);
      setLastSaved(new Date());
      setIsAutoSaving(false);
    }, 1000);
  }, [note, title, content, tags, onUpdateNote]);

  useEffect(() => {
    autoSave();
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, content, tags, autoSave]);

  const handleExpiryChange = (duration: string) => {
    setExpiryDuration(duration);
    
    let expiresAt: Date | null = null;
    if (duration !== 'permanent') {
      const now = new Date();
      switch (duration) {
        case '1h':
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case '2h':
          expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          break;
        case '5h':
          expiresAt = new Date(now.getTime() + 5 * 60 * 60 * 1000);
          break;
        case '1d':
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case '3d':
          expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
          break;
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '14d':
          expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    const updatedNote: Note = {
      ...note,
      expiresAt,
    };
    onUpdateNote(updatedNote);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Check for code keywords in the current line
    const lines = content.split('\n');
    const currentLineIndex = content.substring(0, start).split('\n').length - 1;
    const currentLine = lines[currentLineIndex] || '';
    
    if (processCodeKeywords(currentLine) || detectAndHighlightCode(pastedText)) {
      e.preventDefault();
      const language = detectLanguageFromCode(pastedText);
      const wrappedCode = formatCodeBlock(pastedText, language);
      
      // If current line has code keyword, replace the line
      if (processCodeKeywords(currentLine)) {
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = content.indexOf('\n', start);
        const actualLineEnd = lineEnd === -1 ? content.length : lineEnd;
        const newContent = content.substring(0, lineStart) + wrappedCode + content.substring(actualLineEnd);
        setContent(newContent);
      } else {
        const newContent = content.substring(0, start) + wrappedCode + content.substring(end);
        setContent(newContent);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    
    // Handle Enter for smart line breaks
    if (e.key === 'Enter') {
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const lines = content.substring(0, start).split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Auto-indent for lists and code blocks
      const listMatch = currentLine.match(/^(\s*[-*+]\s)/);
      const codeMatch = currentLine.match(/^(\s+)/);
      
      if (listMatch) {
        e.preventDefault();
        const indent = listMatch[1];
        const newContent = content.substring(0, start) + '\n' + indent + content.substring(start);
        setContent(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        }, 0);
      } else if (codeMatch && currentLine.trim()) {
        e.preventDefault();
        const indent = codeMatch[1];
        const newContent = content.substring(0, start) + '\n' + indent + content.substring(start);
        setContent(newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        }, 0);
      }
    }
  };

  const detectLanguageFromCode = (code: string): string => {
    if (code.includes('function') || code.includes('const') || code.includes('let')) return 'javascript';
    if (code.includes('def ') || code.includes('import ')) return 'python';
    if (code.includes('<') && code.includes('>')) return 'html';
    if (code.includes('{') && code.includes('}')) return 'css';
    if (code.includes('SELECT') || code.includes('FROM')) return 'sql';
    return 'text';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getExpirationText = () => {
    if (!note.expiresAt) return 'Permanent';
    const now = new Date();
    const expiry = note.expiresAt instanceof Date ? note.expiresAt : new Date(note.expiresAt);
    if (expiry < now) return 'Expired';
    return `Expires ${formatDistanceToNow(expiry, { addSuffix: true })}`;
  };

  return (
    <div className={`h-full flex flex-col bg-background ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="text-2xl font-bold bg-transparent border-none outline-none flex-1"
          />
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground flex items-center gap-4">
              <span>{note.wordCount || 0} words</span>
              <span>{note.charCount || 0} chars</span>
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              {isAutoSaving ? (
                <>
                  <Save className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mounted ? `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}` : 'Saved'}
                </>
              )}
            </span>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="Copy content"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowAI(!showAI)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="AI Assistant"
            >
              <Brain className="w-5 h-5" />
            </button>
            <button
              onClick={() => exportNoteToMarkdown(note)}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="Export to Markdown"
            >
              <Download className="w-5 h-5" />
            </button>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {mounted ? formatDistanceToNow(note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt), { addSuffix: true }) : 'Recently'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {mounted ? getExpirationText() : 'Loading...'}
            </span>
          </div>
          {note.hasCode && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Contains Code</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Add tags (comma separated)"
              className="bg-background border border-border rounded px-3 py-1 text-sm"
            />
          </div>
          <select
            value={expiryDuration}
            onChange={(e) => handleExpiryChange(e.target.value)}
            className="bg-background border border-border rounded px-3 py-1 text-sm"
          >
            <option value="permanent">Permanent</option>
            <option value="1h">1 Hour</option>
            <option value="2h">2 Hours</option>
            <option value="5h">5 Hours</option>
            <option value="1d">1 Day</option>
            <option value="3d">3 Days</option>
            <option value="7d">7 Days</option>
            <option value="14d">14 Days</option>
            <option value="30d">30 Days</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <div className="mb-4 text-sm text-muted-foreground">
            <p>💡 <strong>Pro Tips:</strong></p>
            <p>• Type <code>#code</code>, <code>#js</code>, <code>#python</code>, etc. and paste code for auto-formatting</p>
            <p>• Use <code>Cmd/Ctrl + K</code> for command palette, <code>Cmd/Ctrl + N</code> for new note</p>
            <p>• Tab for indentation, smart Enter for lists and code blocks</p>
          </div>
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="Start writing your note... Use #code, #js, #python, etc. before pasting code for auto-formatting!"
            className="w-full h-full bg-transparent border-none outline-none resize-none text-base leading-relaxed font-mono"
            style={{ minHeight: 'calc(100% - 120px)' }}
          />
        </div>
        
        {showAI && (
          <div className="w-80 border-l border-border">
            <AIAssistant 
              noteContent={content}
              onSuggestion={(suggestion) => setContent(content + '\n\n' + suggestion)}
              onClose={() => setShowAI(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}