import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { generateJournalPrompts } from '@/services/aiPrompts';
import { useJournalStore } from '@/store/journalStore';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

export default function AIPrompts() {
  const router = useRouter();
  const entries = useJournalStore(state => state.entries);
  const prompts = generateJournalPrompts(entries);
  const { theme } = useTheme();

  const handlePromptPress = (prompt: string) => {
    router.push({
      pathname: '/new-entry',
      params: { prompt }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Prompts</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt, index) => (
          <Pressable
            key={index}
            style={[
              styles.promptCard,
              {
                backgroundColor: theme.card,
                shadowColor: theme.shadow,
              }
            ]}
            onPress={() => handlePromptPress(prompt.question)}
          >
            {prompt.context && (
              <Text style={[styles.promptContext, { color: theme.textSecondary }]}>{prompt.context}</Text>
            )}
            <Text style={[styles.promptText, { color: theme.text }]}>{prompt.question}</Text>
            <View style={styles.promptArrow}>
              <ChevronRight size={20} color={theme.textSecondary} />
            </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  promptCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    width: 280,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  promptContext: {
    fontSize: 14,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 24,
  },
  promptArrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
}); 