import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApiKey } from '../context/ApiKeyContext';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { ArrowLeft, Key, Eye, EyeOff, Save, Trash2, Info, Sparkles } from 'lucide-react-native';

export const ApiKeySettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { customApiKey, setCustomApiKey, clearCustomApiKey, hasCustomApiKey } = useApiKey();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [apiKey, setApiKeyLocal] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showAlert(
        'Hata',
        'Lütfen geçerli bir API key giriniz.',
        [{ text: 'Tamam' }],
        'error'
      );
      return;
    }

    if (!apiKey.trim().startsWith('AIza')) {
      showAlert(
        'Uyarı',
        'Girdiğiniz key geçerli bir Gemini API key formatında görünmüyor. Yine de kaydetmek istiyor musunuz?',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Kaydet',
            onPress: async () => {
              await saveKey();
            },
          },
        ],
        'warning'
      );
      return;
    }

    await saveKey();
  };

  const saveKey = async () => {
    try {
      await setCustomApiKey(apiKey.trim());
      showAlert(
        'Başarılı',
        'API Key kaydedildi. Artık AI Chat ve AI CFO kendi API key\'inizi kullanacak.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }],
        'success'
      );
    } catch (error) {
      showAlert(
        'Hata',
        'API Key kaydedilirken bir hata oluştu.',
        [{ text: 'Tamam' }],
        'error'
      );
    }
  };

  const handleClear = () => {
    showAlert(
      'API Key\'i Sil',
      'Kendi API key\'inizi silmek istediğinizden emin misiniz? Varsayılan key kullanılacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCustomApiKey();
              setApiKeyLocal('');
              showAlert(
                'Başarılı',
                'API Key silindi. Varsayılan key kullanılacak.',
                [{ text: 'Tamam' }],
                'success'
              );
            } catch (error) {
              showAlert(
                'Hata',
                'API Key silinirken bir hata oluştu.',
                [{ text: 'Tamam' }],
                'error'
              );
            }
          },
        },
      ],
      'warning'
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header with Dashboard Style Gradient - Edge to Edge */}
      <View style={styles.modernHeader}>
        <LinearGradient
          colors={['#FF0080', '#7928CA', '#0070F3', '#00DFD8']}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.decorativePattern}>
            <View style={styles.patternCircle1} />
            <View style={styles.patternCircle2} />
            <View style={styles.patternCircle3} />
          </View>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <View style={styles.backButtonCircle}>
                <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.subtitle}>Entegrasyon</Text>
              <Text style={styles.screenTitle}>API Key Ayarları</Text>
            </View>
            <View style={styles.headerIcon}>
              <Key size={22} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: 'rgba(147, 51, 234, 0.1)', borderColor: colors.purple.primary }]}>
          <View style={styles.infoHeader}>
            <Info size={20} color={colors.purple.primary} strokeWidth={2.5} />
            <Text style={[styles.infoTitle, { color: colors.purple.primary }]}>
              Neden Kendi API Key'inizi Kullanmalısınız?
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>
            • Sınırsız kullanım - Kendi limitinizi belirleyin{'\n'}
            • Daha hızlı yanıtlar - Kendi quota'nız{'\n'}
            • Gizlilik - Sorularınız sadece size ait{'\n'}
            • Ücretsiz - Google Gemini API ücretsiz tier sunuyor
          </Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statusLabel, { color: colors.text.tertiary }]}>
            Mevcut Durum
          </Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: hasCustomApiKey ? '#22c55e' : '#f59e0b' }
            ]} />
            <Text style={[styles.statusText, { color: colors.text.primary }]}>
              {hasCustomApiKey ? 'Kendi API Key\'inizi kullanıyorsunuz' : 'Varsayılan API Key kullanılıyor'}
            </Text>
          </View>
        </View>

        {/* API Key Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Google Gemini API Key
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
            <Key size={20} color={colors.text.tertiary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              value={apiKey}
              onChangeText={setApiKeyLocal}
              placeholder="AIzaSy..."
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowKey(!showKey)}>
              {showKey ? (
                <EyeOff size={20} color={colors.text.tertiary} strokeWidth={2} />
              ) : (
                <Eye size={20} color={colors.text.tertiary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* How to Get API Key */}
        <View style={[styles.guideCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.guideTitle, { color: colors.text.primary }]}>
            🔑 API Key Nasıl Alınır?
          </Text>
          <View style={styles.guideSteps}>
            <Text style={[styles.guideStep, { color: colors.text.secondary }]}>
              1. Google AI Studio'ya gidin:{'\n'}
              <Text style={{ color: colors.purple.light }}>https://aistudio.google.com/</Text>
            </Text>
            <Text style={[styles.guideStep, { color: colors.text.secondary }]}>
              2. Google hesabınızla giriş yapın
            </Text>
            <Text style={[styles.guideStep, { color: colors.text.secondary }]}>
              3. "Create API Key" butonuna tıklayın
            </Text>
            <Text style={[styles.guideStep, { color: colors.text.secondary }]}>
              4. API Key'inizi kopyalayıp buraya yapıştırın
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <LinearGradient
              colors={[colors.purple.primary, colors.purple.secondary]}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Save size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </LinearGradient>
          </TouchableOpacity>

          {hasCustomApiKey && (
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.error }]}
              onPress={handleClear}
            >
              <Trash2 size={20} color={colors.error} strokeWidth={2.5} />
              <Text style={[styles.clearButtonText, { color: colors.error }]}>
                API Key'i Sil
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Custom Alert */}
      {AlertComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  modernHeader: {
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#7928CA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  headerGradient: {
    position: 'relative',
    overflow: 'hidden',
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -80,
    right: -60,
  },
  patternCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -50,
    left: -40,
  },
  patternCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 50,
    left: '40%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    marginRight: 8,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 2,
    letterSpacing: 0.5,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
  statusCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    fontWeight: '600',
  },
  guideCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  guideSteps: {
    gap: 12,
  },
  guideStep: {
    fontSize: 14,
    lineHeight: 22,
  },
  buttonGroup: {
    gap: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
