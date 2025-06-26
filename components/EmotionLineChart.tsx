import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { EmotionCount } from '../types/journal';
import { TimeRange } from './TimeRangeSelector';
import { getEmotionColor } from '../utils/emotionUtils';
import { useTheme } from '@/store/ThemeContext';

export interface EmotionLineChartProps {
  data: EmotionCount[];
  title: string;
  timeRange: TimeRange;
}

export default function EmotionLineChart({ data, title, timeRange }: EmotionLineChartProps) {
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

  const chartData = {
    labels: data.map(item => item.emotion),
    datasets: [
      {
        data: data.map(item => item.count),
        color: (opacity = 1) => getEmotionColor(data[0]?.emotion || ''),
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: theme.cardDark,
    backgroundGradientTo: theme.cardDark,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.cardDark,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardDark }]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero
        />
      </View>
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
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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