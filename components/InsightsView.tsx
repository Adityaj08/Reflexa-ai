import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useJournalStore } from '@/store/journalStore';
import { getEmotionCounts } from '../utils/emotionUtils';
import colors from '@/constants/colors';
import StreakCard from './StreakCard';
import ChartStyleSelector, { ChartStyle } from './ChartStyleSelector';
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector';
import EmotionBarChart from './EmotionBarChart';
import EmotionPieChart from './EmotionPieChart';
import EmotionProgressBars from './EmotionProgressBars';
import EmotionLineChart from './EmotionLineChart';
import { useTheme } from '@/store/ThemeContext';

export default function InsightsView() {
  const { entries } = useJournalStore();
  const [chartStyle, setChartStyle] = useState<ChartStyle>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('year');
  const { theme } = useTheme();

  // Calculate streaks
  const currentStreak = useJournalStore(state => state.currentStreak);
  const longestStreak = useJournalStore(state => state.longestStreak);
  const totalEntries = entries.length;

  const emotionData = useMemo(() => {
    return getEmotionCounts(entries, timeRange);
  }, [entries, timeRange]);

  const getTimeRangeTitle = (range: TimeRange) => {
    switch (range) {
      case 'week':
        return "This Week's Emotions";
      case 'month':
        return "This Month's Emotions";
      case 'year':
        return "This Year's Emotions";
    }
  };

  const renderChart = () => {
    const title = getTimeRangeTitle(timeRange);
    
    switch (chartStyle) {
      case 'line':
        return <EmotionLineChart data={emotionData} title={title} timeRange={timeRange} />;
      case 'bar':
        return <EmotionBarChart data={emotionData} title={title} timeRange={timeRange} />;
      case 'pie':
        return <EmotionPieChart data={emotionData} title={title} timeRange={timeRange} />;
      case 'progress':
        return <EmotionProgressBars data={emotionData} title={title} timeRange={timeRange} />;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Insights</Text>

      <StreakCard
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        totalEntries={totalEntries}
      />

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownWrapper}>
              <Text style={[styles.dropdownLabel, { color: theme.text }]}>Time Range</Text>
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </View>
            <View style={styles.dropdownWrapper}>
              <Text style={[styles.dropdownLabel, { color: theme.text }]}>Chart Type</Text>
              <ChartStyleSelector value={chartStyle} onChange={setChartStyle} />
            </View>
          </View>
        </View>
        {renderChart()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  chartContainer: {
    marginTop: 16,
  },
  chartHeader: {
    marginBottom: 16,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
}); 