import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { ApiKeySettingsScreen } from '../screens/ApiKeySettingsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';
import { useOnboardingStore } from '../store/useOnboardingStore';

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

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
      {/* Root Cause Solution: If onboarding is not completed, show Onboarding as the FIRST SCREEN */}
      {!isCompleted ? (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen 
              {...props} 
              onComplete={async () => {
                await completeOnboarding();
                // When store is updated, this Navigator will re-render 
                // and 'Main' screen will automatically be activated.
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
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
          </Stack.Group>
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen name="Paywall" component={PaywallScreen} />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
};
