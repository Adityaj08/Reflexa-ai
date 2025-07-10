import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Image,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  ColorValue
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useJournalStore } from '@/store/journalStore';
import { useSettingsStore } from '@/store/settingsStore';
import { analyzeEmotion, EmotionResult } from '@/services/emotionAnalysis';
import EmotionBadge from '@/components/EmotionBadge';
import EmotionAnalysisSheet from '@/components/EmotionAnalysisSheet';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate } from '@/utils/dateUtils';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { ChevronDown, ChevronUp, Image as ImageIcon, X, Lightbulb, Zap, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';
import { BlurView } from 'expo-blur';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { generateFollowUpQuestions } from '@/services/aiPrompts';
import { LinearGradient } from 'expo-linear-gradient';

const TEMPLATES = [
  "What made you smile today?",
  "What's challenging you right now?",
  "What are you grateful for today?",
  "What's something you learned recently?",
  "How would you describe your current mood?",
  "What's something you're looking forward to?",
  "What's a goal you're working towards?",
  "What's something that surprised you today?",
];

const INSPIRATIONAL_PROMPTS = [
  "Reflext on a moment that brought you joy",
  "Describe a small victory you had today",
  "Write about something you're proud of",
  "Share a dream or aspiration",
  "What positive changes have you noticed in yourself?",
  "What's a challenge you overcame recently?",
  "Write about someone who inspires you",
  "What's a new perspective you gained lately?",
];

interface PromptBottomSheetProps {
  type: 'templates' | 'inspiration';
  isVisible: boolean;
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

function PromptBottomSheet({ type, isVisible, onClose, onSelect }: PromptBottomSheetProps) {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);

  const title = type === 'templates' ? 'Choose a Template' : 'Get Inspired';
  const prompts = type === 'templates' ? TEMPLATES : INSPIRATIONAL_PROMPTS;

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handlePromptSelect = (prompt: string) => {
    onSelect(prompt);
    bottomSheetRef.current?.close();
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
      <View style={styles.modalHeader}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <X size={24} color={theme.text} />
        </Pressable>
      </View>
      
      <BottomSheetScrollView contentContainerStyle={styles.promptList}>
        {prompts.map((prompt, index) => (
          <Pressable
            key={index}
            style={[styles.promptItem, { backgroundColor: theme.card }]}
            onPress={() => handlePromptSelect(prompt)}
          >
            <Text style={[styles.promptText, { color: theme.text }]}>{prompt}</Text>
          </Pressable>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export default function NewEntryScreen() {
  const router = useRouter();
  const { prompt } = useLocalSearchParams<{ prompt: string }>();
  const addEntry = useJournalStore(state => state.addEntry);
  const showEmotionConfidence = useSettingsStore(state => state.showEmotionConfidence);
  const hapticFeedback = useSettingsStore(state => state.hapticFeedback);
  const { theme, themeType } = useTheme();
  
  const [content, setContent] = useState('');
  const [userContent, setUserContent] = useState('');
  const [emotion, setEmotion] = useState<string>('');
  const [emotions, setEmotions] = useState<EmotionResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysisSheet, setShowAnalysisSheet] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showInspiration, setShowInspiration] = useState(false);
  const [additionalContent, setAdditionalContent] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const followUpEnabled = useSettingsStore(state => state.followUpEnabled);
  const followUpTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const [aiContent, setAiContent] = useState<Array<{ text: string, type: 'prompt' | 'followup' }>>([]);
  const [followUpDismissed, setFollowUpDismissed] = useState(false);

  useEffect(() => {
    if (prompt) {
      setAiContent([{ text: prompt, type: 'prompt' }]);
    }
  }, [prompt]);

  const handleClose = () => {
    router.back();
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    setUserContent(text);
    if (isAnalyzed) {
      setIsAnalyzed(false);
      setEmotion('');
      setEmotions([]);
    }
    setFollowUpDismissed(false); // Reset follow-up dismissal on new typing
  };

  const handleScreenPress = () => {
    inputRef.current?.focus();
  };

  const handlePhotoPress = async () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleTemplatesPress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowTemplates(true);
  };

  const handleInspirationPress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowInspiration(true);
    setFollowUpDismissed(true); // Dismiss follow-ups on inspiration
  };

  const getOptionBackgroundColor = () => {
    const color = themeType === 'dark' ? '#000000' : 
                 themeType === 'light' ? '#FFFFFF' : 
                 theme.card;
    return Platform.OS === 'ios' ? color : `${color}0D`; // 0D = 5% opacity in hex
  };

  const handleAnalyze = async () => {
    if (content.trim().length < 5) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeEmotion(content);
      setEmotion(result.primaryEmotion);
      setEmotions(result.emotions);
      setIsAnalyzed(true);
      
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Dismiss keyboard
      Keyboard.dismiss();
      
      // Show the analysis sheet after a short delay to ensure smooth animation
      setTimeout(() => {
        setShowAnalysisSheet(true);
      }, 300);
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      // Set a fallback emotion
      setEmotion('neutral');
      setEmotions([{ 
        emotion: 'neutral', 
        confidence: 100,
        isUserSelected: false 
      }]);
      setIsAnalyzed(true);
      
      // Dismiss keyboard even if there's an error
      Keyboard.dismiss();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEmotionSelect = (selectedEmotion: string) => {
    // Update the primary emotion
    setEmotion(selectedEmotion);
    
    // Update the emotions array to mark the selected emotion
    setEmotions(prevEmotions => 
      prevEmotions.map(e => ({
        ...e,
        isUserSelected: e.emotion === selectedEmotion
      }))
    );

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  const handleSave = () => {
    if (content.trim().length === 0 || !emotion) return;
    
    setIsSaving(true);
    
    const newEntry = {
      id: Date.now().toString(),
      content: content.trim(),
      additionalContent: additionalContent.trim(),
      date: new Date().toISOString(),
      emotion,
      emotions,
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

  // Update the analysis trigger to only consider user content
  useEffect(() => {
    let mounted = true;

    const generateQuestions = async () => {
      if (!followUpEnabled || userContent.trim().length === 0 || followUpDismissed) {
        return;
      }

      try {
        setIsLoadingQuestions(true);
        const questions = await generateFollowUpQuestions(userContent);
        
        if (mounted) {
          setFollowUpQuestions(questions);
          if (questions.length > 0) {
            setShowFollowUp(true);
          }
        }
      } catch (error) {
        console.error('Error generating follow-up questions:', error);
        if (mounted) {
          setFollowUpQuestions([]);
          setShowFollowUp(false);
        }
      } finally {
        if (mounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    const timer = setTimeout(generateQuestions, 2000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [userContent, followUpEnabled, followUpDismissed]);

  const handleFollowUpSelect = (question: string) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Append the question to both content and userContent
    const newContent = `${content}\n\n${question}`;
    setContent(newContent);
    setUserContent(newContent);
    
    // Add to AI content list
    setAiContent(prev => [...prev, { text: question, type: 'followup' }]);
    setShowFollowUp(false);
    
    // Focus the input after a short delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handlePromptSelect = (prompt: string) => {
    setContent(prompt);
    setAiContent([{ text: prompt, type: 'prompt' }]);
    setShowTemplates(false);
    setShowInspiration(false);
  };

  const getGradientColors = (): [ColorValue, ColorValue] => {
    if (themeType === 'dark') {
      return ['rgba(255, 75, 75, 1)', 'rgba(123, 97, 255, 1)'];
    }
    return ['rgba(255, 107, 107, 1)', 'rgba(107, 75, 255, 1)'];
  };

  const renderAIIndicator = (type: 'prompt' | 'followup') => (
    <View style={styles.aiIndicator}>
      <Sparkles size={16} color={theme.primary} />
      <Text style={[styles.aiIndicatorText, { color: theme.primary }]}>
        {type === 'prompt' ? 'AI Prompt' : 'Follow-up'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatDate(new Date())}
          </Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <X size={24} color={theme.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView}>
          <Pressable style={[styles.card, { backgroundColor: 'transparent' }]} onPress={handleScreenPress}>
            {aiContent.map((item, index) => (
              <View key={index} style={styles.aiContentContainer}>
                {renderAIIndicator(item.type)}
                <Text style={[styles.aiText, { color: theme.text }]}>
                  {item.text}
                </Text>
              </View>
            ))}
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { color: theme.text }
              ]}
              multiline
              placeholder="What's on your mind?"
              placeholderTextColor={theme.textSecondary}
              value={userContent}
              onChangeText={handleContentChange}
            />
            {selectedImage && (
              <>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.image} />
                  <Pressable
                    style={styles.removeImage}
                    onPress={() => setSelectedImage(null)}
                  >
                    <X size={20} color="white" />
                  </Pressable>
                </View>
                <TextInput
                  style={[
                    styles.additionalInput,
                    { color: theme.text }
                  ]}
                  multiline
                  placeholder="Add more thoughts about this moment..."
                  placeholderTextColor={theme.textSecondary}
                  value={additionalContent}
                  onChangeText={setAdditionalContent}
                />
              </>
            )}
          </Pressable>

          {showFollowUp && followUpQuestions.length > 0 && (
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.followUpGradient}
            >
              <View style={[styles.followUpContainer, { backgroundColor: theme.card }]}>
                <View style={[styles.followUpHeader, { borderBottomColor: theme.border }]}>
                  <View style={styles.titleContainer}>
                    <Sparkles size={20} color={theme.primary} style={styles.titleIcon} />
                    <Text style={[styles.followUpTitle, { color: theme.text }]}>LEXA</Text>
                  </View>
                  <Pressable onPress={() => { setShowFollowUp(false); setFollowUpDismissed(true); }} hitSlop={8}>
                    <X size={20} color={theme.text} />
                  </Pressable>
                </View>
                <View style={styles.followUpQuestions}>
                  {followUpQuestions.map((question, index) => (
                    <Pressable
                      key={index}
                      style={[styles.followUpQuestion, { backgroundColor: theme.cardDark }]}
                      onPress={() => handleFollowUpSelect(question)}
                    >
                      <Text style={[styles.followUpQuestionText, { color: theme.text }]}>{question}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </LinearGradient>
          )}

          {isLoadingQuestions && (
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.followUpGradient}
            >
              <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
                <View style={styles.titleContainer}>
                  <Sparkles size={20} color={theme.primary} style={styles.titleIcon} />
                  <Text style={[styles.loadingText, { color: theme.text }]}>LEXA is thinking...</Text>
                </View>
              </View>
            </LinearGradient>
          )}
        </ScrollView>

        {isAnalyzed ? (
          <View style={styles.emotionContainer}>
            <Pressable 
              onPress={() => setShowAnalysisSheet(true)} 
              style={styles.emotionBadgeContainer}
            >
              <EmotionBadge emotionId={emotion} showConfidence={showEmotionConfidence} confidence={emotions.find(e => e.emotion === emotion)?.confidence || 0} />
              <ChevronUp size={20} color={theme.text} />
            </Pressable>
            <Button
              title="Save Entry"
              onPress={handleSave}
              isLoading={isSaving}
              disabled={userContent.trim().length === 0 || !emotion}
            />
          </View>
        ) : (
          <>
            {userContent.trim().length > 0 ? (
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={[
                    styles.photoButton,
                    { backgroundColor: getOptionBackgroundColor() }
                  ]}
                  onPress={handlePhotoPress}
                >
                  <ImageIcon size={24} color={theme.text} />
                  <Text style={[styles.optionText, { color: theme.text }]}>Photo</Text>
                </TouchableOpacity>
                <Button
                  title="Reflex"
                  onPress={() => { setFollowUpDismissed(true); handleAnalyze(); }}
                  isLoading={isAnalyzing}
                  disabled={userContent.trim().length < 5}
                  style={styles.reflexButton}
                />
              </View>
            ) : (
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    { backgroundColor: getOptionBackgroundColor() }
                  ]}
                  onPress={handlePhotoPress}
                >
                  <ImageIcon size={24} color={theme.text} />
                  <Text style={[styles.optionText, { color: theme.text }]}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.option,
                    { backgroundColor: getOptionBackgroundColor() }
                  ]}
                  onPress={handleTemplatesPress}
                >
                  <Zap size={24} color={theme.text} />
                  <Text style={[styles.optionText, { color: theme.text }]}>Templates</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.option,
                    { backgroundColor: getOptionBackgroundColor() }
                  ]}
                  onPress={handleInspirationPress}
                >
                  <Lightbulb size={24} color={theme.text} />
                  <Text style={[styles.optionText, { color: theme.text }]}>Inspiration</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </KeyboardAvoidingView>

      <EmotionAnalysisSheet
        isVisible={showAnalysisSheet}
        onClose={() => setShowAnalysisSheet(false)}
        emotions={emotions}
        showConfidence={showEmotionConfidence}
        onEmotionSelect={handleEmotionSelect}
      />

      <PromptBottomSheet
        type="templates"
        isVisible={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handlePromptSelect}
      />

      <PromptBottomSheet
        type="inspiration"
        isVisible={showInspiration}
        onClose={() => setShowInspiration(false)}
        onSelect={handlePromptSelect}
      />
    </SafeAreaView>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  date: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 15,
    padding: 15,
    borderRadius: 15,
    minHeight: 50,
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  imageContainer: {
    marginTop: 15,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImage: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
  emotionContainer: {
    padding: 15,
  },
  emotionBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 10,
    paddingHorizontal: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    width: '30%',
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  optionText: {
    marginTop: 8,
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    gap: 10,
  },
  photoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 15,
    width: 100,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  reflexButton: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  promptList: {
    padding: 15,
  },
  promptItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.2)',
  },
  promptText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  additionalInput: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  followUpGradient: {
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 15,
    padding: 1.5,
  },
  followUpContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  followUpTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  followUpQuestions: {
    padding: 12,
  },
  followUpQuestion: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  followUpQuestionText: {
    fontSize: 15,
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginLeft: 8,
  },
  aiContentContainer: {
    marginBottom: 15,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiIndicatorText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  aiText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});