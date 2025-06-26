import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import SettingsItem from '@/components/SettingsItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  Vibrate, 
  Gauge, 
  Moon, 
  HelpCircle, 
  Share2, 
  Star, 
  Info,
  Sun,
  Palette,
  Fingerprint,
  KeyRound,
} from 'lucide-react-native';
import { useTheme } from '@/store/ThemeContext';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SettingsScreen() {
  const { 
    reminderEnabled, 
    toggleReminder, 
    hapticFeedback, 
    toggleHapticFeedback,
    showEmotionConfidence,
    toggleEmotionConfidence,
    biometricEnabled,
    toggleBiometric,
    pinEnabled,
    togglePin,
    setPin,
  } = useSettingsStore();

  const { theme, themeType, setThemeType } = useTheme();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [hasBiometric, setHasBiometric] = useState(false);
  
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometric(enrolled);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setPin(pin);
    setPinInput('');
    setConfirmPin('');
    setError('');
    setShowPinModal(false);
  };

  const handleTogglePin = () => {
    if (!pinEnabled) {
      setShowPinModal(true);
    } else {
      togglePin();
    }
  };

  const getThemeIcon = () => {
    switch (themeType) {
      case 'light':
        return <Sun size={24} color={theme.primary} />;
      case 'dark':
        return <Moon size={24} color={theme.primary} />;
      default:
        return <Palette size={24} color={theme.primary} />;
    }
  };

  const getThemeSubtitle = () => {
    switch (themeType) {
      case 'light':
        return 'Light theme';
      case 'dark':
        return 'Dark theme';
      default:
        return 'Default theme';
    }
  };

  const cycleTheme = () => {
    const themes: Array<'default' | 'dark' | 'light'> = ['default', 'dark', 'light'];
    const currentIndex = themes.indexOf(themeType);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeType(themes[nextIndex]);
  };
  
  return (
    <SafeAreaView edges={['bottom']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        </View>
        
        <View style={[styles.upgradeCard, { backgroundColor: theme.primary + '20' }]}>
          <View style={[styles.upgradeIcon, { backgroundColor: theme.primary }]}>
            <Star size={24} color={theme.text} />
          </View>
          <View style={styles.upgradeContent}>
            <Text style={[styles.upgradeTitle, { color: theme.text }]}>Upgrade to Premium</Text>
            <Text style={[styles.upgradeSubtitle, { color: theme.textSecondary }]}>
              Unlimited entries, advanced insights, and more!
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
            {hasBiometric && (
              <SettingsItem 
                icon={<Fingerprint size={24} color={theme.primary} />}
                title="Biometric Authentication"
                subtitle="Use fingerprint or face ID"
                showToggle
                toggleValue={biometricEnabled}
                onToggleChange={toggleBiometric}
              />
            )}
            
            <SettingsItem 
              icon={<KeyRound size={24} color={theme.primary} />}
              title="PIN Lock"
              subtitle="Set a 4-digit PIN"
              showToggle
              toggleValue={pinEnabled}
              onToggleChange={handleTogglePin}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Preferences</Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
            <SettingsItem 
              icon={<Bell size={24} color={theme.primary} />}
              title="Daily Reminder"
              subtitle="Get reminded to journal daily"
              showToggle
              toggleValue={reminderEnabled}
              onToggleChange={toggleReminder}
            />
            
            <SettingsItem 
              icon={<Vibrate size={24} color={theme.primary} />}
              title="Haptic Feedback"
              subtitle="Vibration feedback when interacting"
              showToggle
              toggleValue={hapticFeedback}
              onToggleChange={toggleHapticFeedback}
            />
            
            <SettingsItem 
              icon={<Gauge size={24} color={theme.primary} />}
              title="Show Confidence"
              subtitle="Display emotion detection confidence"
              showToggle
              toggleValue={showEmotionConfidence}
              onToggleChange={toggleEmotionConfidence}
            />
            
            <SettingsItem 
              icon={getThemeIcon()}
              title="Theme"
              subtitle={getThemeSubtitle()}
              onPress={cycleTheme}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
          
          <View style={[styles.settingsGroup, { backgroundColor: theme.card }]}>
            <SettingsItem 
              icon={<HelpCircle size={24} color={theme.primary} />}
              title="Help & Support"
              onPress={() => {}}
            />
            
            <SettingsItem 
              icon={<Share2 size={24} color={theme.primary} />}
              title="Share with Friends"
              onPress={() => {}}
            />
            
            <SettingsItem 
              icon={<Info size={24} color={theme.primary} />}
              title="About MindJournal"
              subtitle="Version 1.0.0"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Set PIN</Text>
            
            <TextInput
              style={[styles.pinInput, { 
                backgroundColor: theme.cardDark,
                color: theme.text,
                borderColor: error ? theme.error : theme.border
              }]}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor={theme.textSecondary}
              value={pin}
              onChangeText={setPinInput}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.pinInput, { 
                backgroundColor: theme.cardDark,
                color: theme.text,
                borderColor: error ? theme.error : theme.border
              }]}
              placeholder="Confirm PIN"
              placeholderTextColor={theme.textSecondary}
              value={confirmPin}
              onChangeText={setConfirmPin}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
            
            {error ? (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {error}
              </Text>
            ) : null}
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, { backgroundColor: theme.cardDark }]}
                onPress={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setConfirmPin('');
                  setError('');
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handlePinSubmit}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>Set PIN</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  upgradeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  upgradeContent: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  upgradeSubtitle: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingsGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  pinInput: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});