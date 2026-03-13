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
  Image,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, User, Bell, Download, Upload, Info, Trash2, DollarSign, Settings as SettingsIcon, ChevronRight, Key, BookOpen, Smartphone, ShieldCheck, Languages, FileText } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useProfile } from '../context/ProfileContext';
import { useSubscription } from '../context/SubscriptionContext';
import CurrencyModal from '../../components/CurrencyModal';
import { ThemeSelectionCard } from '../components/ThemeSelectionCard';
import { AboutScreen } from './AboutScreen';
import { gradients } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { useSecurityStore } from '../store/useSecurityStore';
import * as LocalAuthentication from 'expo-local-authentication';
import { LanguageSelectionModal } from '../components/Modals/LanguageSelectionModal';

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { colors, isDarkMode, amoledEnabled, setAmoledEnabled } = useTheme();
  const { isBiometricsEnabled, setBiometricsEnabled } = useSecurityStore();
  const { resetOnboarding } = useOnboardingStore();
  const { currency, currencySymbol } = useCurrency();
  const { profile } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();
  const { toggleDebugPremium } = useSubscription();
  const [tapCount, setTapCount] = useState(0);
  const {
    clearAllData,
    assets,
    liabilities,
    receivables,
    installments,
    addAsset,
    addLiability,
    addReceivable,
    addInstallment
  } = useFinanceStore();
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const settingsOptions = [
    { id: '1', title: t('settings.profile'), icon: User },
    { id: '2', title: t('settings.apiKey'), icon: Key },
    { id: '3', title: t('settings.notifications'), icon: Bell },
    { id: '4', title: t('settings.onboarding'), icon: BookOpen },
    { id: '5', title: t('settings.export'), icon: Download },
    { id: '6', title: t('settings.import'), icon: Upload },
    { id: '7', title: t('settings.about'), icon: Info },
    { id: '8', title: t('settings.privacyPolicy.title'), icon: ShieldCheck },
    { id: '9', title: t('settings.termsOfService.title'), icon: FileText },
  ];

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('@app_language', lng);
  };

  const handleToggleBiometrics = async (value: boolean) => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      showAlert(t('common.error'), t('settings.security.noHardware'), [{ text: t('common.completed') }], 'error');
      return;
    }

    if (!isEnrolled) {
      showAlert(t('common.error'), t('settings.security.notEnrolled'), [{ text: t('common.completed') }], 'error');
      return;
    }

    // Request verification both when opening and closing
    const actionText = value ? t('settings.security.actionActivate') : t('settings.security.actionDeactivate');
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('settings.security.authPrompt', { action: actionText }),
    });

    if (result.success) {
      setBiometricsEnabled(value);
      const statusText = value ? t('settings.security.enabled') : t('settings.security.disabled');
      showAlert(t('common.success'), t('settings.security.statusSuccess', { status: statusText }), [{ text: t('common.completed') }], 'success');
    }
    // If it fails, the switch will remain in its old state as the value hasn't changed
  };

  const handleVersionTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 7) {
      toggleDebugPremium();
      setTapCount(0);
    }
  };

  const handleDeleteAllData = () => {
    showAlert(
      t('settings.dataManagement.resetTitle'),
      t('settings.dataManagement.resetMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.dataManagement.resetButton'),
          style: 'destructive',
          onPress: async () => {
            try {
              clearAllData();
              await resetOnboarding();
              showAlert(t('common.success'), t('settings.dataManagement.resetSuccess'), [], 'success');
            } catch (error) {
              console.error('Reset error:', error);
              showAlert(t('common.error'), t('settings.dataManagement.resetError'), [], 'error');
            }
          }
        }
      ],
      'error'
    );
  };

  const handleImportData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importedData = JSON.parse(fileContent);

      if (!importedData.data) {
        showAlert(t('common.error'), t('settings.dataManagement.importFormatError'), [], 'error');
        return;
      }

      const exportDate = importedData.exportDate ? new Date(importedData.exportDate).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US') : '---';

      showAlert(
        t('settings.dataManagement.importTitle'),
        t('settings.dataManagement.importDesc', { date: exportDate }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('settings.import'),
            style: 'default',
            onPress: () => {
              try {
                clearAllData();
                if (importedData.data.assets && Array.isArray(importedData.data.assets)) {
                  importedData.data.assets.forEach((asset: any) => {
                    addAsset({
                      type: asset.type,
                      name: asset.name,
                      value: asset.value,
                      currency: asset.currency || 'TRY',
                      details: asset.details,
                    });
                  });
                }

                if (importedData.data.liabilities && Array.isArray(importedData.data.liabilities)) {
                  importedData.data.liabilities.forEach((liability: any) => {
                    addLiability({
                      type: liability.type,
                      name: liability.name,
                      currentDebt: liability.currentDebt,
                      totalLimit: liability.totalLimit,
                      dueDate: liability.dueDate,
                      debtorName: liability.debtorName,
                      details: liability.details,
                    });
                  });
                }

                if (importedData.data.receivables && Array.isArray(importedData.data.receivables)) {
                  importedData.data.receivables.forEach((receivable: any) => {
                    addReceivable({
                      debtor: receivable.debtor,
                      amount: receivable.amount,
                      dueDate: receivable.dueDate,
                      details: receivable.details,
                    });
                  });
                }

                if (importedData.data.installments && Array.isArray(importedData.data.installments)) {
                  importedData.data.installments.forEach((installment: any) => {
                    addInstallment({
                      name: installment.name,
                      installmentAmount: installment.installmentAmount,
                      endDate: installment.endDate,
                      remainingMonths: installment.remainingMonths,
                      details: installment.details,
                    });
                  });
                }

                showAlert(t('common.success'), t('settings.dataManagement.importSuccess'), [], 'success');
              } catch (error) {
                console.error('Import error:', error);
                showAlert(t('common.error'), t('settings.dataManagement.resetError'), [], 'error');
              }
            }
          }
        ],
        'warning'
      );
    } catch (error) {
      console.error('Import error:', error);
      showAlert(t('common.error'), t('settings.dataManagement.resetError'), [], 'error');
    }
  };

  const handleExportDataJSON = async () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        currency: currency,
        data: {
          assets,
          liabilities,
          receivables,
          installments,
        },
        summary: {
          totalAssets: assets.reduce((total, item) => total + (Number(item.value) || 0), 0),
          totalLiabilities: liabilities.reduce((total, item) => total + (Number(item.currentDebt) || 0), 0),
          totalReceivables: receivables.reduce((total, item) => total + (Number(item.amount) || 0), 0),
          totalInstallments: installments.reduce((total, item) => total + (Number(item.installmentAmount) || 0), 0),
        }
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const fileName = `FinancialAI_Export_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: t('settings.dataManagement.exportJsonTitle'),
          UTI: 'public.json',
        });
      } else {
        showAlert(t('common.success'), t('settings.dataManagement.exportSuccess', { path: fileUri }), [], 'success');
      }
    } catch (error) {
      console.error('Export JSON error:', error);
      showAlert(t('common.error'), t('settings.dataManagement.exportError'), [], 'error');
    }
  };

  const handleExportDataPDF = async () => {
    try {
      const totalAssets = assets.reduce((total, item) => total + (Number(item.value) || 0), 0);
      const totalLiabilities = liabilities.reduce((total, item) => total + (Number(item.currentDebt) || 0), 0);
      const totalReceivables = receivables.reduce((total, item) => total + (Number(item.amount) || 0), 0);
      const netWorth = totalAssets + totalReceivables - totalLiabilities;
      const exportDate = new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              padding: 40px;
              color: #1a1a1a;
            }
            h1 {
              color: #9333EA;
              border-bottom: 3px solid #9333EA;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            h2 {
              color: #4a5568;
              margin-top: 30px;
              border-left: 4px solid #9333EA;
              padding-left: 15px;
            }
            .summary {
              background: #f7f7f7;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .summary-item:last-child {
              border-bottom: none;
              font-weight: bold;
              font-size: 18px;
              color: #9333EA;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th {
              background: #9333EA;
              color: white;
              padding: 12px;
              text-align: left;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e0e0e0;
            }
            tr:hover {
              background: #f9f9f9;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
            .green { color: #22c55e; font-weight: bold; }
            .red { color: #ff4757; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>📊 Financial AI - ${t('settings.pdfReport.title')}</h1>
          <p><strong>${t('settings.pdfReport.date')}:</strong> ${exportDate}</p>
          <p><strong>${t('settings.pdfReport.currency')}:</strong> ${currency} (${currencySymbol})</p>

          ${profile.name || profile.email || profile.phone || profile.findeksScore || profile.salary || profile.additionalIncome ? `
          <div class="summary">
            <h2>👤 ${t('settings.profile')}</h2>
            ${profile.name ? `
            <div class="summary-item">
              <span>${t('settings.profileSettings.name')}:</span>
              <span style="font-weight: bold;">${profile.name}</span>
            </div>
            ` : ''}
            ${profile.email ? `
            <div class="summary-item">
              <span>${t('settings.profileSettings.email')}:</span>
              <span>${profile.email}</span>
            </div>
            ` : ''}
            ${profile.phone ? `
            <div class="summary-item">
              <span>${t('settings.profileSettings.phone')}:</span>
              <span>${profile.phone}</span>
            </div>
            ` : ''}
            ${profile.findeksScore ? `
            <div class="summary-item">
              <span>${t('settings.profileSettings.findeks')}:</span>
              <span style="font-weight: bold; color: #9333EA;">${profile.findeksScore}</span>
            </div>
            ` : ''}
            ${profile.salary ? `
            <div class="summary-item">
              <span>${t('settings.profileSettings.salary')}:</span>
              <span class="green">${currencySymbol}${Number(profile.salary).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
            ${profile.additionalIncome ? `
            <div class="summary-item">
              <span>${t('settings.profileSettings.additionalIncome')}:</span>
              <span class="green">${currencySymbol}${Number(profile.additionalIncome).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
            ${profile.salary && profile.additionalIncome ? `
            <div class="summary-item">
              <span>${t('dashboard.totalIncome')}:</span>
              <span style="font-weight: bold; color: #9333EA;">${currencySymbol}${(Number(profile.salary) + Number(profile.additionalIncome)).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
          </div>
          ` : ''}
 
          <div class="summary">
            <h2>💼 ${t('settings.pdfReport.summary')}</h2>
            <div class="summary-item">
              <span>${t('dashboard.totalAssets')}:</span>
              <span class="green">${currencySymbol}${totalAssets.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-item">
              <span>${t('dashboard.totalLiabilities')}:</span>
              <span class="red">${currencySymbol}${totalLiabilities.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-item">
              <span>${t('dashboard.totalReceivables')}:</span>
              <span class="green">${currencySymbol}${totalReceivables.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-item">
              <span>${t('settings.pdfReport.netWorth')}:</span>
              <span class="${netWorth >= 0 ? 'green' : 'red'}">${currencySymbol}${netWorth.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          ${assets.length > 0 ? `
          <h2>💰 ${t('finance.assets.title')}</h2>
          <table>
            <tr>
              <th>${t('finance.assets.nameLabel')}</th>
              <th>${t('finance.assets.typeLabel')}</th>
              <th>${t('finance.assets.amountLabel')}</th>
            </tr>
            ${assets.map(asset => `
              <tr>
                <td>${asset.name}</td>
                <td>${t(`finance.assets.types.${asset.type}`)}</td>
                <td>${currencySymbol}${Number(asset.value).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}

          ${liabilities.length > 0 ? `
          <h2>💳 ${t('finance.liabilities.title')}</h2>
          <table>
            <tr>
              <th>${t('finance.liabilities.nameLabel')}</th>
              <th>${t('finance.liabilities.typeLabel')}</th>
              <th>${t('finance.liabilities.amountLabel')}</th>
              ${liabilities.some(l => l.totalLimit) ? `<th>${t('finance.liabilities.limitLabel')}</th>` : ''}
            </tr>
            ${liabilities.map(liability => `
              <tr>
                <td>${liability.name}</td>
                <td>${t(`finance.liabilities.types.${liability.type}`)}</td>
                <td>${currencySymbol}${Number(liability.currentDebt).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                ${liabilities.some(l => l.totalLimit) ? `<td>${liability.totalLimit ? currencySymbol + Number(liability.totalLimit).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>` : ''}
              </tr>
            `).join('')}
          </table>
          ` : ''}

          ${receivables.length > 0 ? `
          <h2>💵 ${t('finance.receivables.title')}</h2>
          <table>
            <tr>
              <th>${t('finance.receivables.nameLabel')}</th>
              <th>${t('finance.receivables.amountLabel')}</th>
              <th>${t('finance.receivables.dueDateLabel')}</th>
            </tr>
            ${receivables.map(receivable => `
              <tr>
                <td>${receivable.debtor}</td>
                <td>${currencySymbol}${Number(receivable.amount).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${receivable.dueDate}</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}

          ${installments.length > 0 ? `
          <h2>📅 ${t('finance.installments.title')}</h2>
          <table>
            <tr>
              <th>${t('finance.installments.nameLabel')}</th>
              <th>${t('finance.installments.amountLabel')}</th>
              <th>${t('finance.installments.remainingLabel')}</th>
              <th>${t('finance.installments.endDateLabel')}</th>
            </tr>
            ${installments.map(installment => `
              <tr>
                <td>${installment.name || '-'}</td>
                <td>${currencySymbol}${Number(installment.installmentAmount).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${installment.remainingMonths} ${t('finance.installments.month')}</td>
                <td>${installment.endDate}</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}

          <div class="footer">
            <p>🤖 Financial AI v1.0.0 - ${t('settings.pdfReport.footer')}</p>
            <p>${t('settings.pdfReport.date')}: ${exportDate}</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: t('settings.dataManagement.exportPdfTitle'),
          UTI: 'com.adobe.pdf',
        });
      } else {
        showAlert(t('common.success'), t('settings.dataManagement.exportSuccess', { path: uri }), [], 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      showAlert(t('common.error'), t('settings.dataManagement.exportError'), [], 'error');
    }
  };

  if (showAbout) {
    return (
      <AboutScreen onBack={() => setShowAbout(false)} />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
                {t('settings.categoryApp')}
              </Text>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                {t('settings.title')}
              </Text>
            </View>
            <View style={[styles.headerIcon, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
              <SettingsIcon size={28} color={colors.purple.light} strokeWidth={2} />
            </View>
          </View>
        </View>

        <View style={styles.profileCardContainer}>
          <LinearGradient
            colors={gradients.purple}
            style={styles.profileCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatar}>
              {profile.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
              ) : (
                <User size={36} color="#FFFFFF" strokeWidth={2} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile.name || t('dashboard.financialJourney')}
              </Text>
              <Text style={styles.profileEmail}>
                {profile.email || t('dashboard.dataSecureHint')}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('settings.appearance.title')}</Text>
          <ThemeSelectionCard />
          
          {isDarkMode && (
            <View style={[styles.option, { backgroundColor: colors.cardBackground, marginTop: 12 }]}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Moon size={20} color={colors.purple.light} strokeWidth={2.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: colors.text.primary }]}>{t('settings.appearance.amoledMode')}</Text>
                  <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                    {t('settings.appearance.amoledSub')}
                  </Text>
                </View>
              </View>
              <Switch
                value={amoledEnabled}
                onValueChange={setAmoledEnabled}
                trackColor={{ false: colors.border.secondary, true: colors.purple.primary }}
                thumbColor={colors.text.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('settings.general')}</Text>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <DollarSign size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>{t('settings.currency')}</Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {currency} ({currencySymbol})
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
            onPress={() => setLanguageModalVisible(true)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <Languages size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>{t('settings.language')}</Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {i18n.language === 'tr' ? 'Türkçe' : 'English'}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} strokeWidth={2} />
          </TouchableOpacity>

          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.option, { backgroundColor: colors.cardBackground }]}
              onPress={() => {
                switch (option.id) {
                  case '1':
                    navigation.navigate('ProfileSettings');
                    break;
                  case '2':
                    navigation.navigate('ApiKeySettings');
                    break;
                  case '3':
                    navigation.navigate('NotificationSettings');
                    break;
                  case '4':
                    resetOnboarding();
                    break;
                  case '5':
                    showAlert(
                      t('settings.export'),
                      t('settings.exportFormat'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('dashboard.pdfReport'), onPress: handleExportDataPDF },
                        { text: t('dashboard.jsonBackup'), onPress: handleExportDataJSON },
                      ],
                      'info'
                    );
                    break;
                  case '6':
                    handleImportData();
                    break;
                  case '7':
                    setShowAbout(true);
                    break;
                  case '8':
                    navigation.navigate('PrivacyPolicy' as never);
                    break;
                  case '9':
                    navigation.navigate('TermsOfService' as never);
                    break;
                }
              }}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  {option.icon && <option.icon size={20} color={colors.purple.light} strokeWidth={2.5} />}
                </View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>{option.title}</Text>
              </View>
              <ChevronRight size={20} color={colors.text.secondary} strokeWidth={2} />
            </TouchableOpacity>
          ))}

          {/* Privacy & Security Section */}
          <View style={[styles.option, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <ShieldCheck size={20} color={colors.success} strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>{t('settings.security.biometricTitle')}</Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {t('settings.security.biometricSub')}
                </Text>
              </View>
            </View>
            <Switch 
              value={isBiometricsEnabled} 
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: colors.border.secondary, true: colors.success }}
              thumbColor={colors.text.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('settings.dangerZone')}</Text>
          <TouchableOpacity
            style={[styles.dangerOption, { backgroundColor: colors.cardBackground }]}
            onPress={handleDeleteAllData}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
                <Trash2 size={20} color={colors.error} strokeWidth={2.5} />
              </View>
              <Text style={[styles.dangerText, { color: colors.error }]}>{t('settings.deleteAllData')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleVersionTap} activeOpacity={0.6}>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>Financial AI v1.0.0</Text>
          </TouchableOpacity>
          <Text style={[styles.footerSubtext, { color: colors.text.tertiary }]}>
            {t('settings.footerSubtitle')}
          </Text>
        </View>
      </ScrollView>

      <CurrencyModal
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
      />

      <LanguageSelectionModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        currentLanguage={i18n.language}
        onSelect={changeLanguage}
      />

      {AlertComponent}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCardContainer: {
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profileCard: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14, // Consistent with headerIcon radius
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  optionSubtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  dangerOption: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  footerSubtext: {
    fontSize: 13,
  },
});
