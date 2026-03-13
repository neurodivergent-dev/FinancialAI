import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApiKey } from '../context/ApiKeyContext';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { ArrowLeft, Key, Eye, EyeOff, Save, Trash2, Info, Sparkles } from 'lucide-react-native';

export const ApiKeySettingsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    customApiKey, 
    setCustomApiKey, 
    clearCustomApiKey, 
    hasCustomApiKey,
    isAiEnabled,
    setAiEnabled 
  } = useApiKey();
  const { showAlert, AlertComponent } = useCustomAlert();

  const [apiKey, setApiKeyLocal] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showAlert(
        t('common.error'),
        t('settings.apiKeySettings.invalidKey'),
        [{ text: t('common.save') }],
        'error'
      );
      return;
    }

    if (!apiKey.trim().startsWith('AIza')) {
      showAlert(
        t('common.warning'),
        t('settings.apiKeySettings.formatWarning'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.save'),
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
        t('common.success'),
        t('settings.apiKeySettings.saveSuccess'),
        [{ text: t('common.save'), onPress: () => navigation.goBack() }],
        'success'
      );
    } catch (error) {
      showAlert(
        t('common.error'),
        t('settings.apiKeySettings.saveError'),
        [{ text: t('common.save') }],
        'error'
      );
    }
  };

  const handleClear = () => {
    showAlert(
      t('settings.apiKeySettings.deleteTitle'),
      t('settings.apiKeySettings.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCustomApiKey();
              setApiKeyLocal('');
              showAlert(
                t('common.success'),
                t('settings.apiKeySettings.deleteSuccess'),
                [{ text: t('common.save') }],
                'success'
              );
            } catch (error) {
              showAlert(
                t('common.error'),
                t('settings.apiKeySettings.saveError'),
                [{ text: t('common.save') }],
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
      {/* Modern Header */}
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
              <Text style={styles.subtitle}>{t('settings.apiKeySettings.integration')}</Text>
              <Text style={styles.screenTitle}>{t('settings.apiKeySettings.title')}</Text>
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
              {t('settings.apiKeySettings.howTo')}
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>
            {t('settings.apiKeySettings.description')}
          </Text>
        </View>

        {/* Status Card - Only shown if custom key is present */}
        {hasCustomApiKey && (
          <View style={[styles.statusCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.statusLabel, { color: colors.text.tertiary }]}>
              {t('settings.apiKeySettings.statusLabel')}
            </Text>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusDot,
                { backgroundColor: '#22c55e' }
              ]} />
              <Text style={[styles.statusText, { color: colors.text.primary }]}>
                {t('settings.apiKeySettings.customKeyActive')}
              </Text>
            </View>
          </View>
        )}

        {/* AI Features Toggle Card */}
        <View style={[styles.switchCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.switchHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}>
              <Sparkles size={20} color={colors.purple.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                {t('settings.apiKeySettings.isAiEnabled')}
              </Text>
              <Text style={[styles.switchDescription, { color: colors.text.tertiary }]}>
                {t('settings.apiKeySettings.isAiEnabledSub')}
              </Text>
            </View>
            <Switch
              value={isAiEnabled}
              onValueChange={setAiEnabled}
              disabled={!hasCustomApiKey}
              trackColor={{ false: '#767577', true: colors.purple.primary + '80' }}
              thumbColor={isAiEnabled ? colors.purple.primary : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          {!hasCustomApiKey && (
            <View style={styles.warningBox}>
              <Text style={[styles.warningText, { color: colors.text.tertiary }]}>
                {t('settings.apiKeySettings.warningNoKey')}
              </Text>
            </View>
          )}
        </View>

        {/* API Key Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.apiKeySettings.enterKey')}
          </Text>
          <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
            <Key size={20} color={colors.text.tertiary} strokeWidth={2} />
            <TextInput
              style={[styles.input, { color: colors.text.primary }]}
              value={apiKey}
              onChangeText={setApiKeyLocal}
              placeholder={t('settings.apiKeySettings.placeholder')}
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

        {/* Guide Card */}
        <View style={[styles.guideCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.guideTitle, { color: colors.text.primary }]}>
            {t('settings.apiKeySettings.guideTitle')}
          </Text>
          <View style={styles.guideSteps}>
            <Text style={[styles.guideStep, { color: colors.text.secondary }]}>
              {t('settings.apiKeySettings.guideStep1')}{'\n'}
              <Text style={{ color: colors.purple.light }}>https://aistudio.google.com/</Text>
            </Text>
            <Text style={[styles.guideStep, { color: colors.text.secondary }]}>
              {t('settings.apiKeySettings.guideStep2')}
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
              <Text style={styles.saveButtonText}>{t('settings.apiKeySettings.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {hasCustomApiKey && (
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.error }]}
              onPress={handleClear}
            >
              <Trash2 size={20} color={colors.error} strokeWidth={2.5} />
              <Text style={[styles.clearButtonText, { color: colors.error }]}>
                {t('settings.apiKeySettings.delete')}
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
    paddingBottom: 24,
  },
  decorativePattern: {
    ...StyleSheet.absoluteFillObject,
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
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  switchCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  switchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  switchDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  warningBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  warningText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    marginLeft: 12,
  },
  guideCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  guideSteps: {
    gap: 12,
  },
  guideStep: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  clearButton: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
