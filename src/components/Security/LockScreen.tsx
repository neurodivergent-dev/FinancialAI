import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fingerprint, Lock, ShieldCheck } from 'lucide-react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTheme } from '../../context/ThemeContext';
import { useSecurityStore } from '../../store/useSecurityStore';
import { gradients } from '../../theme/colors';

export const LockScreen = () => {
  const { colors } = useTheme();
  const { setLocked } = useSecurityStore();

  const handleAuthentication = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Unlock if biometrics are not available or not defined (fallback)
        setLocked(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Finansal verilerinize erişmek için doğrulama yapın',
        fallbackLabel: 'Şifre Kullan',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setLocked(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  useEffect(() => {
    handleAuthentication();
    
    // Disable back button when on lock screen
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  return (
    <LinearGradient
      colors={gradients.purple}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.pulse1} />
          <View style={styles.pulse2} />
          <View style={styles.mainIcon}>
            <Lock size={48} color="#FFFFFF" strokeWidth={2} />
          </View>
        </View>

        <Text style={styles.title}>Uygulama Kilitli</Text>
        <Text style={styles.subtitle}>
          Lütfen devam etmek için biyometrik doğrulamayı tamamlayın
        </Text>

        <TouchableOpacity 
          style={styles.authButton} 
          onPress={handleAuthentication}
          activeOpacity={0.8}
        >
          <Fingerprint size={32} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.authButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ShieldCheck size={20} color="rgba(255, 255, 255, 0.6)" />
        <Text style={styles.footerText}>Uçtan Uca Güvenli</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  mainIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pulse1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pulse2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
});
