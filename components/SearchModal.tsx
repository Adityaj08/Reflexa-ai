import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, Platform, TextInput } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';
import { emotions, emotionsList } from '@/constants/emotions';
import DateTimePicker from '@react-native-community/datetimepicker';
import EmotionBadge from './EmotionBadge';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useJournalStore, SearchFilters } from '@/store/journalStore';

export default function SearchModal() {
  const { theme } = useTheme();
  const { 
    isSearchModalVisible, 
    showSearchModal, 
    hideSearchModal, 
    setSearchFilters 
  } = useJournalStore();
  
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Bottom sheet ref and snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      hideSearchModal();
    }
  }, [hideSearchModal]);

  // Handle visibility changes
  React.useEffect(() => {
    if (isSearchModalVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isSearchModalVisible]);

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotionId)
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const handleSearch = () => {
    setSearchFilters({
      selectedEmotions,
      startDate,
      endDate,
      searchText,
    });
    hideSearchModal();
  };

  const handleClear = () => {
    setSelectedEmotions([]);
    setStartDate(null);
    setEndDate(null);
    setSearchText('');
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isSearchModalVisible ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.text }}
      style={{ zIndex: 9999 }}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}> 
          <Text style={[styles.title, { color: theme.text }]}>Search Entries</Text> 
          <Pressable onPress={hideSearchModal} hitSlop={8}> 
            <X size={24} color={theme.text} /> 
          </Pressable> 
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}> 
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Search Content</Text> 
            <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
              <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search in entry content..."
                placeholderTextColor={theme.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                multiline={false}
              />
            </View>
          </View>

          <View style={styles.section}> 
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Emotions</Text> 
            <View style={styles.emotionsGrid}> 
              {emotionsList?.map(emotion => ( 
                <Pressable 
                  key={emotion.id} 
                  onPress={() => toggleEmotion(emotion.id)} 
                  style={[ 
                    styles.emotionItem, 
                    selectedEmotions.includes(emotion.id) && { 
                      backgroundColor: `${emotion.color}20`, 
                      borderColor: emotion.color 
                    } 
                  ]} 
                > 
                  <EmotionBadge emotionId={emotion.id} size="small" /> 
                </Pressable> 
              ))} 
            </View> 
          </View>

          <View style={styles.section}> 
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Date Range</Text> 
            <View style={styles.dateContainer}> 
              <Pressable 
                style={[styles.dateButton, { backgroundColor: theme.card }]} 
                onPress={() => setShowStartPicker(true)} 
              > 
                <Text style={[styles.dateText, { color: theme.text }]}> 
                  {formatDate(startDate)} 
                </Text> 
              </Pressable> 
              <Text style={[styles.dateText, { color: theme.text }]}>to</Text> 
              <Pressable 
                style={[styles.dateButton, { backgroundColor: theme.card }]} 
                onPress={() => setShowEndPicker(true)} 
              > 
                <Text style={[styles.dateText, { color: theme.text }]}> 
                  {formatDate(endDate)} 
                </Text> 
              </Pressable> 
            </View> 
          </View>

          {(Platform.OS === 'android' || Platform.OS === 'ios') && showStartPicker && ( 
            <DateTimePicker 
              value={startDate || new Date()} 
              mode="date" 
              display="default" 
              onChange={(event, date) => { 
                setShowStartPicker(false); 
                if (date) setStartDate(date); 
              }} 
            /> 
          )}

          {(Platform.OS === 'android' || Platform.OS === 'ios') && showEndPicker && ( 
            <DateTimePicker 
              value={endDate || new Date()} 
              mode="date" 
              display="default" 
              onChange={(event, date) => { 
                setShowEndPicker(false); 
                if (date) setEndDate(date); 
              }} 
            /> 
          )}

          <View style={styles.footer}> 
            <Pressable 
              style={[styles.button, styles.clearButton, { borderColor: theme.primary }]} 
              onPress={handleClear} 
            > 
              <Text style={[styles.buttonText, { color: theme.primary }]}>Clear</Text> 
            </Pressable> 
            <Pressable 
              style={[styles.button, styles.searchButton, { backgroundColor: theme.primary }]} 
              onPress={handleSearch} 
            > 
              <Text style={[styles.buttonText, { color: theme.background }]}>Search</Text> 
            </Pressable> 
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
  },
  emotionItem: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'transparent',
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  dateText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  clearButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  searchButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
}); 