export interface MoodCheckIn {
  id: string;
  mood: number;
  emoji: string;
  label: string;
  note?: string;
  date: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  type: 'birthday' | 'anniversary' | 'memorial' | 'custom';
  note?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  type: 'quote' | 'resource' | 'story';
  sourceId: string;
  title: string;
  preview: string;
  savedAt: string;
}

export interface CommunityPost {
  id: string;
  message: string;
  emoji: string;
  createdAt: string;
  hearts: number;
  isOwn: boolean;
}

export const MOOD_LEVELS: { value: number; emoji: string; label: string; color: string }[] = [
  { value: 1, emoji: '😔', label: 'Struggling', color: '#7B8794' },
  { value: 2, emoji: '😢', label: 'Sad', color: '#8FA3B0' },
  { value: 3, emoji: '😐', label: 'Getting by', color: '#B8A88A' },
  { value: 4, emoji: '🙂', label: 'Okay', color: '#D4A574' },
  { value: 5, emoji: '😊', label: 'Good today', color: '#6BAF7B' },
];

export const MILESTONE_TYPES: { key: Milestone['type']; label: string; emoji: string }[] = [
  { key: 'birthday', label: 'Birthday', emoji: '🎂' },
  { key: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { key: 'memorial', label: 'Memorial', emoji: '🕯️' },
  { key: 'custom', label: 'Custom', emoji: '📌' },
];
