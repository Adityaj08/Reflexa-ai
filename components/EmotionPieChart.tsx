import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { EmotionCount } from '../types/journal';
import { TimeRange } from './TimeRangeSelector';
import { getEmotionColor } from '../utils/emotionUtils';
import { useTheme } from '@/store/ThemeContext';

export interface EmotionPieChartProps {
  data: EmotionCount[];
  title: string;
  timeRange: TimeRange;
}

export default function EmotionPieChart({ data, title, timeRange }: EmotionPieChartProps) {
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

  const chartData = data.map(item => ({
    name: item.emotion,
    count: item.count,
    color: getEmotionColor(item.emotion),
    legendFontColor: theme.text,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundGradientFrom: theme.cardDark,
    backgroundGradientTo: theme.cardDark,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardDark }]}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={Dimensions.get('window').width - 64}
          height={240}
          chartConfig={chartConfig}
          accessor="count"
          backgroundColor="transparent"
          paddingLeft="25"
          center={[0, 0]}
          absolute
          hasLegend={true}
          style={styles.chart}
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
    paddingBottom: 20,
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