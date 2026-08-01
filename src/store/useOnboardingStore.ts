import { create } from 'zustand';
import { storage } from './mmkv-storage';

interface OnboardingStore {
  isCompleted: boolean | null;
  checkOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const ONBOARDING_KEY = '@onboarding_completed';

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  isCompleted: storage.getString(ONBOARDING_KEY) === 'true',

  checkOnboarding: () => {
    const completed = storage.getString(ONBOARDING_KEY);
    set({ isCompleted: completed === 'true' });
  },

  completeOnboarding: () => {
    storage.set(ONBOARDING_KEY, 'true');
    set({ isCompleted: true });
  },

  resetOnboarding: () => {
    storage.remove(ONBOARDING_KEY);
    set({ isCompleted: false });
  },
}));
