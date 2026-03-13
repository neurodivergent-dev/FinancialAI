import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { gradients } from '../theme/colors';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const ForgotPasswordScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={gradients.purple}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={styles.headerIcon}>
              <Mail size={40} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.headerTitle}>Şifremi Unuttum</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={[styles.message, { color: colors.text.primary }]}>
          Şifre sıfırlama özelliği şu an için devre dışıdır.
        </Text>
        <TouchableOpacity
          style={[styles.backButtonLarge, { backgroundColor: colors.purple.primary }]}
          onPress={handleGoBack}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 48,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    position: 'absolute',
    left: 24,
    top: 24,
  },
  headerIcon: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  backButtonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
