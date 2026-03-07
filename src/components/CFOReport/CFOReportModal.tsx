import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Shield,
  Zap,
  Target,
  Download,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatters';
import Markdown from 'react-native-markdown-display';
import { useProfile } from '../../context/ProfileContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface CFOReportData {
  summary: string;
  risks: string[];
  actions: string[];
  rawText: string;
}

interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  safeToSpend: number;
  totalReceivables: number;
  totalInstallments: number;
  findeksScore?: number;
  salary?: number;
  additionalIncome?: number;
}

interface CFOReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportData: CFOReportData | null;
  metrics: FinancialMetrics;
}

export const CFOReportModal: React.FC<CFOReportModalProps> = ({
  visible,
  onClose,
  reportData,
  metrics,
}) => {
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const { profile } = useProfile();
  const { isPremium } = useSubscription();
  const navigation = useNavigation();
  const [exportingPDF, setExportingPDF] = useState(false);

  // Finansal Sağlık Skoru Hesaplama (0-100)
  const calculateHealthScore = (): number => {
    let score = 50; // Başlangıç

    // Net değer pozitifse +20
    if (metrics.netWorth > 0) score += 20;
    else score -= 20;

    // Borç/Varlık oranı
    const debtRatio = metrics.totalAssets > 0 ? metrics.totalLiabilities / metrics.totalAssets : 1;
    if (debtRatio < 0.3) score += 15;
    else if (debtRatio < 0.5) score += 10;
    else if (debtRatio < 0.7) score += 5;
    else score -= 10;
    
    // Findeks notunu dahil et
    if (metrics.findeksScore) {
      if (metrics.findeksScore >= 1700) score += 15;
      else if (metrics.findeksScore >= 1500) score += 10;
      else if (metrics.findeksScore >= 1300) score += 5;
      else if (metrics.findeksScore < 1100) score -= 10;
    }


    return Math.max(0, Math.min(100, score));
  };

  const healthScore = calculateHealthScore();

  // Skor kategorisi
  const getScoreCategory = (score: number) => {
    if (score >= 80) return { text: 'Mükemmel', color: colors.success, icon: CheckCircle };
    if (score >= 60) return { text: 'İyi', color: colors.accent.cyan, icon: TrendingUp };
    if (score >= 40) return { text: 'Orta', color: '#F59E0B', icon: Activity };
    return { text: 'Dikkat', color: colors.error, icon: AlertTriangle };
  };

  const scoreCategory = getScoreCategory(healthScore);

  // PDF Export Fonksiyonu
  const handleExportPDF = async () => {
    if (!isPremium) {
      Alert.alert(
        'Premium Özellik',
        'Bu özellik sadece Premium abonelerimize özeldir. Devam etmek için lütfen abone olun.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Abone Ol', onPress: () => {
              onClose(); // Close the modal before navigating
              navigation.navigate('Paywall');
            }
          },
        ]
      );
      return;
    }

    if (!reportData) {
      Alert.alert('Hata', 'Rapor verisi bulunamadı.');
      return;
    }

    setExportingPDF(true);
    try {
      const exportDate = new Date().toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Markdown'ı HTML'e çevir (basit dönüşüm)
      const markdownToHtml = (md: string) => {
        return md
          .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/^\* (.+)$/gm, '<li>$1</li>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/<li>/g, '<ul><li>')
          .replace(/<\/li>\n(?!<li>)/g, '</li></ul>');
      };

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
              line-height: 1.6;
            }
            h1 {
              color: #9333EA;
              border-bottom: 3px solid #9333EA;
              padding-bottom: 10px;
              margin-bottom: 30px;
              font-size: 28px;
            }
            h2 {
              color: #4a5568;
              margin-top: 25px;
              margin-bottom: 15px;
              border-left: 4px solid #9333EA;
              padding-left: 15px;
              font-size: 20px;
            }
            h3 {
              color: #6b7280;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .header-info {
              background: #f7f7f7;
              padding: 15px 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
            }
            .profile-section {
              background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              color: white;
            }
            .profile-section h2 {
              color: white;
              border-left-color: white;
              margin-top: 0;
            }
            .profile-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            .profile-item:last-child {
              border-bottom: none;
            }
            .health-score-card {
              background: #f0f9ff;
              border: 2px solid #9333EA;
              border-radius: 12px;
              padding: 25px;
              margin: 25px 0;
              text-align: center;
            }
            .health-score-value {
              font-size: 56px;
              font-weight: 900;
              color: #9333EA;
              margin: 10px 0;
            }
            .health-score-label {
              font-size: 24px;
              font-weight: 700;
              color: #4a5568;
              margin-bottom: 10px;
            }
            .health-score-desc {
              font-size: 16px;
              color: #6b7280;
            }
            .category-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .category-card {
              background: #f7f7f7;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #9333EA;
            }
            .category-title {
              font-weight: 700;
              color: #4a5568;
              margin-bottom: 8px;
            }
            .category-score {
              font-size: 32px;
              font-weight: 900;
              color: #9333EA;
            }
            .category-desc {
              font-size: 12px;
              color: #6b7280;
              margin-top: 5px;
            }
            .summary-box {
              background: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #06B6D4;
            }
            .risk-item, .action-item {
              padding: 12px;
              margin: 10px 0;
              border-radius: 6px;
              background: #fff;
              border-left: 3px solid #9333EA;
            }
            .risk-item {
              border-left-color: #EF4444;
              background: #FEF2F2;
            }
            .action-item {
              border-left-color: #10B981;
              background: #F0FDF4;
            }
            .metrics-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            .metrics-table td {
              padding: 12px;
              border-bottom: 1px solid #e0e0e0;
            }
            .metrics-table td:first-child {
              font-weight: 600;
              color: #4a5568;
            }
            .metrics-table td:last-child {
              text-align: right;
              font-weight: 700;
            }
            .green { color: #22c55e; }
            .red { color: #ff4757; }
            .purple { color: #9333EA; }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #999;
              font-size: 12px;
              border-top: 2px solid #e0e0e0;
              padding-top: 20px;
            }
            ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            li {
              margin: 5px 0;
            }
            p {
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <h1>🤖 AI CFO - Finansal Sağlık Raporu</h1>

          <div class="header-info">
            <span><strong>Rapor Tarihi:</strong> ${exportDate}</span>
            <span><strong>Para Birimi:</strong> ${currencySymbol}</span>
          </div>

          ${profile.name || profile.email || profile.phone || metrics.findeksScore || metrics.salary || metrics.additionalIncome ? `
          <div class="profile-section">
            <h2>👤 Profil Bilgileri</h2>
            ${profile.name ? `<div class="profile-item"><span>Ad Soyad:</span><span><strong>${profile.name}</strong></span></div>` : ''}
            ${profile.email ? `<div class="profile-item"><span>E-posta:</span><span>${profile.email}</span></div>` : ''}
            ${profile.phone ? `<div class="profile-item"><span>Telefon:</span><span>${profile.phone}</span></div>` : ''}
            ${metrics.findeksScore ? `<div class="profile-item"><span>Findeks Kredi Notu:</span><span><strong>${metrics.findeksScore}</strong></span></div>` : ''}
            ${metrics.salary ? `<div class="profile-item"><span>Aylık Net Maaş:</span><span><strong>${formatCurrency(metrics.salary, currencySymbol)}</strong></span></div>` : ''}
            ${metrics.additionalIncome ? `<div class="profile-item"><span>Aylık Ek Gelir:</span><span><strong>${formatCurrency(metrics.additionalIncome, currencySymbol)}</strong></span></div>` : ''}
          </div>
          ` : ''}

          <div class="health-score-card">
            <div class="health-score-label">${scoreCategory.text} Durum</div>
            <div class="health-score-value">${Math.round(healthScore)}</div>
            <div class="health-score-desc">Finansal Sağlık Skoru</div>
          </div>

          <h2>📊 Kategori Skorları</h2>
          <div class="category-grid">
            <div class="category-card">
              <div class="category-title">💧 Likidite</div>
              <div class="category-score">${Math.round(liquidityScore)}/100</div>
              <div class="category-desc">Nakit akışı ve ödeme gücü</div>
            </div>
            <div class="category-card">
              <div class="category-title">🛡️ Borç Yönetimi</div>
              <div class="category-score">${Math.round(debtScore)}/100</div>
              <div class="category-desc">Borç yönetimi kalitesi</div>
            </div>
            <div class="category-card">
              <div class="category-title">📈 Varlık Kalitesi</div>
              <div class="category-score">${Math.round(assetScore)}/100</div>
              <div class="category-desc">Net varlık değeri</div>
            </div>
            <div class="category-card">
              <div class="category-title">🎯 Taksit Yönetimi</div>
              <div class="category-score">${Math.round(installmentScore)}/100</div>
              <div class="category-desc">Aylık taksit oranı</div>
            </div>
          </div>

          <div class="summary-box">
            <h2>⚡ AI Analiz Özeti</h2>
            ${markdownToHtml(reportData.summary)}
          </div>

          ${reportData.risks.length > 0 ? `
          <h2>⚠️ Tespit Edilen Riskler</h2>
          ${reportData.risks.map((risk, idx) => `
            <div class="risk-item">
              <strong>${idx + 1}.</strong> ${markdownToHtml(risk)}
            </div>
          `).join('')}
          ` : ''}

          ${reportData.actions.length > 0 ? `
          <h2>✅ Önerilen Aksiyonlar</h2>
          ${reportData.actions.map((action, idx) => `
            <div class="action-item">
              <strong>${idx + 1}.</strong> ${markdownToHtml(action)}
            </div>
          `).join('')}
          ` : ''}

          <h2>💼 Finansal Özet</h2>
          <table class="metrics-table">
            <tr>
              <td>Toplam Varlıklar</td>
              <td class="green">${formatCurrency(metrics.totalAssets, currencySymbol)}</td>
            </tr>
            <tr>
              <td>Toplam Borçlar</td>
              <td class="red">${formatCurrency(metrics.totalLiabilities, currencySymbol)}</td>
            </tr>
            <tr>
              <td>Net Değer</td>
              <td class="${metrics.netWorth >= 0 ? 'green' : 'red'}">${formatCurrency(metrics.netWorth, currencySymbol)}</td>
            </tr>
            <tr>
              <td>Güvenli Harcama Limiti</td>
              <td class="purple">${formatCurrency(metrics.safeToSpend, currencySymbol)}</td>
            </tr>
            <tr>
              <td>Toplam Alacaklar</td>
              <td class="green">${formatCurrency(metrics.totalReceivables, currencySymbol)}</td>
            </tr>
            <tr>
              <td>Toplam Taksitler</td>
              <td class="red">${formatCurrency(metrics.totalInstallments, currencySymbol)}</td>
            </tr>
          </table>

          <div class="footer">
            <p><strong>🤖 Financial AI - Yapay Zeka CFO Raporu</strong></p>
            <p>Bu rapor ${exportDate} tarihinde AI tarafından oluşturulmuştur.</p>
            <p>Financial AI v1.0.0</p>
          </div>
        </body>
        </html>
      `;

      // PDF oluştur
      const { uri } = await Print.printToFileAsync({ html });

      // PDF'i paylaş
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'AI CFO Raporunu Paylaşın',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Başarılı', `PDF şu konuma kaydedildi: ${uri}`);
      }
    } catch (error) {
      console.error('PDF Export error:', error);
      Alert.alert('Hata', 'PDF oluşturulurken bir hata oluştu.');
    } finally {
      setExportingPDF(false);
    }
  };

  // Kategori skorları
  const liquidityScore = metrics.totalLiabilities > 0
    ? Math.min(100, (metrics.safeToSpend / metrics.totalLiabilities) * 100)
    : (metrics.safeToSpend > 0 ? 100 : 0);

  const debtScore = metrics.totalAssets > 0
    ? Math.max(0, 100 - (metrics.totalLiabilities / metrics.totalAssets) * 100)
    : (metrics.totalLiabilities > 0 ? 0 : 100);

  const assetScore = metrics.netWorth > 0 ? Math.min(100, (metrics.netWorth / 10000) * 100) : 0;

  const installmentScore = metrics.totalAssets > 0
    ? Math.max(0, 100 - (metrics.totalInstallments / metrics.totalAssets) * 100)
    : (metrics.totalInstallments > 0 ? 0 : 100);

  const CategoryCard = ({
    title,
    score,
    icon: Icon,
    color,
    description,
  }: {
    title: string;
    score: number;
    icon: any;
    color: string;
    description: string;
  }) => (
    <View style={[styles.categoryCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: `${color}20` }]}>
          <Icon size={20} color={color} strokeWidth={2.5} />
        </View>
        <Text style={[styles.categoryTitle, { color: colors.text.primary }]}>{title}</Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreValue, { color }]}>{Math.round(score)}</Text>
        <Text style={[styles.scoreMax, { color: colors.text.tertiary }]}>/100</Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: `${color}20` }]}>
        <View style={[styles.progressFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.categoryDesc, { color: colors.text.primary }]}>{description}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient
          colors={['#9333EA', '#7C3AED']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSubtitle}>Yapay Zeka CFO</Text>
              <Text style={styles.headerTitle}>Finansal Sağlık Raporu</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={handleExportPDF}
                style={[styles.exportButton, exportingPDF && styles.exportButtonDisabled]}
                disabled={exportingPDF}
              >
                <Download size={20} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.exportButtonText}>
                  {exportingPDF ? 'Hazırlanıyor...' : 'PDF'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Genel Skor */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreCircle}>
              <View style={styles.scoreInner}>
                <scoreCategory.icon size={32} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.mainScore}>{Math.round(healthScore)}</Text>
                <Text style={styles.scoreLabel}>Skor</Text>
              </View>
            </View>
            <View style={styles.scoreInfo}>
              <View style={[styles.scoreBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Text style={styles.scoreBadgeText}>{scoreCategory.text}</Text>
              </View>
              <Text style={styles.scoreDescription}>
                Finansal sağlığınız {scoreCategory.text.toLowerCase()} durumda
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Özet */}
          {reportData && (
            <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.summaryHeader}>
                <Zap size={20} color={colors.purple.light} strokeWidth={2.5} />
                <Text style={[styles.summaryTitle, { color: colors.text.primary }]}>
                  AI Analiz Özeti
                </Text>
              </View>
              <Markdown
                style={{
                  body: {
                    color: colors.text.primary,
                    fontSize: 15,
                    lineHeight: 24,
                    marginBottom: 0
                  },
                  strong: {
                    color: colors.text.primary,
                    fontWeight: '700'
                  },
                  paragraph: {
                    marginTop: 0,
                    marginBottom: 8
                  },
                  text: {
                    color: colors.text.primary
                  }
                }}
              >
                {reportData.summary}
              </Markdown>
            </View>
          )}

          {/* Kategori Skorları */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Detaylı Analiz
            </Text>
            <View style={styles.categoriesGrid}>
              <CategoryCard
                title="Likidite"
                score={liquidityScore}
                icon={Activity}
                color={colors.accent.cyan}
                description="Nakit akışı ve ödeme gücü"
              />
              <CategoryCard
                title="Borç Yönetimi"
                score={debtScore}
                icon={Shield}
                color={debtScore > 60 ? colors.success : colors.error}
                description="Borç yönetimi kalitesi"
              />
              <CategoryCard
                title="Varlık Kalitesi"
                score={assetScore}
                icon={TrendingUp}
                color={colors.success}
                description="Net varlık değeri"
              />
              <CategoryCard
                title="Taksit Yönetimi"
                score={installmentScore}
                icon={Target}
                color={installmentScore > 70 ? colors.success : '#F59E0B'}
                description="Aylık taksit oranı"
              />
            </View>
          </View>

          {/* Riskler */}
          {reportData && reportData.risks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={20} color={colors.error} strokeWidth={2.5} />
                <Text style={[styles.sectionTitle, { color: colors.text.primary, marginLeft: 8 }]}>
                  Tespit Edilen Riskler
                </Text>
              </View>
              {reportData.risks.map((risk, idx) => (
                <View
                  key={`risk-${idx}`}
                  style={[styles.listItem, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={[styles.listIcon, { backgroundColor: `${colors.error}20` }]}>
                    <Text style={styles.listNumber}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Markdown
                      style={{
                        body: { color: colors.text.primary, fontSize: 14, lineHeight: 20 },
                        strong: { color: colors.text.primary, fontWeight: '700' },
                        paragraph: { marginTop: 0, marginBottom: 0 },
                      }}
                    >
                      {risk}
                    </Markdown>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Aksiyonlar */}
          {reportData && reportData.actions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <CheckCircle size={20} color={colors.success} strokeWidth={2.5} />
                <Text style={[styles.sectionTitle, { color: colors.text.primary, marginLeft: 8 }]}>
                  Önerilen Aksiyonlar
                </Text>
              </View>
              {reportData.actions.map((action, idx) => (
                <View
                  key={`action-${idx}`}
                  style={[styles.listItem, { backgroundColor: colors.cardBackground }]}
                >
                  <View style={[styles.listIcon, { backgroundColor: `${colors.success}20` }]}>
                    <CheckCircle size={16} color={colors.success} strokeWidth={2.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Markdown
                      style={{
                        body: { color: colors.text.primary, fontSize: 14, lineHeight: 20 },
                        strong: { color: colors.text.primary, fontWeight: '700' },
                        paragraph: { marginTop: 0, marginBottom: 0 },
                      }}
                    >
                      {action}
                    </Markdown>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Finansal Özet */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Finansal Özet
            </Text>
            <View style={[styles.metricsCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.text.primary }]}>
                  Toplam Varlıklar
                </Text>
                <Text style={[styles.metricValue, { color: colors.success }]}>
                  {formatCurrency(metrics.totalAssets, currencySymbol)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.text.primary }]}>
                  Toplam Borçlar
                </Text>
                <Text style={[styles.metricValue, { color: colors.error }]}>
                  {formatCurrency(metrics.totalLiabilities, currencySymbol)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.text.primary }]}>Net Değer</Text>
                <Text
                  style={[
                    styles.metricValue,
                    { color: metrics.netWorth >= 0 ? colors.success : colors.error },
                  ]}
                >
                  {formatCurrency(metrics.netWorth, currencySymbol)}
                </Text>
              </View>
              <View style={styles.metricDivider} />
               <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.text.primary }]}>
                  Güvenli Harcama
                </Text>
                <Text style={[styles.metricValue, { color: colors.purple.light }]}>
                  {formatCurrency(metrics.safeToSpend, currencySymbol)}
                </Text>
              </View>

              {metrics.salary !== undefined && (
                <>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: colors.text.primary }]}>
                      Aylık Maaş
                    </Text>
                    <Text style={[styles.metricValue, { color: colors.text.primary }]}>
                      {formatCurrency(metrics.salary, currencySymbol)}
                    </Text>
                  </View>
                </>
              )}
               {metrics.additionalIncome !== undefined && (
                <>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: colors.text.primary }]}>
                      Ek Gelir
                    </Text>
                    <Text style={[styles.metricValue, { color: colors.text.primary }]}>
                      {formatCurrency(metrics.additionalIncome, currencySymbol)}
                    </Text>
                  </View>
                </>
              )}
              {metrics.findeksScore !== undefined && (
                <>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: colors.text.primary }]}>
                      Findeks Notu
                    </Text>
                    <Text style={[styles.metricValue, { color: colors.text.primary }]}>
                      {metrics.findeksScore}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
  },
  scoreInner: {
    flex: 1,
    borderRadius: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScore: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  scoreInfo: {
    flex: 1,
    marginLeft: 20,
  },
  scoreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scoreDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreMax: {
    fontSize: 16,
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryDesc: {
    fontSize: 13,
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  listIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  metricsCard: {
    padding: 20,
    borderRadius: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  metricLabel: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  metricDivider: {
    height: 1,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
  },
});