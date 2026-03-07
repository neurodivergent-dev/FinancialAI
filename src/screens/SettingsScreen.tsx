import React, { useState } from 'react';
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
import { Moon, Sun, User, Bell, Download, Upload, Info, Trash2, DollarSign, Settings as SettingsIcon, ChevronRight, LogOut, Key, BookOpen, Smartphone } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useProfile } from '../context/ProfileContext';
import { useSubscription } from '../context/SubscriptionContext';
import CurrencyModal from '../../components/CurrencyModal';
import { ThemeSelectionCard } from '../components/ThemeSelectionCard';
import { AboutScreen } from './AboutScreen';
import { gradients } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingStore } from '../store/useOnboardingStore';

export const SettingsScreen = () => {
  const { colors, isDarkMode, amoledEnabled, setAmoledEnabled } = useTheme();
  const { resetOnboarding } = useOnboardingStore();
  const { currency, currencySymbol } = useCurrency();
  const { profile } = useProfile();
  const { isGuest, user, logout } = useAuth();
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
  const [showAbout, setShowAbout] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const settingsOptions = [
    { id: '1', title: 'Profil Ayarları', icon: User },
    { id: '2', title: 'API Key Ayarları', icon: Key },
    { id: '3', title: 'Bildirimler', icon: Bell },
    { id: '4', title: 'Onboarding\'i Tekrar Göster', icon: BookOpen },
    { id: '5', title: 'Verileri Dışa Aktar', icon: Download },
    { id: '6', title: 'Verileri İçe Aktar', icon: Upload },
    { id: '7', title: 'Hakkında', icon: Info },
  ];

  const handleVersionTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 7) {
      toggleDebugPremium();
      setTapCount(0);
    }
  };

  const handleLogout = () => {
    showAlert(
      'Çıkış Yap',
      'Oturumu kapatmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              showAlert('Hata', 'Çıkış yapılırken bir hata oluştu.', [], 'error');
            }
          }
        }
      ],
      'warning'
    );
  };

  const handleDeleteAllData = () => {
    showAlert(
      'Tüm Verileri Sil',
      'Bu işlem geri alınamaz! Tüm varlıklarınız, borçlarınız, alacaklarınız ve taksitleriniz kalıcı olarak silinecek. Uygulama sıfırlanacak ve yeniden başlatılacaktır.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              clearAllData();
              await resetOnboarding();
              if (isGuest) {
                await logout();
              }
              showAlert('Başarılı', 'Uygulama başarıyla sıfırlandı.', [], 'success');
            } catch (error) {
              console.error('Reset error:', error);
              showAlert('Hata', 'Uygulama sıfırlanırken bir hata oluştu.', [], 'error');
            }
          }
        }
      ],
      'error'
    );
  };

  const handleResetOnboarding = () => {
    navigation.navigate('OnboardingModal' as never);
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
        showAlert('Hata', 'Geçersiz dosya formatı. Lütfen Financial AI tarafından dışa aktarılan bir dosya seçin.', [], 'error');
        return;
      }

      showAlert(
        'Verileri İçe Aktar',
        `Bu dosya ${importedData.exportDate ? new Date(importedData.exportDate).toLocaleDateString('tr-TR') : 'bilinmeyen bir tarihte'} dışa aktarılmış.\n\nMevcut tüm verileriniz silinecek ve dosyadaki verilerle değiştirilecek. Devam etmek istiyor musunuz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'İçe Aktar',
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

                showAlert('Başarılı', 'Veriler başarıyla içe aktarıldı!', [], 'success');
              } catch (error) {
                console.error('Import error:', error);
                showAlert('Hata', 'Veriler içe aktarılırken bir hata oluştu.', [], 'error');
              }
            }
          }
        ],
        'warning'
      );
    } catch (error) {
      console.error('Import error:', error);
      showAlert('Hata', 'Dosya seçilirken bir hata oluştu.', [], 'error');
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
          dialogTitle: 'Finansal Verilerinizi Dışa Aktarın (JSON)',
          UTI: 'public.json',
        });
      } else {
        showAlert('Başarılı', `Veriler şu konuma kaydedildi: ${fileUri}`, [], 'success');
      }
    } catch (error) {
      console.error('Export JSON error:', error);
      showAlert('Hata', 'JSON dosyası oluşturulurken bir hata oluştu.', [], 'error');
    }
  };

  const handleExportDataPDF = async () => {
    try {
      const totalAssets = assets.reduce((total, item) => total + (Number(item.value) || 0), 0);
      const totalLiabilities = liabilities.reduce((total, item) => total + (Number(item.currentDebt) || 0), 0);
      const totalReceivables = receivables.reduce((total, item) => total + (Number(item.amount) || 0), 0);
      const netWorth = totalAssets + totalReceivables - totalLiabilities;
      const exportDate = new Date().toLocaleDateString('tr-TR', {
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
          <h1>📊 Financial AI - Finansal Rapor</h1>
          <p><strong>Rapor Tarihi:</strong> ${exportDate}</p>
          <p><strong>Para Birimi:</strong> ${currency} (${currencySymbol})</p>

          ${profile.name || profile.email || profile.phone || profile.findeksScore || profile.salary || profile.additionalIncome ? `
          <div class="summary">
            <h2>👤 Profil Bilgileri</h2>
            ${profile.name ? `
            <div class="summary-item">
              <span>Ad Soyad:</span>
              <span style="font-weight: bold;">${profile.name}</span>
            </div>
            ` : ''}
            ${profile.email ? `
            <div class="summary-item">
              <span>E-posta:</span>
              <span>${profile.email}</span>
            </div>
            ` : ''}
            ${profile.phone ? `
            <div class="summary-item">
              <span>Telefon:</span>
              <span>${profile.phone}</span>
            </div>
            ` : ''}
            ${profile.findeksScore ? `
            <div class="summary-item">
              <span>Findeks Kredi Notu:</span>
              <span style="font-weight: bold; color: #9333EA;">${profile.findeksScore}</span>
            </div>
            ` : ''}
            ${profile.salary ? `
            <div class="summary-item">
              <span>Aylık Net Maaş:</span>
              <span class="green">${currencySymbol}${Number(profile.salary).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
            ${profile.additionalIncome ? `
            <div class="summary-item">
              <span>Aylık Ek Gelir:</span>
              <span class="green">${currencySymbol}${Number(profile.additionalIncome).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
            ${profile.salary && profile.additionalIncome ? `
            <div class="summary-item">
              <span>Toplam Aylık Gelir:</span>
              <span style="font-weight: bold; color: #9333EA;">${currencySymbol}${(Number(profile.salary) + Number(profile.additionalIncome)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="summary">
            <h2>💼 Özet</h2>
            <div class="summary-item">
              <span>Toplam Varlıklar:</span>
              <span class="green">${currencySymbol}${totalAssets.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-item">
              <span>Toplam Borçlar:</span>
              <span class="red">${currencySymbol}${totalLiabilities.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-item">
              <span>Toplam Alacaklar:</span>
              <span class="green">${currencySymbol}${totalReceivables.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-item">
              <span>Net Değer:</span>
              <span class="${netWorth >= 0 ? 'green' : 'red'}">${currencySymbol}${netWorth.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          ${assets.length > 0 ? `
          <h2>💰 Varlıklar</h2>
          <table>
            <tr>
              <th>İsim</th>
              <th>Tip</th>
              <th>Değer</th>
            </tr>
            ${assets.map(asset => `
              <tr>
                <td>${asset.name}</td>
                <td>${asset.type === 'liquid' ? 'Likit' : asset.type === 'term' ? 'Vadeli' : asset.type === 'gold_currency' ? 'Altın/Döviz' : 'Fonlar'}</td>
                <td>${currencySymbol}${Number(asset.value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}

          ${liabilities.length > 0 ? `
          <h2>💳 Borçlar</h2>
          <table>
            <tr>
              <th>İsim</th>
              <th>Tip</th>
              <th>Güncel Borç</th>
              ${liabilities.some(l => l.totalLimit) ? '<th>Limit</th>' : ''}
            </tr>
            ${liabilities.map(liability => `
              <tr>
                <td>${liability.name}</td>
                <td>${liability.type === 'credit_card' ? 'Kredi Kartı' : 'Şahıs Borcu'}</td>
                <td>${currencySymbol}${Number(liability.currentDebt).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                ${liabilities.some(l => l.totalLimit) ? `<td>${liability.totalLimit ? currencySymbol + Number(liability.totalLimit).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>` : ''}
              </tr>
            `).join('')}
          </table>
          ` : ''}

          ${receivables.length > 0 ? `
          <h2>💵 Alacaklar</h2>
          <table>
            <tr>
              <th>Borçlu</th>
              <th>Tutar</th>
              <th>Vade Tarihi</th>
            </tr>
            ${receivables.map(receivable => `
              <tr>
                <td>${receivable.debtor}</td>
                <td>${currencySymbol}${Number(receivable.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${receivable.dueDate}</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}

          ${installments.length > 0 ? `
          <h2>📅 Taksitler</h2>
          <table>
            <tr>
              <th>İsim</th>
              <th>Aylık Tutar</th>
              <th>Kalan Ay</th>
              <th>Bitiş Tarihi</th>
            </tr>
            ${installments.map(installment => `
              <tr>
                <td>${installment.name || '-'}</td>
                <td>${currencySymbol}${Number(installment.installmentAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${installment.remainingMonths} ay</td>
                <td>${installment.endDate}</td>
              </tr>
            `).join('')}
          </table>
          ` : ''}

          <div class="footer">
            <p>🤖 Financial AI v1.0.0 ile oluşturuldu</p>
            <p>Bu rapor ${exportDate} tarihinde dışa aktarılmıştır.</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Finansal Raporunuzu Paylaşın',
          UTI: 'com.adobe.pdf',
        });
      } else {
        showAlert('Başarılı', `PDF şu konuma kaydedildi: ${uri}`, [], 'success');
      }
    } catch (error) {
      console.error('Export error:', error);
      showAlert('Hata', 'PDF oluşturulurken bir hata oluştu.', [], 'error');
    }
  };

  if (showAbout) {
    return (
      <AboutScreen onBack={() => setShowAbout(false)} />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
                Uygulama
              </Text>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                Ayarlar
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
              {user?.user_metadata?.picture ? (
                <Image source={{ uri: user.user_metadata.picture }} style={styles.avatarImage} />
              ) : profile.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
              ) : (
                <User size={36} color="#FFFFFF" strokeWidth={2} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {isGuest
                  ? 'Misafir Kullanıcı'
                  : user?.user_metadata?.full_name || user?.user_metadata?.name || profile.name || 'Kullanıcı'}
              </Text>
              <Text style={styles.profileEmail}>
                {isGuest
                  ? 'Misafir modunda'
                  : user?.email || profile.email || 'E-posta ekleyin'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Görünüm</Text>
          <ThemeSelectionCard />
          
          {isDarkMode && (
            <View style={[styles.option, { backgroundColor: colors.cardBackground, marginTop: 12 }]}>
              <View style={styles.optionLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                  <Moon size={20} color={colors.purple.light} strokeWidth={2.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: colors.text.primary }]}>AMOLED Modu</Text>
                  <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                    Tam siyah arka plan ile pil tasarrufu yapın
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
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Genel</Text>

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
            onPress={() => setCurrencyModalVisible(true)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <DollarSign size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={[styles.optionTitle, { color: colors.text.primary }]}>Para Birimi</Text>
                <Text style={[styles.optionSubtitle, { color: colors.text.tertiary }]}>
                  {currency} ({currencySymbol})
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
                if (option.title === 'Profil Ayarları') {
                  navigation.navigate('ProfileSettings' as never);
                } else if (option.title === 'API Key Ayarları') {
                  navigation.navigate('ApiKeySettings' as never);
                } else if (option.title === 'Bildirimler') {
                  navigation.navigate('NotificationSettings' as never);
                } else if (option.title === 'Hakkında') {
                  setShowAbout(true);
                } else if (option.title === 'Verileri Dışa Aktar') {
                  showAlert(
                    'Dışa Aktar',
                    'Hangi formatta dışa aktarmak istersiniz?',
                    [
                      { text: 'İptal', style: 'cancel' },
                      { text: 'PDF Rapor', onPress: handleExportDataPDF },
                      { text: 'JSON (Yedek)', onPress: handleExportDataJSON },
                    ],
                    'info'
                  );
                } else if (option.title === 'Verileri İçe Aktar') {
                  handleImportData();
                } else if (option.title === 'Onboarding\'i Tekrar Göster') {
                  handleResetOnboarding();
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

          <TouchableOpacity
            style={[styles.option, { backgroundColor: colors.cardBackground }]}
            onPress={handleLogout}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
                <LogOut size={20} color={colors.error} strokeWidth={2.5} />
              </View>
              <Text style={[styles.optionTitle, { color: colors.error }]}>Oturumu Kapat</Text>
            </View>
            <ChevronRight size={20} color={colors.text.secondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Tehlikeli Alan</Text>
          <TouchableOpacity
            style={[styles.dangerOption, { backgroundColor: colors.cardBackground }]}
            onPress={handleDeleteAllData}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
                <Trash2 size={20} color={colors.error} strokeWidth={2.5} />
              </View>
              <Text style={[styles.dangerText, { color: colors.error }]}>Tüm Verileri Sil</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleVersionTap} activeOpacity={0.6}>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>Financial AI v1.0.0</Text>
          </TouchableOpacity>
          <Text style={[styles.footerSubtext, { color: colors.text.tertiary }]}>
            {isGuest ? 'Misafir modunda kullanıyorsunuz' : 'Kişisel finans yönetim aracınız'}
          </Text>
        </View>
      </ScrollView>

      <CurrencyModal
        visible={currencyModalVisible}
        onClose={() => setCurrencyModalVisible(false)}
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
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
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
    borderRadius: 22,
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
