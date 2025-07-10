import { EmotionResult } from '@/services/emotionAnalysis';

export interface JournalEntry {
  id: string;
  content: string;
  additionalContent?: string;
  date: string; 
  emotion: string; // Primary emotion
  emotions: EmotionResult[]; // All detected emotions with confidence scores
  image?: string | null;
  isPrivate?: boolean;
}

export interface EmotionCount {
  emotion: string;
  count: number;
}

export interface WeeklyEmotions {
  startDate: string; 
  endDate: string; 
  counts: EmotionCount[];
}

export interface MonthlyEmotions {
  month: string; 
  counts: EmotionCount[];
}