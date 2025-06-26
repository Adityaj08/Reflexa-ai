export interface JournalEntry {
    id: string;
    content: string;
    date: string; 
    emotion: string; 
    confidence: number; 
    userCorrectedEmotion?: string; 
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