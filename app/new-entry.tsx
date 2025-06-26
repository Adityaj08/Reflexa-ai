import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJournalStore } from '@/store/journalStore';
import { useSettingsStore } from '@/store/settingsStore';
import { analyzeEmotion } from '@/services/emotionAnalysis';
import EmotionBadge from '@/components/EmotionBadge';
import EmotionPicker from '@/components/EmotionPicker';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate } from '@/utils/dateUtils';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

export default function NewEntryScreen() {
  const router = useRouter();
  const { prompt } = useLocalSearchParams<{ prompt: string }>();
  const addEntry = useJournalStore(state => state.addEntry);
  const showEmotionConfidence = useSettingsStore(state => state.showEmotionConfidence);
  const hapticFeedback = useSettingsStore(state => state.hapticFeedback);
  const { theme } = useTheme();
  
  const [content, setContent] = useState(prompt || '');
  const [emotion, setEmotion] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    if (isAnalyzed) {
      setIsAnalyzed(false);
      setEmotion('');
      setConfidence(0);
    }
  };
  
  const handleAnalyze = async () => {
    if (content.trim().length < 5) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeEmotion(content);
      setEmotion(result.emotion);
      setConfidence(result.confidence);
      setIsAnalyzed(true);
      
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      // Set a fallback emotion
      setEmotion('neutral');
      setConfidence(60);
      setIsAnalyzed(true);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSave = () => {
    if (content.trim().length === 0 || !emotion) return;
    
    setIsSaving(true);
    
    const newEntry = {
      id: Date.now().toString(),
      content: content.trim(),
      date: new Date().toISOString(),
      emotion,
      confidence,
      image: selectedImage,
    };
    
    addEntry(newEntry);
    
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setTimeout(() => {
      router.back();
    }, 300);
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const toggleEmotionPicker = () => {
    setShowEmotionPicker(!showEmotionPicker);
    
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Platform.OS === 'android' ? 8 : 0 }
          ]}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
        >
          <Text style={[styles.date, { color: theme.text }]}>{formatDate(new Date())}</Text>
          
          {prompt && (
            <View style={[styles.promptContainer, { backgroundColor: theme.card, borderLeftColor: theme.primary }]}>
              <Text style={[styles.promptText, { color: theme.text }]}>{prompt}</Text>
            </View>
          )}
          
          <View style={[styles.inputContainer, { 
            backgroundColor: theme.card,
            flex: 1,
            marginBottom: selectedImage ? 16 : 24
          }]}>
            <TextInput
              style={[styles.input, { 
                color: theme.text,
                flex: 1
              }]}
              placeholder="How are you feeling today?"
              placeholderTextColor={theme.textSecondary}
              multiline
              value={content}
              onChangeText={handleContentChange}
              autoFocus={!prompt}
              textAlignVertical="top"
            />
          </View>

          {selectedImage && (
            <View style={[styles.imageContainer, { marginBottom: 24 }]}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            </View>
          )}
          
          {isAnalyzing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Analyzing your emotions...</Text>
            </View>
          )}
          
          {isAnalyzed && emotion && (
            <View style={[styles.emotionContainer, { backgroundColor: theme.card }]}>
              <View style={styles.emotionHeaderContainer}>
                <Text style={[styles.emotionTitle, { color: theme.text }]}>Detected Emotion:</Text>
                <Pressable 
                  style={styles.toggleButton}
                  onPress={toggleEmotionPicker}
                >
                  {showEmotionPicker ? 
                    <ChevronUp size={20} color={theme.primary} /> : 
                    <ChevronDown size={20} color={theme.primary} />
                  }
                </Pressable>
              </View>
              
              <View style={styles.emotionBadgeContainer}>
                <EmotionBadge 
                  emotionId={emotion} 
                  showConfidence={showEmotionConfidence} 
                  confidence={confidence}
                  size="large"
                />
              </View>
              
              <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceTitle, { color: theme.text }]}>AI Confidence:</Text>
                <View style={[styles.confidenceMeter, { backgroundColor: theme.cardDark }]}>
                  <View 
                    style={[
                      styles.confidenceFill, 
                      { width: `${confidence}%` },
                      confidence > 80 ? styles.highConfidence :
                      confidence > 60 ? styles.mediumConfidence :
                      styles.lowConfidence
                    ]} 
                  />
                </View>
                <Text style={[styles.confidenceValue, { color: theme.textSecondary }]}>{confidence}%</Text>
              </View>
              
              {showEmotionPicker && (
                <EmotionPicker 
                  selectedEmotion={emotion}
                  onSelectEmotion={setEmotion}
                  title="Not accurate? Select the correct emotion:"
                />
              )}
            </View>
          )}
        </ScrollView>
        
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <Pressable 
              style={[styles.photoButton, { backgroundColor: theme.card }]}
              onPress={pickImage}
            >
              <ImageIcon size={24} color={theme.text} />
            </Pressable>

            {!isAnalyzed ? (
              <Button
                title="Analyze Emotions"
                onPress={handleAnalyze}
                isLoading={isAnalyzing}
                disabled={content.trim().length < 5 || isAnalyzing}
                style={styles.mainButton}
              />
            ) : (
              <Button
                title="Save Entry"
                onPress={handleSave}
                isLoading={isSaving}
                disabled={isSaving}
                style={styles.mainButton}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  emotionContainer: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  emotionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emotionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButton: {
    padding: 4,
  },
  emotionBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceContainer: {
    marginVertical: 16,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  confidenceMeter: {
    height: 12,
    backgroundColor: colors.cardDark,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 6,
  },
  highConfidence: {
    backgroundColor: '#4ade80', // green
  },
  mediumConfidence: {
    backgroundColor: '#fbbf24', // yellow
  },
  lowConfidence: {
    backgroundColor: '#f87171', // red
  },
  confidenceValue: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  photoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButton: {
    flex: 1,
  },
  cancelButton: {
    marginBottom: Platform.OS === 'ios' ? 0 : 12,
  },
  promptContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  promptText: {
    fontSize: 16,
    color: colors.text,
    fontStyle: 'italic',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
});