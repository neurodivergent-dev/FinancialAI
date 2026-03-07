import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingStore {
  isCompleted: boolean | null;
  checkOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  isCompleted: null,

  checkOnboarding: async () => {
    try {
      const completed = await AsyncStorage.getItem('@onboarding_completed');
      set({ isCompleted: completed === 'true' });
    } catch (error) {
      set({ isCompleted: true });
    }
  },

  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      set({ isCompleted: true });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem('@onboarding_completed');
      set({ isCompleted: false });
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  },
}));
