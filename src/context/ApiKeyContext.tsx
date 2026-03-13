import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiKeyContextType {
  customApiKey: string;
  setCustomApiKey: (key: string) => Promise<void>;
  clearCustomApiKey: () => Promise<void>;
  hasCustomApiKey: boolean;
  getActiveApiKey: () => string;
  isAiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEY_STORAGE_KEY = '@custom_gemini_api_key';
const AI_ENABLED_STORAGE_KEY = '@ai_features_enabled';

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customApiKey, setCustomApiKeyState] = useState<string>('');
  const [isAiEnabled, setIsAiEnabledState] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [storedKey, storedEnabled] = await Promise.all([
        AsyncStorage.getItem(API_KEY_STORAGE_KEY),
        AsyncStorage.getItem(AI_ENABLED_STORAGE_KEY),
      ]);
      
      if (storedKey) {
        setCustomApiKeyState(storedKey);
        // Only load enabled state if key exists
        if (storedEnabled !== null) {
          setIsAiEnabledState(storedEnabled === 'true');
        }
      } else {
        setIsAiEnabledState(false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setCustomApiKey = async (key: string) => {
    try {
      const trimmedKey = key.trim();
      setCustomApiKeyState(trimmedKey);

      if (trimmedKey) {
        await AsyncStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
      } else {
        await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
        setIsAiEnabledState(false);
        await AsyncStorage.removeItem(AI_ENABLED_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  };

  const clearCustomApiKey = async () => {
    try {
      setCustomApiKeyState('');
      setIsAiEnabledState(false);
      await Promise.all([
        AsyncStorage.removeItem(API_KEY_STORAGE_KEY),
        AsyncStorage.removeItem(AI_ENABLED_STORAGE_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing API key:', error);
      throw error;
    }
  };

  const setAiEnabled = async (enabled: boolean) => {
    try {
      // Only allow enabling if key exists
      if (enabled && customApiKey.length === 0) {
        return;
      }
      
      setIsAiEnabledState(enabled);
      await AsyncStorage.setItem(AI_ENABLED_STORAGE_KEY, String(enabled));
    } catch (error) {
      console.error('Error saving AI enabled state:', error);
    }
  };

  const getActiveApiKey = () => {
    return customApiKey;
  };

  const hasCustomApiKey = customApiKey.length > 0;

  return (
    <ApiKeyContext.Provider
      value={{
        customApiKey,
        setCustomApiKey,
        clearCustomApiKey,
        hasCustomApiKey,
        getActiveApiKey,
        isAiEnabled,
        setAiEnabled,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey must be used within ApiKeyProvider');
  }
  return context;
};
