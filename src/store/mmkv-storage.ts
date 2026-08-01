import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

/**
 * High-performance synchronous storage for Zustand using react-native-mmkv.
 * MMKV is significantly faster than AsyncStorage and works synchronously.
 */
export const storage = createMMKV({
  id: 'app-storage',
  encryptionKey: 'your-secure-key' // Optional: encryption for finance data
});

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.remove(name);
  },
};
