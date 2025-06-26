import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';

export type ChartStyle = 'line' | 'bar' | 'progress' | 'pie';

interface ChartStyleSelectorProps {
  value: ChartStyle;
  onChange: (value: ChartStyle) => void;
  label?: string;
}

const chartStyleOptions: { value: ChartStyle; label: string }[] = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' },
  { value: 'progress', label: 'Progress Bars' },
  { value: 'pie', label: 'Pie Chart' },
];

export default function ChartStyleSelector({ value, onChange, label }: ChartStyleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const selectedOption = chartStyleOptions.find(option => option.value === value);

  const handleSelect = (option: ChartStyle) => {
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
            {chartStyleOptions.map((option) => (
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