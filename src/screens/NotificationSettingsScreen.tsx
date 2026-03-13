import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { ArrowLeft, Bell, Clock, TrendingUp, Calendar, DollarSign, Send } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';

export const NotificationSettingsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, requestPermissions, hasPermission } = useNotifications();
  const { showAlert, AlertComponent } = useCustomAlert();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        showAlert(
          t('settings.notificationSettings.permissionRequired'),
          t('settings.notificationSettings.permissionMessage'),
          [{ text: t('common.ok') || 'Tamam' }],
          'warning'
        );
        return;
      }
    }

    await updateSettings({ enabled: value });

    if (value) {
      showAlert(
        t('settings.notificationSettings.enabledTitle'),
        t('settings.notificationSettings.enabledMessage'),
        [{ text: t('common.ok') || 'Tamam' }],
        'success'
      );
    }
  };

  const handleToggleSetting = async (key: keyof typeof settings, value: boolean) => {
    if (!settings.enabled && value) {
      showAlert(
        t('settings.notificationSettings.disabledTitle'),
        t('settings.notificationSettings.disabledMessage'),
        [{ text: t('common.ok') || 'Tamam' }],
        'warning'
      );
      return;
    }

    await updateSettings({ [key]: value });
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');

    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      await updateSettings({ dailyReminderTime: timeString });
    }
  };

  const getTimeDate = () => {
    const [hours, minutes] = settings.dailyReminderTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  const sendTestNotification = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        showAlert(
          t('settings.notificationSettings.permissionRequired'),
          t('settings.notificationSettings.permissionMessage'),
          [{ text: t('common.ok') || 'Tamam' }],
          'warning'
        );
        return;
      }
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
        title: t('settings.notificationSettings.testTitle'),
        body: t('settings.notificationSettings.testBody'),
          sound: true,
          data: { type: 'test' },
          priority: Notifications.AndroidNotificationPriority.MAX, // Maximum priority
        },
        trigger: {
          seconds: 2,
          channelId: 'default', // Android channel
        },
      });

      showAlert(
        t('settings.notificationSettings.testSentTitle'),
        t('settings.notificationSettings.testSentMessage'),
        [{ text: t('common.ok') || 'Tamam' }],
        'success'
      );
    } catch (error) {
      showAlert(
        t('settings.notificationSettings.testError'),
        t('settings.notificationSettings.testErrorMessage'),
        [{ text: t('common.ok') || 'Tamam' }],
        'error'
      );
    }
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
              <Text style={styles.subtitle}>{t('settings.title')}</Text>
              <Text style={styles.screenTitle}>{t('settings.notificationSettings.title')}</Text>
            </View>
            <View style={styles.headerIcon}>
              <Bell size={22} color="#FFFFFF" strokeWidth={2} />
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Toggle */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.notificationSettings.general')}
          </Text>
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Bell size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  {t('settings.notificationSettings.enableNotifications')}
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {t('settings.notificationSettings.enableNotificationsSub', { action: settings.enabled ? t('settings.notificationSettings.actionClose') : t('settings.notificationSettings.actionOpen') })}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border.secondary, true: colors.purple.primary }}
              thumbColor={colors.text.primary}
            />
          </View>
        </View>

        {/* Permission Status */}
        {!hasPermission && (
          <View style={[styles.warningCard, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#f59e0b' }]}>
            <Text style={[styles.warningText, { color: colors.text.primary }]}>
              {t('settings.notificationSettings.noPermission')}
            </Text>
          </View>
        )}

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.notificationSettings.types')}
          </Text>

          {/* Daily Reminder */}
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Clock size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  {t('settings.notificationSettings.dailyReminder')}
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {t('settings.notificationSettings.dailyReminderSub', { time: settings.dailyReminderTime })}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.dailyReminder}
              onValueChange={(value) => handleToggleSetting('dailyReminder', value)}
              trackColor={{ false: colors.border.secondary, true: colors.purple.primary }}
              thumbColor={colors.text.primary}
              disabled={!settings.enabled}
            />
          </View>

          {/* Time Picker for Daily Reminder */}
          {settings.dailyReminder && settings.enabled && (
            <TouchableOpacity
              style={[styles.timePickerButton, { backgroundColor: colors.cardBackground }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={18} color={colors.purple.light} strokeWidth={2.5} />
              <Text style={[styles.timePickerText, { color: colors.text.primary }]}>
                {t('settings.notificationSettings.reminderTime', { time: settings.dailyReminderTime })}
              </Text>
            </TouchableOpacity>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={getTimeDate()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          {/* Payment Reminders */}
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <DollarSign size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  {t('settings.notificationSettings.paymentReminders')}
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {t('settings.notificationSettings.paymentRemindersSub')}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.paymentReminders}
              onValueChange={(value) => handleToggleSetting('paymentReminders', value)}
              trackColor={{ false: colors.border.secondary, true: colors.purple.primary }}
              thumbColor={colors.text.primary}
              disabled={!settings.enabled}
            />
          </View>

          {/* Budget Alerts */}
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <TrendingUp size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  {t('settings.notificationSettings.budgetAlerts')}
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {t('settings.notificationSettings.budgetAlertsSub')}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.budgetAlerts}
              onValueChange={(value) => handleToggleSetting('budgetAlerts', value)}
              trackColor={{ false: colors.border.secondary, true: colors.purple.primary }}
              thumbColor={colors.text.primary}
              disabled={!settings.enabled}
            />
          </View>

          {/* Weekly Reports */}
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Calendar size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  {t('settings.notificationSettings.weeklyReports')}
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {t('settings.notificationSettings.weeklyReportsSub')}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.weeklyReports}
              onValueChange={(value) => handleToggleSetting('weeklyReports', value)}
              trackColor={{ false: colors.border.secondary, true: colors.purple.primary }}
              thumbColor={colors.text.primary}
              disabled={!settings.enabled}
            />
          </View>
        </View>

        {/* Test Notification Button */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            {t('settings.notificationSettings.testSection')}
          </Text>
          <TouchableOpacity
            style={styles.testButton}
            onPress={sendTestNotification}
          >
            <LinearGradient
              colors={[colors.purple.primary, colors.purple.secondary]}
              style={styles.testButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Send size={20} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.testButtonText}>{t('settings.notificationSettings.sendTest')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoTitle, { color: colors.text.primary }]}>
            {t('settings.notificationSettings.tipsTitle')}
          </Text>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>
            • {t('settings.notificationSettings.tip1')}{'\n'}
            • {t('settings.notificationSettings.tip2')}{'\n'}
            • {t('settings.notificationSettings.tip3')}
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  timePickerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  warningCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  testButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  testButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
