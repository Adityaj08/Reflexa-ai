import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  lastAuthTime: number | null;
  
  // Actions
  setAuthenticated: (value: boolean) => void;
  updateLastAuthTime: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      lastAuthTime: null,
      
      setAuthenticated: (value: boolean) => set({ 
        isAuthenticated: value,
        lastAuthTime: value ? Date.now() : null
      }),
      
      updateLastAuthTime: () => set({ 
        lastAuthTime: Date.now() 
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
); 