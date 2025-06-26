import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

export type TimeRange = 'week' | 'month' | 'year';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
  label?: string;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'week', label: 'Past Week' },
  { value: 'month', label: 'Past Month' },
  { value: 'year', label: 'Past Year' },
];

export default function TimeRangeSelector({ value, onChange, label }: TimeRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const selectedOption = timeRangeOptions.find(option => option.value === value);

  const handleSelect = (option: TimeRange) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <View>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
      )}
      <Pressable
        style={[styles.selector, { backgroundColor: theme.cardDark }]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.selectorText, { color: theme.text }]}>
          {selectedOption?.label}
        </Text>
        <ChevronDown size={20} color={theme.text} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.cardDark }]}>
            {timeRangeOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.option,
                  option.value === value && [styles.selectedOption, { backgroundColor: theme.primary }]
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: theme.text },
                    option.value === value && styles.selectedOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: '#7b68ee',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
}); 