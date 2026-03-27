export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: 'heavy' | 'sad' | 'neutral' | 'hopeful' | 'grateful';
  createdAt: string;
  updatedAt: string;
  isShared: boolean;
  sharedAt?: string;
}

export interface SharedStory {
  id: string;
  journalId: string;
  title: string;
  preview: string;
  content: string;
  mood: 'heavy' | 'sad' | 'neutral' | 'hopeful' | 'grateful';
  sharedAt: string;
  authorAlias: string;
  hearts: number;
  isOwn: boolean;
}

export const MOOD_CONFIG: Record<JournalEntry['mood'], { label: string; emoji: string; color: string }> = {
  heavy: { label: 'Heavy', emoji: '🌧️', color: '#7B8794' },
  sad: { label: 'Sad', emoji: '🌥️', color: '#8FA3B0' },
  neutral: { label: 'Reflective', emoji: '🌤️', color: '#B8A88A' },
  hopeful: { label: 'Hopeful', emoji: '🌅', color: '#D4A574' },
  grateful: { label: 'Grateful', emoji: '🌻', color: '#6BAF7B' },
};
