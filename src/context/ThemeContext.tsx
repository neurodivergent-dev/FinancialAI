import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeMode = 'dark' | 'light' | 'system';
type ActualTheme = 'dark' | 'light';

interface ThemeContextType {
  themeMode: ThemeMode;
  theme: ActualTheme;
  amoledEnabled: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setAmoledEnabled: (enabled: boolean) => void;
  colors: typeof darkColors | typeof lightColors;
  isDarkMode: boolean;
}

const getDarkColors = (isAmoled: boolean) => ({
  background: isAmoled ? '#000000' : '#0F172A', // Pure black vs Dark Slate
  cardBackground: isAmoled ? '#0a0a0a' : '#1E293B',
  purple: {
    primary: '#9333EA',
    secondary: '#A855F7',
    light: '#C084FC',
    dark: '#7E22CE',
    darker: '#6B21A8',
  },
  accent: {
    cyan: '#06B6D4',
    pink: '#EC4899',
    green: '#10B981',
    red: '#EF4444',
  },
  success: '#00ff9d',
  error: '#ff4757',
  warning: '#FCD34D',
  text: {
    primary: '#FFFFFF',
    secondary: isAmoled ? '#A1A1AA' : '#94A3B8',
    tertiary: isAmoled ? '#71717A' : '#64748B',
  },
  border: {
    primary: 'rgba(147, 51, 234, 0.3)',
    secondary: isAmoled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
  },
});

const lightColors = {
  background: '#F8FAFC', // Lighter Slate
  cardBackground: '#FFFFFF',
  purple: {
    primary: '#9333EA',
    secondary: '#A855F7',
    light: '#C084FC',
    dark: '#7E22CE',
    darker: '#6B21A8',
  },
  accent: {
    cyan: '#06B6D4',
    pink: '#EC4899',
    green: '#10B981',
    red: '#EF4444',
  },
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
  },
  border: {
    primary: 'rgba(147, 51, 234, 0.3)',
    secondary: 'rgba(0, 0, 0, 0.05)',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [amoledEnabled, setAmoledEnabledState] = useState(false);
  const [actualTheme, setActualTheme] = useState<ActualTheme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setActualTheme(systemColorScheme === 'light' ? 'light' : 'dark');
    } else {
      setActualTheme(themeMode as ActualTheme);
    }
  }, [themeMode, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      const savedAmoled = await AsyncStorage.getItem('amoledEnabled');
      
      if (savedMode) setThemeModeState(savedMode as ThemeMode);
      if (savedAmoled) setAmoledEnabledState(savedAmoled === 'true');
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const setAmoledEnabled = async (enabled: boolean) => {
    setAmoledEnabledState(enabled);
    try {
      await AsyncStorage.setItem('amoledEnabled', String(enabled));
    } catch (error) {
      console.error('Error saving amoled mode:', error);
    }
  };

  const colors = actualTheme === 'dark' ? getDarkColors(amoledEnabled) : lightColors;

  return (
    <ThemeContext.Provider 
      value={{ 
        themeMode, 
        theme: actualTheme, 
        amoledEnabled,
        setThemeMode, 
        setAmoledEnabled,
        colors,
        isDarkMode: actualTheme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export { lightColors };
export const darkColors = getDarkColors(false);
