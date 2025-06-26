import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmotionCount, WeeklyEmotions, MonthlyEmotions } from '@/types/journal';
import { getMonthKey, isInCurrentWeek, getWeekRange } from '@/utils/dateUtils';

export interface JournalEntry {
  id: string;
  content: string;
  date: string;
  emotion: string;
  confidence: number;
  image?: string | null;
  userCorrectedEmotion?: string;
  isBookmarked?: boolean;
  isPrivate?: boolean;
}

interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Cached data
  weeklyEmotions: WeeklyEmotions;
  monthlyEmotions: MonthlyEmotions[];
  currentStreak: number;
  longestStreak: number;
  
  // Actions
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  correctEmotion: (id: string, emotion: string) => void;
  toggleBookmark: (id: string) => void;
  togglePrivate: (id: string) => void;
  
  // Selectors
  getEntryById: (id: string) => JournalEntry | undefined;
  getEntriesByDate: (date: string) => JournalEntry[];
  getTotalEntries: () => number;
  getBookmarkedEntries: () => JournalEntry[];
}

// Helper functions to calculate stats
const calculateWeeklyEmotions = (entries: JournalEntry[]): WeeklyEmotions => {
  const now = new Date();
  const { start, end } = getWeekRange(now);
  const weeklyEmotions: EmotionCount[] = [];
  
  const weekEntries = entries.filter((entry) => 
    isInCurrentWeek(entry.date)
  );
  
  // Count emotions
  weekEntries.forEach((entry) => {
    const emotion = entry.userCorrectedEmotion || entry.emotion;
    const existingEmotion = weeklyEmotions.find((e) => e.emotion === emotion);
    
    if (existingEmotion) {
      existingEmotion.count += 1;
    } else {
      weeklyEmotions.push({ emotion, count: 1 });
    }
  });
  
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    counts: weeklyEmotions
  };
};

const calculateMonthlyEmotions = (entries: JournalEntry[]): MonthlyEmotions[] => {
  const monthlyData: Record<string, EmotionCount[]> = {};
  
  entries.forEach((entry) => {
    const monthKey = getMonthKey(entry.date);
    const emotion = entry.userCorrectedEmotion || entry.emotion;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = [];
    }
    
    const existingEmotion = monthlyData[monthKey].find((e) => e.emotion === emotion);
    
    if (existingEmotion) {
      existingEmotion.count += 1;
    } else {
      monthlyData[monthKey].push({ emotion, count: 1 });
    }
  });
  
  return Object.entries(monthlyData).map(([month, counts]) => ({
    month,
    counts
  }));
};

const calculateCurrentStreak = (entries: JournalEntry[]): number => {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  if (sortedEntries.length === 0) return 0;
  
  let streak = 1;
  let currentDate = new Date(sortedEntries[0].date);
  const today = new Date();
  
  // Check if the most recent entry is from today or yesterday
  const dayDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff > 1) return 0;
  
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i].date);
    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return streak;
};

const calculateLongestStreak = (entries: JournalEntry[]): number => {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  if (sortedEntries.length === 0) return 0;
  
  let longestStreak = 1;
  let currentStreak = 1;
  let currentDate = new Date(sortedEntries[0].date);
  
  for (let i = 1; i < sortedEntries.length; i++) {
    const nextDate = new Date(sortedEntries[i].date);
    const diffDays = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
    
    currentDate = nextDate;
  }
  
  return longestStreak;
};

// Update all stats based on current entries
const updateStats = (entries: JournalEntry[]) => ({
  weeklyEmotions: calculateWeeklyEmotions(entries),
  monthlyEmotions: calculateMonthlyEmotions(entries),
  currentStreak: calculateCurrentStreak(entries),
  longestStreak: calculateLongestStreak(entries)
});

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,
      weeklyEmotions: { startDate: '', endDate: '', counts: [] },
      monthlyEmotions: [],
      currentStreak: 0,
      longestStreak: 0,
      
      addEntry: (entry) => {
        set((state) => {
          const newEntries = [entry, ...state.entries];
          return {
            entries: newEntries,
            ...updateStats(newEntries)
          };
        });
      },
      
      updateEntry: (id, updates) => {
        set((state) => {
          const newEntries = state.entries.map((entry) => 
            entry.id === id ? { ...entry, ...updates } : entry
          );
          return {
            entries: newEntries,
            ...updateStats(newEntries)
          };
        });
      },
      
      deleteEntry: (id) => {
        set((state) => {
          const newEntries = state.entries.filter((entry) => entry.id !== id);
          return {
            entries: newEntries,
            ...updateStats(newEntries)
          };
        });
      },
      
      correctEmotion: (id, emotion) => {
        set((state) => {
          const newEntries = state.entries.map((entry) => 
            entry.id === id ? { ...entry, userCorrectedEmotion: emotion } : entry
          );
          return {
            entries: newEntries,
            ...updateStats(newEntries)
          };
        });
      },
      
      toggleBookmark: (id) => {
        set((state) => {
          const newEntries = state.entries.map((entry) => 
            entry.id === id ? { ...entry, isBookmarked: !entry.isBookmarked } : entry
          );
          return {
            entries: newEntries,
            ...updateStats(newEntries)
          };
        });
      },

      togglePrivate: (id) => {
        set((state) => {
          const newEntries = state.entries.map((entry) => 
            entry.id === id ? { ...entry, isPrivate: !entry.isPrivate } : entry
          );
          return {
            entries: newEntries,
            ...updateStats(newEntries)
          };
        });
      },
      
      getEntryById: (id) => {
        return get().entries.find((entry) => entry.id === id);
      },
      
      getEntriesByDate: (date) => {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const day = dateObj.getDate();
        
        return get().entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return (
            entryDate.getFullYear() === year &&
            entryDate.getMonth() === month &&
            entryDate.getDate() === day
          );
        });
      },
      
      getTotalEntries: () => {
        return get().entries.length;
      },
      
      getBookmarkedEntries: () => {
        return get().entries.filter((entry) => entry.isBookmarked);
      }
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries
        // We don't persist computed values
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.entries) {
          const stats = updateStats(state.entries);
          // Update the state with calculated stats after rehydration
          state.weeklyEmotions = stats.weeklyEmotions;
          state.monthlyEmotions = stats.monthlyEmotions;
          state.currentStreak = stats.currentStreak;
          state.longestStreak = stats.longestStreak;
        }
      }
    }
  )
);