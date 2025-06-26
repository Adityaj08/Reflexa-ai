import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EmotionCount } from '@/types/journal';
import { TimeRange } from './TimeRangeSelector';
import { getEmotionColor } from '@/utils/emotionUtils';
import { useTheme } from '@/store/ThemeContext';

export interface EmotionProgressBarsProps {
  data: EmotionCount[];
  title: string;
  timeRange: TimeRange;
}

export default function EmotionProgressBars({ data, title, timeRange }: EmotionProgressBarsProps) {
  const { theme } = useTheme();

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardDark }]}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No data available for this time period
          </Text>
        </View>
      </View>
    );
  }

  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <View style={[styles.container, { backgroundColor: theme.cardDark }]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {data.map((item) => {
        const percentage = (item.count / maxCount) * 100;
        const barColor = getEmotionColor(item.emotion);
        
        return (
          <View key={item.emotion} style={styles.barContainer}>
            <Text style={[styles.label, { color: theme.text }]}>{item.emotion}</Text>
            <View style={[styles.barWrapper, { backgroundColor: theme.background }]}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${percentage}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
              <Text style={[styles.count, { color: theme.text }]}>{item.count}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  barContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  barWrapper: {
    height: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
}); 