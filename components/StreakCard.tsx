import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Timer } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

export default function StreakCard({ currentStreak, longestStreak, totalEntries }: StreakCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.cardDark }]}>
      <View style={styles.header}>
        <Timer size={24} color={theme.primary} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text }]}>Build a Healthy Habit</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Journal daily to track your emotions</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Text style={[styles.badgeText, { color: theme.text }]}>NEW</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>CURRENT{'\n'}STREAK</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{longestStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>LONGEST{'\n'}STREAK</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{totalEntries}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOTAL{'\n'}ENTRIES</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});