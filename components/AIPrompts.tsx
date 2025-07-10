import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ColorValue, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { generateJournalPrompts, generateGeminiPrompt } from '@/services/aiPrompts';
import { useJournalStore } from '@/store/journalStore';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function AIPrompts() {
  const router = useRouter();
  const entries = useJournalStore(state => state.entries);
  const cachedPrompts = useJournalStore(state => state.cachedPrompts);
  const setCachedPrompts = useJournalStore(state => state.setCachedPrompts);
  const [prompts, setPrompts] = useState<Array<{ question: string; context?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, themeType } = useTheme();
  const prevEntriesLength = useRef(entries.length);

  useEffect(() => {
    const loadPrompts = async () => {
      setIsLoading(true);
      
      // If no entries, just show default prompts
      if (!entries || entries.length === 0) {
        const defaultPrompts = generateJournalPrompts([]);
        setPrompts(defaultPrompts);
        setIsLoading(false);
        return;
      }

      // Check if we can use cached prompts
      const currentEntryId = entries[0].id;
      const cacheAge = Date.now() - cachedPrompts.timestamp;
      const cacheValid = cachedPrompts.lastEntryId === currentEntryId && cacheAge < 5 * 60 * 1000; // 5 minutes

      // Only reload if:
      // 1. Cache is invalid OR
      // 2. Number of entries changed (new entry added or deleted)
      const entriesChanged = entries.length !== prevEntriesLength.current;
      
      if (cacheValid && !entriesChanged && cachedPrompts.prompts.length > 0) {
        setPrompts(cachedPrompts.prompts);
        setIsLoading(false);
        return;
      }

      try {
        // Generate new prompts
        const defaultPrompts = generateJournalPrompts(entries);
        let lexaNudges = 0;
        const newPrompts = [...defaultPrompts];
        
        // Try to get LEXA nudges for the 2 most recent entries
        if (entries.length > 0) {
          const recentEntries = entries.slice(0, 2);
          for (const entry of recentEntries) {
            try {
              const geminiPrompt = await generateGeminiPrompt(entry);
              if (geminiPrompt && lexaNudges < 2) {
                newPrompts.unshift(geminiPrompt); // Add LEXA's nudges at the start
                lexaNudges++;
              }
            } catch (error) {
              console.error('Error generating Gemini prompt:', error);
            }
          }
        }
        
        // Store in global state
        setCachedPrompts({
          prompts: newPrompts,
          lastEntryId: currentEntryId,
          timestamp: Date.now()
        });
        
        setPrompts(newPrompts);
        prevEntriesLength.current = entries.length;
      } catch (error) {
        console.error('Error loading prompts:', error);
        // Fallback to default prompts on error
        const defaultPrompts = generateJournalPrompts([]);
        setPrompts(defaultPrompts);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrompts();
  }, [entries.length]); // Only depend on entries.length to detect additions/deletions

  const handlePromptPress = (prompt: string) => {
    router.push({
      pathname: '/new-entry',
      params: { prompt }
    });
  };

  const getGradientColors = (): [ColorValue, ColorValue] => {
    if (themeType === 'dark') {
      return ['rgba(255, 75, 75, 1)', 'rgba(123, 97, 255, 1)'];
    }
    return ['rgba(255, 107, 107, 1)', 'rgba(107, 75, 255, 1)'];
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Sparkles size={20} color={theme.primary} style={styles.titleIcon} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>LEXA</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.text} size="small" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Sparkles size={20} color={theme.primary} style={styles.titleIcon} />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>LEXA</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt, index) => (
          <Pressable
            key={index}
            onPress={() => handlePromptPress(prompt.question)}
          >
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            >
              <View style={[styles.promptCard, { backgroundColor: theme.card }]}>
                <View style={styles.promptContent}>
                  {prompt.context && (
                    <Text style={[styles.promptContext, { color: theme.textSecondary }]}>
                      {prompt.context}
                    </Text>
                  )}
                  <Text style={[styles.promptText, { color: theme.text }]}>
                    {prompt.question}
                  </Text>
                </View>
                <View style={styles.promptArrow}>
                  <ChevronRight size={20} color={theme.textSecondary} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16
  },
  titleIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  gradientBorder: {
    borderRadius: 16,
    padding: 1.5, 
    marginHorizontal: 4,
  },
  promptCard: {
    borderRadius: 15, 
    padding: 16,
    paddingBottom: 10,
    width: 280,
    height: 125, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promptContent: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  promptContext: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  promptText: {
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
  },
  promptArrow: {
    alignSelf: 'center',
  },
  loadingContainer: {
    height: 125,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
}); 