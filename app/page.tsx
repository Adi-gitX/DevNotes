'use client';

import { NoteTakingApp } from '@/components/NoteTakingApp';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function Home() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NoteTakingApp />
    </ThemeProvider>
  );
}