import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { View, StyleSheet, Platform, AppState } from 'react-native';
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
import { useSecurityStore } from './src/store/useSecurityStore';
import { LockScreen } from './src/components/Security/LockScreen';

const AppContent = () => {
  const { theme, colors, isDarkMode } = useTheme();
  const { isBiometricsEnabled, isLocked, setLocked } = useSecurityStore();

  // Biyometrik Kilit Mantığı: Uygulama her açıldığında kilitle
  useEffect(() => {
    if (isBiometricsEnabled) {
      setLocked(true);
    }

    // Uygulama arka plana gidip geri geldiğinde tekrar kilitle
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (isBiometricsEnabled && nextAppState === 'active') {
        setLocked(true);
      }
    });

    return () => subscription.remove();
  }, [isBiometricsEnabled]);

  // Sync System Navigation Bar Buttons (Android) with App Theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      const syncSystemBars = async () => {
        try {
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
      card: colors.background,
      text: colors.text.primary,
      border: 'transparent',
      notification: colors.purple.light,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        style={isDarkMode ? 'light' : 'dark'} 
        translucent={Platform.OS === 'ios'} 
        backgroundColor={Platform.OS === 'android' ? colors.background : undefined}
      />
      
      {/* Eğer kilitliyse LockScreen göster, değilse navigasyona devam et */}
      {isLocked ? (
        <LockScreen />
      ) : (
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          <AuthenticatedNavigator />
        </NavigationContainer>
      )}
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
                      <KeyboardProvider statusBarTranslucent={false}>
                        <AppContent />
                      </KeyboardProvider>
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
