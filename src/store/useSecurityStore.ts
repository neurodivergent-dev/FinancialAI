import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SecurityState {
  isBiometricsEnabled: boolean;
  isLocked: boolean;
  setBiometricsEnabled: (enabled: boolean) => void;
  setLocked: (locked: boolean) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      isBiometricsEnabled: false,
      isLocked: false,
      setBiometricsEnabled: (enabled) => set({ isBiometricsEnabled: enabled }),
      setLocked: (locked) => set({ isLocked: locked }),
    }),
    {
      name: 'security-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only save isBiometricsEnabled, isLocked should be reset on every launch
      partialize: (state) => ({ isBiometricsEnabled: state.isBiometricsEnabled }),
    }
  )
);
