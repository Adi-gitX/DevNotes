'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Wifi, Battery, Volume2 } from 'lucide-react';

export function MacOSTopBar() {
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-8 bg-background border-b border-border flex items-center justify-between px-4 select-none">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer"></div>
      </div>
      
      <div className="flex items-center space-x-4">
        <h1 className="text-sm font-medium text-foreground">DevNotes</h1>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Wifi className="w-3 h-3" />
          <Volume2 className="w-3 h-3" />
          <Battery className="w-3 h-3" />
          <span className="font-mono">
            {mounted && currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </span>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1 rounded-md hover:bg-accent transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}