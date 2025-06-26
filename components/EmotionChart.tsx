import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { EmotionCount } from '@/types/journal';
import { getEmotionById } from '@/constants/emotions';
import colors from '@/constants/colors';

interface EmotionChartProps {
  data: EmotionCount[];
  title: string;
}

const { width } = Dimensions.get('window');
const BAR_HEIGHT = 24;
const CHART_WIDTH = width - 64; // Accounting for padding

export default function EmotionChart({ data, title }: EmotionChartProps) {
  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Find the max count for scaling
  const maxCount = Math.max(...data.map(item => item.count), 1);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {sortedData.length > 0 ? (
        <View style={styles.chartContainer}>
          {sortedData.map((item) => {
            const emotion = getEmotionById(item.emotion);
            const percentage = Math.round((item.count / total) * 100);
            const barWidth = (item.count / maxCount) * CHART_WIDTH;
            
            return (
              <View key={item.emotion} style={styles.barContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.emotionName}>{emotion.name}</Text>
                  <Text style={styles.percentage}>{percentage}%</Text>
                </View>
                
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        width: barWidth,
                        backgroundColor: emotion.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  barContainer: {
    gap: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emotionName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  percentage: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  barBackground: {
    height: BAR_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 12,
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});