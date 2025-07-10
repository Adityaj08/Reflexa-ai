import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@/store/ThemeContext';
import { X, UserCircle2, Sparkles } from 'lucide-react-native';
import EmotionBadge from './EmotionBadge';
import { EmotionResult, EMOTIONS } from '@/services/emotionAnalysis';

interface EmotionAnalysisSheetProps {
  isVisible: boolean;
  onClose: () => void;
  emotions: EmotionResult[];
  onEmotionSelect?: (emotion: string) => void;
  showConfidence?: boolean;
}

export default function EmotionAnalysisSheet({ 
  isVisible, 
  onClose, 
  emotions,
  onEmotionSelect,
  showConfidence = true 
}: EmotionAnalysisSheetProps) {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%'], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      onClose();
    }
  };

  const handleEmotionPress = (emotion: string) => {
    if (onEmotionSelect) {
      onEmotionSelect(emotion);
    }
  };

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.textSecondary }}
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={22} color={theme.primary} style={{ marginHorizontal: 6 }} />
          <Text style={[styles.title, { color: theme.text }]}>LEXA</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={8}>
          <X size={24} color={theme.text} />
        </Pressable>
      </View>
      
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        {emotions.map((item, index) => {
          const isNeutral = item.emotion === 'neutral';
          const hasHighConfidence = item.confidence >= 40;
          return (
            <Pressable
              key={index}
              onPress={() => handleEmotionPress(item.emotion)}
              style={[
                styles.emotionItem,
                { 
                  backgroundColor: theme.card,
                  opacity: isNeutral ? 0.7 : 1
                }
              ]}
            >
              <EmotionBadge 
                emotionId={item.emotion.toLowerCase()} 
                confidence={item.confidence}
                showConfidence={showConfidence && !isNeutral}
                size="large"
              />
              <View style={styles.iconOverlay} pointerEvents="none">
                {hasHighConfidence && !isNeutral && (
                  <Sparkles size={25} color={theme.primary} style={styles.overlayIcon} />
                )}
                {item.isUserSelected && (
                  <UserCircle2 size={25} color={theme.primary} style={styles.overlayIcon} />
                )}
              </View>
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  emotionItem: {
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    marginBottom: 8,
  },
  emotionContent: {
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconOverlay: {
    position: 'absolute',
    right: 16,
    top: '50%',
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    zIndex: 10,
    gap: 10,
  },
  overlayIcon: {
    marginBottom: 2,
  },
}); 