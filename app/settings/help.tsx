import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/ThemeContext';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, HelpCircle, BookOpen, MessageCircle, Settings, BarChart3 } from 'lucide-react-native';

export default function HelpScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8}>
          <ArrowLeft size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <BookOpen size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Getting Started</Text>
          </View>
          <View style={styles.helpList}>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Tap the + button to create a new journal entry
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Use AI prompts to get inspired or choose from templates
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Let AI analyze your emotions or select them manually
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • View your insights and mood patterns in the Insights tab
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <MessageCircle size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Chat with LEXA</Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            LEXA is your AI companion available in the Chat tab. You can have conversations, 
            get emotional support, or ask for guidance on your journaling journey.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Understanding Insights</Text>
          </View>
          <View style={styles.helpList}>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Emotion charts show your mood patterns over time
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Streak tracking helps maintain consistent journaling
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Export your data to PDF for personal records
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Settings size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Customization</Text>
          </View>
          <View style={styles.helpList}>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Toggle between light and dark themes
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Enable/disable haptic feedback
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Show/hide emotion confidence scores
            </Text>
            <Text style={[styles.helpItem, { color: theme.textSecondary }]}>
              • Enable/disable follow-up questions
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <HelpCircle size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Need More Help?</Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            If you're experiencing issues or have questions not covered here, 
            please reach out to our support team through github.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  helpList: {
    gap: 8,
  },
  helpItem: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 