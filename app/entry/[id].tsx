import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useJournalStore } from '@/store/journalStore';
import { useSettingsStore } from '@/store/settingsStore';
import EmotionBadge from '@/components/EmotionBadge';
import EmotionPicker from '@/components/EmotionPicker';
import Button from '@/components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { Trash2, Edit2, Lock, LockOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useTheme } from '@/store/ThemeContext';
import AuthenticationManager from '@/components/AuthenticationManager';

export default function EntryDetailScreen() {
  const { id, isAuthenticated: initialAuth } = useLocalSearchParams<{ id: string; isAuthenticated?: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  
  const entry = useJournalStore(state => state.getEntryById(id));
  const updateEntry = useJournalStore(state => state.updateEntry);
  const deleteEntry = useJournalStore(state => state.deleteEntry);
  const correctEmotion = useJournalStore(state => state.correctEmotion);
  const togglePrivate = useJournalStore(state => state.togglePrivate);
  
  const showEmotionConfidence = useSettingsStore(state => state.showEmotionConfidence);
  const hapticFeedback = useSettingsStore(state => state.hapticFeedback);
  const { biometricEnabled, pinEnabled } = useSettingsStore();
  
  const [selectedEmotion, setSelectedEmotion] = useState(
    entry?.userCorrectedEmotion || entry?.emotion || ''
  );
  const [isEditingEmotion, setIsEditingEmotion] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth === 'true' || !entry?.isPrivate);
  const [authAction, setAuthAction] = useState<'view' | 'toggle'>('view');
  
  useEffect(() => {
    // Only trigger authentication for viewing if not already authenticated
    if (entry?.isPrivate && !isAuthenticated && (biometricEnabled || pinEnabled) && authAction === 'view' && initialAuth !== 'true') {
      setShowAuth(true);
    }
  }, [entry?.isPrivate, isAuthenticated, biometricEnabled, pinEnabled, authAction, initialAuth]);
  
  if (!entry) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.notFoundText, { color: theme.text }]}>Entry not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }
  
  const handleCorrectEmotion = () => {
    if (selectedEmotion !== entry.emotion) {
      correctEmotion(entry.id, selectedEmotion);
      
      if (hapticFeedback && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setIsEditingEmotion(false);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteEntry(entry.id);
            
            if (hapticFeedback && Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            
            router.back();
          }
        }
      ]
    );
  };

  const handleTogglePrivate = () => {
    // If authentication is enabled, require it for both private and unprivate actions
    if (biometricEnabled || pinEnabled) {
      if (!isAuthenticated) {
        setAuthAction('toggle');
        setShowAuth(true);
        return;
      }
    }
    
    // Only proceed if authenticated or no auth required
    togglePrivate(entry.id);
    if (!entry.isPrivate) {
      setIsAuthenticated(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (authAction === 'toggle') {
      togglePrivate(entry.id);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(true);
    }
  };
  
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? 8 : 0 }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              {formatDate(entry.date)}
            </Text>
            <Text style={[styles.time, { color: theme.textSecondary }]}>
              {formatTime(entry.date)}
            </Text>
          </View>
          
          <View style={styles.headerRight}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: theme.card }]}
              onPress={handleTogglePrivate}
            >
              {entry.isPrivate ? (
                <Lock size={20} color={theme.text} />
              ) : (
                <LockOpen size={20} color={theme.text} />
              )}
            </Pressable>
            
            <Pressable
              style={[styles.iconButton, { backgroundColor: theme.card }]}
              onPress={handleDelete}
            >
              <Trash2 size={20} color={theme.error} />
            </Pressable>
          </View>
        </View>
        
        {isAuthenticated ? (
          <>
            <Text style={[styles.content, { color: theme.text }]}>
              {entry.content}
            </Text>
            
            {entry.image && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: entry.image }} 
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}
            
            <View style={styles.emotionSection}>
              <View style={styles.emotionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Emotion</Text>
                <Pressable
                  style={[styles.editButton, { backgroundColor: theme.card }]}
                  onPress={() => setIsEditingEmotion(!isEditingEmotion)}
                >
                  <Edit2 size={16} color={theme.text} />
                  <Text style={[styles.editButtonText, { color: theme.text }]}>
                    {isEditingEmotion ? 'Done' : 'Edit'}
                  </Text>
                </Pressable>
              </View>
              
              {isEditingEmotion ? (
                <EmotionPicker
                  selectedEmotion={selectedEmotion}
                  onSelectEmotion={setSelectedEmotion}
                  onConfirm={handleCorrectEmotion}
                />
              ) : (
                <View style={styles.emotionBadgeContainer}>
                  <EmotionBadge 
                    emotionId={entry.userCorrectedEmotion || entry.emotion}
                    showConfidence={showEmotionConfidence}
                    confidence={entry.confidence}
                    size="large"
                  />
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.privateContent}>
            <Lock size={48} color={theme.textSecondary} />
            <Text style={[styles.privateText, { color: theme.text }]}>
              This entry is private
            </Text>
            <Text style={[styles.privateSubtext, { color: theme.textSecondary }]}>
              Authenticate to view the content
            </Text>
          </View>
        )}
      </ScrollView>

      <AuthenticationManager
        isVisible={showAuth}
        onSuccess={handleAuthSuccess}
        onCancel={() => {
          setShowAuth(false);
          if (authAction === 'toggle') {
            setAuthAction('view');
          }
        }}
      />
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
    alignItems: 'flex-start',
    padding: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  date: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emotionSection: {
    padding: 16,
  },
  emotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emotionBadgeContainer: {
    alignItems: 'flex-start',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 16,
  },
  privateContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  privateText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  privateSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});