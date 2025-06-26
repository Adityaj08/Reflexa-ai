import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useJournalStore } from '@/store/journalStore';
import JournalEntryCard from '@/components/JournalEntryCard';
import AIPrompts from '@/components/AIPrompts';
import { formatMonth } from '@/utils/dateUtils';
import { Plus, Search, MessageCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/store/ThemeContext';

export default function JournalScreen() {
  const router = useRouter();
  const entries = useJournalStore(state => state.entries);
  const hapticFeedback = useSettingsStore(state => state.hapticFeedback);
  const [currentMonth, setCurrentMonth] = useState(formatMonth(new Date()));
  const { theme } = useTheme();
  
  // Group entries by month
  const entriesByMonth: { [key: string]: any[] } = {};
  entries.forEach(entry => {
    const date = new Date(entry.date);
    const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!entriesByMonth[monthKey]) {
      entriesByMonth[monthKey] = [];
    }
    entriesByMonth[monthKey].push(entry);
  });
  
  // Sort entries within each month by date (newest first)
  Object.keys(entriesByMonth).forEach(month => {
    entriesByMonth[month].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });
  
  // Get sorted months (newest first)
  const months = Object.keys(entriesByMonth).sort((a, b) => {
    const dateA = new Date(entriesByMonth[a][0].date);
    const dateB = new Date(entriesByMonth[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });
  
  const handleNewEntry = () => {
    if (hapticFeedback && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/new-entry');
  };
  
  const handleChat = () => {
    router.push('/chat');
  };
  
  const renderMonthSection = ({ item: month }: { item: string }) => (
    <View style={styles.monthSection}>
      <Text style={[styles.monthTitle, { color: theme.text }]}>{month}</Text>
      {entriesByMonth[month].map(entry => (
        <JournalEntryCard key={entry.id} entry={entry} />
      ))}
    </View>
  );

  const ListHeaderComponent = () => (
    <AIPrompts />
  );
  
  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Journal</Text>
        <Pressable style={[styles.searchButton, { backgroundColor: theme.card }]}>
          <Search size={24} color={theme.text} />
        </Pressable>
      </View>
      
      {entries.length > 0 ? (
        <FlatList
          data={months}
          renderItem={renderMonthSection}
          keyExtractor={item => item}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeaderComponent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AIPrompts />
          <View style={styles.emptyContent}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No journal entries yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Start journaling to track your emotions and gain insights into your mental well-being.
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.fabContainer}>
        <Pressable 
          style={[
            styles.fabButton,
            styles.chatButton,
            {
              backgroundColor: theme.cardDark,
              shadowColor: theme.shadow,
            }
          ]}
          onPress={handleChat}
        >
          <MessageCircle size={24} color={theme.primary} />
        </Pressable>

        <Pressable 
          style={[
            styles.fabButton,
            {
              backgroundColor: theme.primary,
              shadowColor: theme.shadow,
            }
          ]}
          onPress={handleNewEntry}
        >
          <Plus size={24} color={theme.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for FAB
  },
  monthSection: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 16,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
    gap: 16,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatButton: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});