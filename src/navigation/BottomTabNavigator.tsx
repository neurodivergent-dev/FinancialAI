import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  Coins,
  CreditCard,
  HandCoins,
  Calendar,
  MessageCircle,
  Settings
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AssetsScreen } from '../screens/AssetsScreen';
import { LiabilitiesScreen } from '../screens/LiabilitiesScreen';
import { ReceivablesScreen } from '../screens/ReceivablesScreen';
import { InstallmentsScreen } from '../screens/InstallmentsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const TabIcon = ({
  Icon,
  focused,
  activeColor,
  inactiveColor
}: {
  Icon: LucideIcon;
  focused: boolean;
  activeColor: string;
  inactiveColor: string;
}) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    {focused && (
      <LinearGradient
        colors={['#FF0080', '#7928CA']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    )}
    <Icon
      size={24}
      color={focused ? '#FFFFFF' : inactiveColor}
      strokeWidth={focused ? 2.5 : 2}
    />
  </View>
);

export const BottomTabNavigator = () => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: colors.cardBackground,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 50 + insets.bottom,
          paddingBottom: insets.bottom,
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: colors.text.tertiary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutDashboard} focused={focused} activeColor="#FFFFFF" inactiveColor={colors.text.tertiary} />,
        }}
      />
      <Tab.Screen
        name="Assets"
        component={AssetsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Coins} focused={focused} activeColor="#FFFFFF" inactiveColor={colors.text.tertiary} />,
        }}
      />
      <Tab.Screen
        name="Liabilities"
        component={LiabilitiesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={CreditCard} focused={focused} activeColor="#FFFFFF" inactiveColor={colors.text.tertiary} />,
        }}
      />
      <Tab.Screen
        name="Receivables"
        component={ReceivablesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={HandCoins} focused={focused} activeColor="#FFFFFF" inactiveColor={colors.text.tertiary} />,
        }}
      />
      <Tab.Screen
        name="Installments"
        component={InstallmentsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Calendar} focused={focused} activeColor="#FFFFFF" inactiveColor={colors.text.tertiary} />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={MessageCircle} focused={focused} activeColor="#FFFFFF" inactiveColor={colors.text.tertiary} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Settings} focused={focused} activeColor="#FFFFFF" inactiveColor={colors.text.tertiary} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
});
