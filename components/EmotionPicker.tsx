import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { emotionsList } from '@/constants/emotions';
import colors from '@/constants/colors';
import EmotionBadge from './EmotionBadge';

interface EmotionPickerProps {
  selectedEmotion: string;
  onSelectEmotion: (emotionId: string) => void;
  onConfirm?: () => void;
  title?: string;
}

export default function EmotionPicker({ 
  selectedEmotion, 
  onSelectEmotion,
  onConfirm,
  title = "Correct emotion?"
}: EmotionPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.emotionsContainer}
      >
        {emotionsList.map((emotion) => (
          <Pressable
            key={emotion.id}
            style={[
              styles.emotionButton,
              selectedEmotion === emotion.id && { 
                borderColor: emotion.color,
                backgroundColor: `${emotion.color}20`
              }
            ]}
            onPress={() => {
              onSelectEmotion(emotion.id);
              if (onConfirm) {
                onConfirm();
              }
            }}
          >
            <EmotionBadge emotionId={emotion.id} />
            <Text style={[styles.description, { color: emotion.color }]}>
              {emotion.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  emotionsContainer: {
    paddingVertical: 8,
    gap: 12,
    paddingRight: 24,
  },
  emotionButton: {
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    width: 140,
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
});