import { JournalEntry, EmotionCount } from '@/types/journal';
import { TimeRange } from '@/components/TimeRangeSelector';

export const getEmotionColor = (emotion: string): string => {
  switch (emotion.toLowerCase()) {
    case 'joy':
      return '#FFD700';
    case 'sadness':
      return '#4169E1';
    case 'anger':
      return '#FF4500';
    case 'fear':
      return '#800080';
    case 'surprise':
      return '#32CD32';
    case 'love':
      return '#FF69B4';
    default:
      return '#808080';
  }
};

export const getEmotionCounts = (entries: JournalEntry[], timeRange: TimeRange): EmotionCount[] => {
  const now = new Date();
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    switch (timeRange) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        return entryDate >= weekStart;
      case 'month':
        const monthStart = new Date(now);
        monthStart.setMonth(now.getMonth() - 1);
        return entryDate >= monthStart;
      case 'year':
        const yearStart = new Date(now);
        yearStart.setFullYear(now.getFullYear() - 1);
        return entryDate >= yearStart;
    }
  });

  const emotionCounts: { [key: string]: number } = {};
  filteredEntries.forEach(entry => {
    if (!emotionCounts[entry.emotion]) {
      emotionCounts[entry.emotion] = 0;
    }
    emotionCounts[entry.emotion]++;
  });

  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion,
    count,
  }));
}; 