import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDayOfWeek, formatDayOfMonth } from '@/utils/dateUtils';
import { generatePDF } from '@/utils/pdfUtils';
import EmotionBadge from './EmotionBadge';
import EntryOptionsMenu from './EntryOptionsMenu';
import { JournalEntry, useJournalStore } from '@/store/journalStore';
import { MoreHorizontal, Lock } from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';
import AuthenticationManager from './AuthenticationManager';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export default function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const router = useRouter();
  const date = new Date(entry.date);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authAction, setAuthAction] = useState<'view' | 'toggle'>('view');
  const toggleBookmark = useJournalStore(state => state.toggleBookmark);
  const togglePrivate = useJournalStore(state => state.togglePrivate);
  const deleteEntry = useJournalStore(state => state.deleteEntry);
  const { theme } = useTheme();
  const { biometricEnabled, pinEnabled } = useSettingsStore();
  
  const handlePress = () => {
    if (entry.isPrivate) {
      if (biometricEnabled || pinEnabled) {
        setAuthAction('view');
        setShowAuth(true);
      } else {
        router.push({
          pathname: "/entry/[id]",
          params: { id: entry.id }
        });
      }
    } else {
      router.push({
        pathname: "/entry/[id]",
        params: { id: entry.id }
      });
    }
  };

  const handleBookmark = () => {
    toggleBookmark(entry.id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share pressed');
  };

  const handlePrivate = () => {
    // If authentication is enabled, require it for both private and unprivate actions
    if (biometricEnabled || pinEnabled) {
      setAuthAction('toggle');
      setShowAuth(true);
      return;
    }
    
    // Only proceed if no auth required
    togglePrivate(entry.id);
    setMenuVisible(false);
  };

  const handlePDF = async () => {
    const success = await generatePDF(entry);
    if (!success) {
      Alert.alert(
        'Error',
        'Failed to generate PDF. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEntry(entry.id);
          }
        }
      ]
    );
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (authAction === 'toggle') {
      togglePrivate(entry.id);
      setMenuVisible(false);
    } else {
      // Pass authenticated state through router params
      router.push({
        pathname: "/entry/[id]",
        params: { id: entry.id, isAuthenticated: 'true' }
      });
    }
  };
  
  return (
    <>
      <Pressable 
        style={({ pressed }) => [
          styles.container,
          { backgroundColor: theme.cardDark },
          pressed && { opacity: 0.9, backgroundColor: theme.card }
        ]}
        onPress={handlePress}
      >
        <View style={[styles.dateContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.dayOfWeek, { color: theme.textSecondary }]}>{formatDayOfWeek(date)}</Text>
          <Text style={[styles.dayOfMonth, { color: theme.text }]}>{formatDayOfMonth(date)}</Text>
          {entry.isBookmarked && (
            <View style={styles.bookmarkIndicator} />
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={[styles.content, { color: theme.text }]} numberOfLines={2}>
            {entry.isPrivate ? '••••••••••••••••••' : entry.content}
          </Text>
          
          {entry.image && !entry.isPrivate && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: entry.image }} 
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}
          
          <View style={styles.footer}>
            <View style={styles.badgeContainer}>
              {entry.isPrivate ? (
                <View style={[styles.privateBadge, { backgroundColor: theme.card }]}>
                  <Lock size={14} color={theme.textSecondary} />
                  <Text style={[styles.privateText, { color: theme.textSecondary }]}>PRIVATE</Text>
                </View>
              ) : (
                <>
                  <EmotionBadge 
                    emotionId={entry.userCorrectedEmotion || entry.emotion} 
                    size="small"
                  />
                  <View style={[styles.depthBadge, { backgroundColor: theme.card }]}>
                    <Text style={[styles.depthText, { color: theme.textSecondary }]}>DEPTH</Text>
                  </View>
                </>
              )}
            </View>
            <Pressable 
              style={styles.moreButton}
              onPress={() => setMenuVisible(true)}
            >
              <MoreHorizontal size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>
      </Pressable>

      <EntryOptionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onPrivate={handlePrivate}
        onPDF={handlePDF}
        onDelete={handleDelete}
      />

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dateContainer: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayOfMonth: {
    fontSize: 24,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    fontSize: 16,
    marginBottom: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  depthBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  depthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  privateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    marginTop: 4,
  },
});