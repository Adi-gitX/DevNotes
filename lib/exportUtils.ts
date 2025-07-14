import { Note } from '@/types/note';

export function exportNoteToMarkdown(note: Note): void {
  const markdown = generateMarkdown(note);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(note.title || 'Untitled Note').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateMarkdown(note: Note): string {
  let markdown = `# ${note.title || 'Untitled Note'}\n\n`;
  
  if (note.tags && note.tags.length > 0) {
    markdown += `**Tags:** ${note.tags.map(tag => `#${tag}`).join(', ')}\n\n`;
  }
  
  const createdAt = note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt);
  const updatedAt = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt);
  
  markdown += `**Created:** ${createdAt.toLocaleDateString()}\n`;
  markdown += `**Modified:** ${updatedAt.toLocaleDateString()}\n`;
  
  if (note.wordCount) {
    markdown += `**Word Count:** ${note.wordCount}\n`;
  }
  
  if (note.charCount) {
    markdown += `**Character Count:** ${note.charCount}\n`;
  }
  
  if (note.expiresAt) {
    const expiresAt = note.expiresAt instanceof Date ? note.expiresAt : new Date(note.expiresAt);
    markdown += `**Expires:** ${expiresAt.toLocaleDateString()}\n`;
  }
  
  markdown += '\n';
  markdown += '---\n\n';
  markdown += note.content;
  
  markdown += '\n\n---\n';
  markdown += `*Exported from DevNotes on ${new Date().toLocaleDateString()}*`;
  
  return markdown;
}