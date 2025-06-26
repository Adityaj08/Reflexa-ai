import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  showChevron?: boolean;
}

export default function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  showChevron = true,
}: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: theme.card,
          borderBottomColor: theme.border 
        },
        pressed && [styles.pressed, { backgroundColor: theme.cardDark }],
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconContainer}>{icon}</View>
      
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
      
      {showToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: theme.cardDark, true: theme.primary }}
          thumbColor={theme.text}
        />
      )}
      
      {showChevron && !showToggle && (
        <ChevronRight size={20} color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});