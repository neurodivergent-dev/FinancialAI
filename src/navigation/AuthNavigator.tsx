import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { ApiKeySettingsScreen } from '../screens/ApiKeySettingsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useOnboardingStore } from '../store/useOnboardingStore';

const Stack = createStackNavigator();

export const AuthenticatedNavigator = () => {
  const { isCompleted, checkOnboarding, completeOnboarding } = useOnboardingStore();

  useEffect(() => {
    checkOnboarding();
  }, []);

  if (isCompleted === null) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Kök Neden Çözümü: Eğer onboarding bitmemişse İLK EKRAN olarak Onboarding'i göster */}
      {!isCompleted ? (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen 
              {...props} 
              onComplete={async () => {
                await completeOnboarding();
                // Store güncellendiğinde bu Navigator yeniden render olacak 
                // ve 'Main' ekranı otomatik olarak aktifleşecek.
              }} 
            />
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Group>
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="ApiKeySettings" component={ApiKeySettingsScreen} />
          </Stack.Group>
          <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
};
