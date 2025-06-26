import { JournalEntry } from '@/store/journalStore';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, format } from 'date-fns';

export type TimeRange = 'weekly' | 'monthly' | 'yearly';

interface EmotionCount {
  emotion: string;
  count: number;
}

interface LineChartData {
  date: string;
  [key: string]: number | string;
}

export const getEmotionCounts = (entries: JournalEntry[], timeRange: TimeRange): EmotionCount[] => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (timeRange) {
    case 'weekly':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
  }

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  const emotionCounts: { [key: string]: number } = {};
  filteredEntries.forEach(entry => {
    const emotion = entry.userCorrectedEmotion || entry.emotion;
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });

  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    count
  }));
};

export const getEmotionTrends = (entries: JournalEntry[], timeRange: TimeRange): LineChartData[] => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let dateFormat: string;

  switch (timeRange) {
    case 'weekly':
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
      dateFormat = 'EEE';
      break;
    case 'monthly':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      dateFormat = 'MMM d';
      break;
    case 'yearly':
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      dateFormat = 'MMM';
      break;
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const emotionsByDay: { [key: string]: { [key: string]: number } } = {};
  const allEmotions = new Set<string>();

  // Initialize all days with zero counts
  days.forEach(day => {
    emotionsByDay[format(day, dateFormat)] = {};
  });

  // Count emotions for each day
  entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    if (entryDate >= startDate && entryDate <= endDate) {
      const emotion = entry.userCorrectedEmotion || entry.emotion;
      const dayKey = format(entryDate, dateFormat);
      allEmotions.add(emotion);
      emotionsByDay[dayKey][emotion] = (emotionsByDay[dayKey][emotion] || 0) + 1;
    }
  });

  // Convert to line chart data format
  return days.map(day => {
    const dayKey = format(day, dateFormat);
    const data: LineChartData = { date: dayKey };
    allEmotions.forEach(emotion => {
      data[emotion] = emotionsByDay[dayKey][emotion] || 0;
    });
    return data;
  });
}; 