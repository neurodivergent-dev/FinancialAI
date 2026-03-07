import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ApiKeyProvider } from './src/context/ApiKeyContext';
import { AuthProvider } from './src/hooks/useAuth';
import { AuthenticatedNavigator } from './src/navigation/AuthNavigator';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { navigationRef } from './src/navigation/RootNavigation';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import * as NavigationBar from 'expo-navigation-bar';

const AppContent = () => {
  const { theme, colors, isDarkMode } = useTheme();

  // Sync System Navigation Bar Buttons (Android) with App Theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      const syncSystemBars = async () => {
        try {
          // In edge-to-edge mode, we only need to set the button style (light/dark)
          await NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark');
        } catch (e) {
          console.log('NavigationBar error:', e);
        }
      };
      syncSystemBars();
    }
  }, [isDarkMode]);

  const navigationTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.purple.primary,
      background: colors.background,
      card: colors.cardBackground,
      text: colors.text.primary,
      border: colors.border.secondary,
      notification: colors.purple.light,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <AuthenticatedNavigator />
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <ProfileProvider>
              <NotificationProvider>
                <ApiKeyProvider>
                  <AuthProvider>
                    <SubscriptionProvider>
                      <AppContent />
                    </SubscriptionProvider>
                  </AuthProvider>
                </ApiKeyProvider>
              </NotificationProvider>
            </ProfileProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
