'use client';

import React, { useState } from 'react';
import { Brain, Send, Lightbulb, Code, FileText, X } from 'lucide-react';

interface AIAssistantProps {
  noteContent: string;
  onSuggestion: (suggestion: string) => void;
  onClose: () => void;
}

export function AIAssistant({ noteContent, onSuggestion, onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestions = [
    {
      icon: Lightbulb,
      title: 'Improve Writing',
      description: 'Make this text clearer and more concise',
      prompt: 'Please improve the writing style and clarity of this text:'
    },
    {
      icon: Code,
      title: 'Explain Code',
      description: 'Add comments and explanations to code',
      prompt: 'Please add detailed comments and explanations to this code:'
    },
    {
      icon: FileText,
      title: 'Summarize',
      description: 'Create a summary of the main points',
      prompt: 'Please create a concise summary of the main points in this text:'
    },
  ];

  const handleSuggestion = (suggestionPrompt: string) => {
    // Simulate AI response (in a real app, this would call an AI API)
    setIsLoading(true);
    setTimeout(() => {
      const responses = {
        'Please improve the writing style and clarity of this text:': 
          '✨ **Improved Version:**\n\nHere\'s a clearer and more concise version of your text with better flow and structure.',
        'Please add detailed comments and explanations to this code:':
          '💻 **Code Explanation:**\n\n```javascript\n// This function demonstrates best practices\n// with detailed comments explaining each step\n```',
        'Please create a concise summary of the main points in this text:':
          '📝 **Summary:**\n\n• Key point 1: Main concept explained\n• Key point 2: Supporting details\n• Key point 3: Conclusion and next steps'
      };
      
      const response = responses[suggestionPrompt as keyof typeof responses] || 
        '🤖 **AI Suggestion:**\n\nHere\'s an AI-generated suggestion based on your content.';
      
      onSuggestion(response);
      setIsLoading(false);
    }, 1500);
  };

  const handleCustomPrompt = () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      onSuggestion(`🤖 **AI Response to "${prompt}":**\n\nThis is a simulated AI response. In a real implementation, this would connect to an AI service like OpenAI GPT or Claude.`);
      setPrompt('');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestion(suggestion.prompt)}
              disabled={isLoading}
              className="w-full p-3 text-left bg-background border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <suggestion.icon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Custom Request</h4>
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI anything about your note..."
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <button
              onClick={handleCustomPrompt}
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
        
        {noteContent && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Current Note Preview</h4>
            <div className="p-3 bg-background border border-border rounded-lg text-xs text-muted-foreground max-h-32 overflow-y-auto">
              {noteContent.substring(0, 200)}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}