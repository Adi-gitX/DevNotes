'use client';

import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

interface CodeBlockRendererProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlockRenderer({ code, language = 'text', className = '' }: CodeBlockRendererProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted border border-border rounded-t-lg">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{language}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre className="bg-background border border-t-0 border-border rounded-b-lg p-4 overflow-x-auto">
        <code className={`language-${language} text-sm`}>
          {code}
        </code>
      </pre>
    </div>
  );
}