import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

export type BottomTabParamList = {
  Dashboard: undefined;
  Assets: undefined;
  Liabilities: undefined;
  Receivables: undefined;
  Installments: undefined;
  Chat: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<BottomTabParamList>;
  ProfileSettings: undefined;
  NotificationSettings: undefined;
  ApiKeySettings: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  Paywall: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<
  RootStackParamList,
  T
>;

export type HomeTabScreenProps<T extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;
