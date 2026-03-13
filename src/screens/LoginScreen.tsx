import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { gradients } from '../theme/colors';
import { Shield, UserRound } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { useCustomAlert } from '../hooks/useCustomAlert';

export const LoginScreen = () => {
  const { colors } = useTheme();
  const { loginAsGuest } = useAuth();
  const { showAlert, AlertComponent } = useCustomAlert();

  const handleGuestLogin = async () => {
    try {
      const success = await loginAsGuest();
      if (success) {
        // Success alert is optional since AuthNavigator will switch automatically
      } else {
        showAlert('Misafir Girişi Başarısız', 'Misafir olarak giriş yapılamadı.', [{ text: 'Tamam' }], 'error');
      }
    } catch (error) {
      showAlert('Misafir Girişi Başarısız', 'Bir hata oluştu. Lütfen tekrar deneyin.', [{ text: 'Tamam' }], 'error');
    }
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
            <View style={styles.headerIcon}>
              <Shield size={40} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.headerTitle}>Financial AI</Text>
            <Text style={styles.headerSubtitle}>Akıllı Finans Yönetimi</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Hoş Geldiniz
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              Hızlı ve güvenli başlangıç için misafir olarak devam edin.
            </Text>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestLogin}
            >
              <LinearGradient
                colors={['#6B7280', '#4B5563', '#374151']}
                style={styles.guestButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.guestButtonContent}>
                  <UserRound size={20} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.guestButtonText}>
                    Misafir Olarak Devam Et
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              <Text style={[styles.infoText, { color: colors.text.tertiary }]}>
                Şu anda sadece misafir girişi desteklenmektedir. Tüm verileriniz cihazınızda güvenle saklanacaktır.
              </Text>
            </View>

            <SafeAreaView edges={['bottom']}>
              <View style={styles.bottomSpacer} />
            </SafeAreaView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 48,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.5,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 48,
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 48,
    letterSpacing: 0.2,
  },
  guestButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 32,
  },
  guestButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  guestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  guestButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});