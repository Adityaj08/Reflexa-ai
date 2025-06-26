import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import { EmotionCount } from '@/types/journal';

interface EmotionProgressListProps {
  data: EmotionCount[];
  title: string;
}

export default function EmotionProgressList({ data, title }: EmotionProgressListProps) {
  // Find the maximum count to calculate percentages
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {data.map((item) => (
        <View key={item.emotion} style={styles.emotionRow}>
          <Text style={styles.emotionLabel}>{item.emotion}</Text>
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: getEmotionColor(item.emotion)
                }
              ]} 
            />
          </View>
          <Text style={styles.countLabel}>{item.count}</Text>
        </View>
      ))}
    </View>
  );
}

const getEmotionColor = (emotion: string): string => {
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

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionLabel: {
    width: 100,
    color: colors.text,
    fontSize: 16,
  },
  progressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.card,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  countLabel: {
    width: 40,
    color: colors.text,
    fontSize: 16,
    textAlign: 'right',
  },
}); 