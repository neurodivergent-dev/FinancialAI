import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { gradients } from '../theme/colors';

export const PrivacyPolicyScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={gradients.purple}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <View style={styles.backButtonCircle}>
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.subtitle}>{t('settings.privacyPolicy.legal')}</Text>
            <Text style={styles.screenTitle}>{t('settings.privacyPolicy.title')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Shield size={22} color="#FFFFFF" strokeWidth={2} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.intro.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.intro.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.collectedData.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            <Text style={{ fontWeight: '700' }}>{t('settings.privacyPolicy.sections.collectedData.personalInfo')}{'\n'}</Text>
            {t('settings.privacyPolicy.sections.collectedData.personalInfoList')}{'\n\n'}
            <Text style={{ fontWeight: '700' }}>{t('settings.privacyPolicy.sections.collectedData.financialInfo')}{'\n'}</Text>
            {t('settings.privacyPolicy.sections.collectedData.financialInfoList')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.useOfData.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.useOfData.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.storageAndSecurity.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            <Text style={{ fontWeight: '700' }}>{t('settings.privacyPolicy.sections.storageAndSecurity.localStorage')}{'\n'}</Text>
            {t('settings.privacyPolicy.sections.storageAndSecurity.localStorageDesc')}{'\n\n'}
            <Text style={{ fontWeight: '700' }}>{t('settings.privacyPolicy.sections.storageAndSecurity.securityMeasures')}{'\n'}</Text>
            {t('settings.privacyPolicy.sections.storageAndSecurity.securityMeasuresList')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.thirdParty.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.thirdParty.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.aiAndML.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.aiAndML.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.cookies.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.cookies.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.userRights.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.userRights.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.childrenPrivacy.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.childrenPrivacy.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.policyChanges.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.policyChanges.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.privacyPolicy.sections.contact.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.privacyPolicy.sections.contact.content')}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            {t('settings.privacyPolicy.lastUpdate')}
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.text.tertiary }]}>
            {t('settings.privacyPolicy.footerText')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  headerGradient: {
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: 8,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
});
