import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getEmotionById } from '@/constants/emotions';
import { Heart, Smile, Frown, AlertCircle, Zap, MinusCircle, Angry } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

interface EmotionBadgeProps {
  emotionId: string;
  showConfidence?: boolean;
  confidence?: number;
  size?: 'small' | 'medium' | 'large';
}

const EmotionIcon = ({ emotion, size, color }: { emotion: string; size: number; color: string }) => {
  switch (emotion.toLowerCase()) {
    case 'love':
      return <Heart size={size} color={color} />;
    case 'joy':
      return <Smile size={size} color={color} />;
    case 'sadness':
      return <Frown size={size} color={color} />;
    case 'fear':
      return <AlertCircle size={size} color={color} />;
    case 'surprise':
      return <Zap size={size} color={color} />;
    case 'anger':
      return <Angry size={size} color={color} />;
    default:
      return <MinusCircle size={size} color={color} />;
  }
};

export default function EmotionBadge({ 
  emotionId, 
  showConfidence = false, 
  confidence = 0,
  size = 'medium'
}: EmotionBadgeProps) {
  const emotion = getEmotionById(emotionId);
  const { theme } = useTheme();

  if (!emotion) return null;

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const containerStyle = [
    styles.container,
    size === 'small' && styles.containerSmall,
    size === 'large' && styles.containerLarge,
    { backgroundColor: 'transparent' }
  ];

  const textStyle = [
    styles.text,
    size === 'small' && styles.textSmall,
    size === 'large' && styles.textLarge,
    { color: emotion.color }
  ];

  // Progress bar width (0-100%)
  const progress = Math.max(0, Math.min(confidence, 100));

  return (
    <View style={containerStyle}>
      {/* Progress Bar Background */}
      <View style={styles.progressBarBg}>
        <View style={[
          styles.progressBarFill,
          {
            width: `${progress}%`,
            backgroundColor: emotion.color,
            opacity: 0.25
          }
        ]} />
      </View>
      {/* Content on top of progress bar */}
      <View style={styles.contentRow}>
      <EmotionIcon 
        emotion={emotion.id} 
        size={getIconSize()} 
        color={emotion.color} 
      />
      <Text style={textStyle}>{emotion.name}</Text>
      {showConfidence && emotion.id !== 'neutral' && (
        <Text style={[textStyle, styles.confidence]}>
          {confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence)}%
        </Text>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  progressBarBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    zIndex: 0,
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
    zIndex: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 16,
  },
  confidence: {
    opacity: 0.8,
    marginLeft: 2,
  },
});