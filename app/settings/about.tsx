import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/store/ThemeContext';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Sparkles, Shield, Users } from 'lucide-react-native';

export default function AboutScreen() {
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
        <Text style={[styles.title, { color: theme.text }]}>About Reflexa</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Sparkles size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>What is Reflexa?</Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Reflexa is your AI-powered journaling companion designed to help you reflect, 
            understand your emotions, and track your personal growth journey.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
          </View>
          <View style={styles.featureList}>
            <Text style={[styles.feature, { color: theme.textSecondary }]}>
              • AI-powered emotion analysis
            </Text>
            <Text style={[styles.feature, { color: theme.textSecondary }]}>
              • Personalized journaling prompts
            </Text>
            <Text style={[styles.feature, { color: theme.textSecondary }]}>
              • Mood tracking and insights
            </Text>
            <Text style={[styles.feature, { color: theme.textSecondary }]}>
              • Secure and private journaling
            </Text>
            <Text style={[styles.feature, { color: theme.textSecondary }]}>
              • Beautiful, intuitive interface
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Shield size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy & Security</Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Your journal entries are stored locally on your device and are never shared 
            with third parties. Your privacy and data security are our top priorities.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Users size={24} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Version</Text>
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Reflexa v1.0.0
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
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 