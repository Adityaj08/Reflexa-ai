import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/store/ThemeContext';

interface AuthenticationManagerProps {
  isVisible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AuthenticationManager({ 
  isVisible, 
  onSuccess, 
  onCancel 
}: AuthenticationManagerProps) {
  const { theme } = useTheme();
  const { biometricEnabled, pinEnabled, pin } = useSettingsStore();
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVisible && biometricEnabled) {
      authenticateWithBiometrics();
    }
  }, [isVisible]);

  const authenticateWithBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to view entry',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: !pinEnabled,
      });

      if (result.success) {
        onSuccess();
      } else if (result.error === 'user_cancel' && !pinEnabled) {
        onCancel();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === pin) {
      setPinInput('');
      setError('');
      onSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPinInput('');
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Authentication Required
          </Text>
          
          {pinEnabled && (
            <>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.cardDark,
                  color: theme.text,
                  borderColor: error ? theme.error : theme.border
                }]}
                placeholder="Enter PIN"
                placeholderTextColor={theme.textSecondary}
                value={pinInput}
                onChangeText={setPinInput}
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                onSubmitEditing={handlePinSubmit}
              />
              
              {error ? (
                <Text style={[styles.error, { color: theme.error }]}>
                  {error}
                </Text>
              ) : null}
              
              <View style={styles.buttonContainer}>
                <Pressable 
                  style={[styles.button, { backgroundColor: theme.cardDark }]}
                  onPress={onCancel}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.button, { backgroundColor: theme.primary }]}
                  onPress={handlePinSubmit}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>
                    Submit
                  </Text>
                </Pressable>
              </View>
            </>
          )}
          
          {!pinEnabled && !biometricEnabled && (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              No authentication method enabled.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  error: {
    marginBottom: 12,
    fontSize: 14,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  button: {
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