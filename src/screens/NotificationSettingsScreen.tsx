import React, { useState } from 'react';
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
          'İzin Gerekli',
          'Bildirimler için uygulama izni vermeniz gerekmektedir. Lütfen ayarlardan bildirimleri açınız.',
          [{ text: 'Tamam' }],
          'warning'
        );
        return;
      }
    }

    await updateSettings({ enabled: value });

    if (value) {
      showAlert(
        'Bildirimler Açıldı',
        'Artık önemli finansal hatırlatmalar alacaksınız.',
        [{ text: 'Tamam' }],
        'success'
      );
    }
  };

  const handleToggleSetting = async (key: keyof typeof settings, value: boolean) => {
    if (!settings.enabled && value) {
      showAlert(
        'Bildirimler Kapalı',
        'Bu özelliği kullanmak için önce bildirimleri açmanız gerekmektedir.',
        [{ text: 'Tamam' }],
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
          'İzin Gerekli',
          'Test bildirimi göndermek için bildirim izni vermeniz gerekmektedir.',
          [{ text: 'Tamam' }],
          'warning'
        );
        return;
      }
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Test Bildirimi',
          body: 'Harika! Bildirimler düzgün çalışıyor. Financial AI ile finansal hedeflerinize ulaşın!',
          sound: true,
          data: { type: 'test' },
          priority: Notifications.AndroidNotificationPriority.MAX, // Maksimum öncelik
        },
        trigger: {
          seconds: 2,
          channelId: 'default', // Android kanalı
        },
      });

      showAlert(
        'Test Bildirimi Gönderildi',
        'Bildirim 2 saniye içinde gelecek!',
        [{ text: 'Tamam' }],
        'success'
      );
    } catch (error) {
      showAlert(
        'Hata',
        'Test bildirimi gönderilemedi. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }],
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
              <Text style={styles.subtitle}>Ayarlar</Text>
              <Text style={styles.screenTitle}>Bildirimler</Text>
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
            Genel
          </Text>
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Bell size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  Bildirimleri Aç
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  Tüm bildirimleri {settings.enabled ? 'kapat' : 'aç'}
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
              ⚠️ Bildirim izni verilmedi. Bildirimler çalışmayacaktır. Lütfen uygulama ayarlarından izin veriniz.
            </Text>
          </View>
        )}

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Bildirim Türleri
          </Text>

          {/* Daily Reminder */}
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Clock size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  Günlük Hatırlatma
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  Her gün {settings.dailyReminderTime} - Finansal kontrol hatırlatması
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
                Hatırlatma Saati: {settings.dailyReminderTime}
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
              <View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  Ödeme Hatırlatmaları
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  Yaklaşan taksit ve borç ödemeleri
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
              <View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  Bütçe Uyarıları
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  Bütçe aşımı ve hedef bildirimleri
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
              <View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>
                  Haftalık Raporlar
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  Her Pazartesi finansal özet raporu
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
            Test
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
              <Text style={styles.testButtonText}>Test Bildirimi Gönder</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoTitle, { color: colors.text.primary }]}>
            📱 Bildirim İpuçları
          </Text>
          <Text style={[styles.infoText, { color: colors.text.secondary }]}>
            • Bildirimleri kapatırsanız, önemli ödeme hatırlatmalarını kaçırabilirsiniz.{'\n'}
            • Günlük hatırlatmalar, finansal disiplininizi korumanıza yardımcı olur.{'\n'}
            • Tüm bildirimler tamamen opsiyoneldir ve istediğiniz zaman değiştirebilirsiniz.
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
