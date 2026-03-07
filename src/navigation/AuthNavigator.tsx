import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { ApiKeySettingsScreen } from '../screens/ApiKeySettingsScreen';
import { useAuth } from '../hooks/useAuth';
import { PaywallScreen } from '../screens/PaywallScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useOnboardingStore } from '../store/useOnboardingStore';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} options={{
      headerShown: false,
      gestureEnabled: false,
    }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{
      headerShown: false,
      gestureEnabled: true,
    }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{
      headerShown: false,
      gestureEnabled: true,
    }} />
    <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{
      headerShown: false,
      gestureEnabled: true,
    }} />
    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{
      headerShown: false,
      gestureEnabled: true,
    }} />
  </Stack.Navigator>
);

const OnboardingModalScreen = ({ navigation }: any) => {
  const { completeOnboarding } = useOnboardingStore();
  return (
    <OnboardingScreen onComplete={async () => {
      await completeOnboarding();
      navigation.goBack();
    }} />
  );
};

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Group>
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="ApiKeySettings" component={ApiKeySettingsScreen} />
    </Stack.Group>
    <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="OnboardingModal" component={OnboardingModalScreen} />
    </Stack.Group>
  </Stack.Navigator>
);

export const AuthenticatedNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const { isCompleted, checkOnboarding, completeOnboarding } = useOnboardingStore();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async () => {
    await completeOnboarding();
  };

  if (isCompleted === null) {
    return null;
  }

  // Eğer onboarding tamamlanmamışsa, auth durumuna bakmaksızın onboarding göster
  if (!isCompleted) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Onboarding tamamlanmışsa ama hala yükleniyorsa bekle
  if (loading) {
    return null;
  }

  // Son olarak giriş durumuna göre stack göster
  return isAuthenticated ? <AppStack /> : <AuthStack />;
};
