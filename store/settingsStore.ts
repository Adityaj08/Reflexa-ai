import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  reminderEnabled: boolean;
  reminderTime: string; // Format: "HH:MM"
  hapticFeedback: boolean;
  showEmotionConfidence: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  pin: string | null;
  followUpEnabled: boolean;
  
  // Actions
  toggleReminder: () => void;
  setReminderTime: (time: string) => void;
  toggleHapticFeedback: () => void;
  toggleEmotionConfidence: () => void;
  toggleBiometric: () => void;
  togglePin: () => void;
  setPin: (pin: string | null) => void;
  toggleFollowUp: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reminderEnabled: false,
      reminderTime: "20:00", // Default: 8:00 PM
      hapticFeedback: true,
      showEmotionConfidence: true,
      biometricEnabled: false,
      pinEnabled: false,
      pin: null,
      followUpEnabled: true, // Default: enabled
      
      toggleReminder: () => set((state) => ({ 
        reminderEnabled: !state.reminderEnabled 
      })),
      
      setReminderTime: (time) => set({ 
        reminderTime: time 
      }),
      
      toggleHapticFeedback: () => set((state) => ({ 
        hapticFeedback: !state.hapticFeedback 
      })),
      
      toggleEmotionConfidence: () => set((state) => ({ 
        showEmotionConfidence: !state.showEmotionConfidence 
      })),

      toggleBiometric: () => set((state) => ({
        biometricEnabled: !state.biometricEnabled
      })),

      togglePin: () => set((state) => ({
        pinEnabled: !state.pinEnabled,
        pin: !state.pinEnabled ? null : state.pin
      })),

      setPin: (pin) => set({
        pin,
        pinEnabled: !!pin
      }),

      toggleFollowUp: () => set((state) => ({
        followUpEnabled: !state.followUpEnabled
      }))
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);