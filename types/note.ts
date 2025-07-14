export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
  isPermanent: boolean;
  language?: string;
  wordCount?: number;
  charCount?: number;
  hasCode?: boolean;
}