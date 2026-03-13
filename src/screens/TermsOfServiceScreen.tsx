import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, FileText } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { gradients } from '../theme/colors';

export const TermsOfServiceScreen = ({ navigation }: any) => {
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
            <Text style={styles.subtitle}>{t('settings.termsOfService.legal')}</Text>
            <Text style={styles.screenTitle}>{t('settings.termsOfService.title')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <FileText size={22} color="#FFFFFF" strokeWidth={2} />
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
            {t('settings.termsOfService.sections.acceptance.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.acceptance.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.description.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.description.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.responsibilities.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.responsibilities.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.dataSecurity.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.dataSecurity.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.aiAdvisor.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.aiAdvisor.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.intellectualProperty.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.intellectualProperty.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.disclaimer.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.disclaimer.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.changes.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.changes.content')}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.termsOfService.sections.contact.title')}
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            {t('settings.termsOfService.sections.contact.content')}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text.tertiary }]}>
            {t('settings.termsOfService.lastUpdate')}
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
  },
});
