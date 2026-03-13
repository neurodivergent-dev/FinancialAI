import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from 'react-native-markdown-display';
import { useNavigation } from "@react-navigation/native";
import { useFinanceStore } from "../store/useFinanceStore";
import { useTheme } from "../context/ThemeContext";
import { useCurrency } from "../context/CurrencyContext";
import { useApiKey } from "../context/ApiKeyContext";
import { useProfile } from "../context/ProfileContext";
import { useSubscription } from "../context/SubscriptionContext";
import { gradients } from "../theme/colors";
import { Wallet, TrendingUp, TrendingDown, PieChart, Sparkles, BarChart3, Lightbulb, Target, AlertCircle } from "lucide-react-native";
import { geminiService } from "../services/geminiService";
import { CFOReportModal } from "../components/CFOReport/CFOReportModal";
import { FinancialCharts } from "../components/Charts/FinancialCharts";
import { formatCurrency, formatNumber, formatPercentage, formatCurrencySmart } from "../utils/formatters";
import { useCustomAlert } from "../hooks/useCustomAlert";

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { isPremium } = useSubscription();
  const [refreshing, setRefreshing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ 
    summary: string;
    risks: string[];
    actions: string[];
    rawText: string;
  } | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const { getActiveApiKey, isAiEnabled } = useApiKey();
  const { profile } = useProfile();
  const { showAlert, AlertComponent } = useCustomAlert();

  // Tilt animation
  const tiltAnim = useRef(new Animated.Value(0)).current;

  const {
    assets,
    liabilities,
    receivables,
    installments,
    getTotalAssets,
    getTotalLiabilities,
    getNetWorth,
    getSafeToSpend,
  } = useFinanceStore();

  const totalAssets = getTotalAssets();
  const totalLiabilities = getTotalLiabilities();
  const netWorth = getNetWorth();
  const safeToSpend = getSafeToSpend();
  const totalReceivables = useMemo(
    () => receivables.reduce((t, i) => t + (Number(i.amount) || 0), 0),
    [receivables]
  );
  const totalInstallments = useMemo(
    () => installments.reduce((t, i) => t + (Number(i.installmentAmount) || 0), 0),
    [installments]
  );

  // Load last CFO analysis
  useEffect(() => {
    loadLastCFOAnalysis();
  }, []);

  // Track API Key change and update service
  useEffect(() => {
    geminiService.updateApiKey(getActiveApiKey());
  }, [getActiveApiKey]);

  const loadLastCFOAnalysis = async () => {
    try {
      const savedAnalysis = await AsyncStorage.getItem('@last_cfo_analysis');
      if (savedAnalysis) {
        const parsed = JSON.parse(savedAnalysis);
        setAiResult(parsed);
      }
    } catch (error) {
      console.log('CFO analysis could not be loaded:', error);
    }
  };

  const saveCFOAnalysis = async (analysis: any) => {
    try {
      await AsyncStorage.setItem('@last_cfo_analysis', JSON.stringify(analysis));
    } catch (error) {
      console.log('CFO analysis could not be saved:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate all financial tips
  const getAllFinancialTips = () => {
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const tips = [];

    // If debt ratio is high
    if (debtRatio > 50) {
      tips.push({
        icon: AlertCircle,
        color: '#F59E0B',
        gradient: ['#F59E0B', '#F97316'],
        title: t('dashboard.tips.highDebtTitle'),
        description: t('dashboard.tips.highDebtDescription', { debtRatio: debtRatio.toFixed(0) }),
      });
    }

    // If safe to spend is high
    if (safeToSpend > totalAssets * 0.3 && totalAssets > 0) {
      tips.push({
        icon: Target,
        color: '#10B981',
        gradient: ['#10B981', '#059669'],
        title: t('dashboard.tips.investmentTimeTitle'),
        description: t('dashboard.tips.investmentTimeDescription', { safeToSpend: formatCurrencySmart(safeToSpend, currencySymbol) }),
      });
    }

    // If receivables are high
    if (totalReceivables > totalAssets * 0.2 && totalReceivables > 0) {
      tips.push({
        icon: TrendingUp,
        color: '#06B6D4',
        gradient: ['#06B6D4', '#0891B2'],
        title: t('dashboard.tips.receivableFollowupTitle'),
        description: t('dashboard.tips.receivableFollowupDescription', { totalReceivables: formatCurrencySmart(totalReceivables, currencySymbol) }),
      });
    }

    // Net worth is positive and in good condition
    if (netWorth > 0 && debtRatio < 30) {
      tips.push({
        icon: Lightbulb,
        color: '#8B5CF6',
        gradient: gradients.purple,
        title: t('dashboard.tips.greatJobTitle'),
        description: t('dashboard.tips.greatJobDescription', { netWorth: formatCurrencySmart(netWorth, currencySymbol) }),
      });
    }

    // If installment load is high
    if (totalInstallments > safeToSpend * 0.5 && totalInstallments > 0) {
      tips.push({
        icon: AlertCircle,
        color: '#EF4444',
        gradient: ['#EF4444', '#DC2626'],
        title: t('dashboard.tips.installmentLoadTitle'),
        description: t('dashboard.tips.installmentLoadDescription', { totalInstallments: formatCurrencySmart(totalInstallments, currencySymbol) }),
      });
    }

    // Additional general tips (always show)
    tips.push({
      icon: Lightbulb,
      color: '#8B5CF6',
      gradient: gradients.purple,
      title: t('dashboard.tips.emergencyFundTitle'),        description: t('dashboard.tips.emergencyFundDescription'),
    });

    tips.push({
      icon: Target,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      title: t('dashboard.tips.budgetPlanningTitle'),        description: t('dashboard.tips.budgetPlanningDescription'),
    });

    tips.push({
      icon: TrendingUp,
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
      title: t('dashboard.tips.longTermThinkingTitle'),        description: t('dashboard.tips.longTermThinkingDescription'),
    });

    tips.push({
      icon: Lightbulb,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#F97316'],
      title: t('dashboard.tips.smallSavingsBigResultsTitle'),        description: t('dashboard.tips.smallSavingsBigResultsDescription'),
    });

    tips.push({
      icon: Target,
      color: '#8B5CF6',
      gradient: gradients.purple,
      title: t('dashboard.tips.automaticSavingsTitle'),        description: t('dashboard.tips.automaticSavingsDescription'),
    });

    tips.push({
      icon: AlertCircle,
      color: '#EF4444',
      gradient: ['#EF4444', '#DC2626'],
      title: t('dashboard.tips.creditCardInterestTrapTitle'),        description: t('dashboard.tips.creditCardInterestTrapDescription'),
    });

    tips.push({
      icon: TrendingUp,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      title: t('dashboard.tips.diversificationIsImportantTitle'),        description: t('dashboard.tips.diversificationIsImportantDescription'),
    });

    tips.push({
      icon: Lightbulb,
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
      title: t('dashboard.tips.inflationEffectTitle'),        description: t('dashboard.tips.inflationEffectDescription'),
    });

    tips.push({
      icon: Target,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#F97316'],
      title: t('dashboard.tips.hourRuleTitle'),        description: t('dashboard.tips.hourRuleDescription'),
    });

    tips.push({
      icon: Lightbulb,
      color: '#8B5CF6',
      gradient: gradients.purple,
      title: t('dashboard.tips.insuranceNeglectTitle'),        description: t('dashboard.tips.insuranceNeglectDescription'),
    });

    tips.push({
      icon: TrendingUp,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      title: t('dashboard.tips.createPassiveIncomeTitle'),        description: t('dashboard.tips.createPassiveIncomeDescription'),
    });

    tips.push({
      icon: Target,
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
      title: t('dashboard.tips.financialEducationTitle'),        description: t('dashboard.tips.financialEducationDescription'),
    });

    tips.push({
      icon: Lightbulb,
      color: '#EF4444',
      gradient: ['#EF4444', '#DC2626'],
      title: t('dashboard.tips.subscriptionControlTitle'),        description: t('dashboard.tips.subscriptionControlDescription'),
    });

    tips.push({
      icon: Target,
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      title: t('dashboard.tips.setYourGoalsTitle'),        description: t('dashboard.tips.setYourGoalsDescription'),
    });

    tips.push({
      icon: TrendingUp,
      color: '#8B5CF6',
      gradient: gradients.purple,
      title: t('dashboard.tips.salaryIncreaseRuleTitle'),        description: t('dashboard.tips.salaryIncreaseRuleDescription'),
    });

    // At least one tip should exist
    if (tips.length === 0) {
      tips.push({
        icon: Lightbulb,
        color: '#8B5CF6',
        gradient: gradients.purple,
        title: t('dashboard.tips.strengthenFinancialPlanTitle'),
        description: t('dashboard.tips.strengthenFinancialPlanDescription'),
      });
    }

    return tips;
  };

  const allTips = useMemo(() => getAllFinancialTips(), [
    totalAssets,
    totalLiabilities,
    netWorth,
    safeToSpend,
    totalReceivables,
    totalInstallments,
    currencySymbol,
    i18n.language,
  ]);

  const currentTip = allTips[currentTipIndex] || allTips[0];

  // Switch to next tip every 10 seconds
  useEffect(() => {
    if (allTips.length <= 1) return; // Do not cycle if there's only one tip

    // Reset index if it's out of bounds
    if (currentTipIndex >= allTips.length) {
      setCurrentTipIndex(0);
    }

    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % allTips.length);
    }, 10000); // 10 saniye

    return () => clearInterval(interval);
  }, [allTips.length, currentTipIndex]);

  // Manually switch to next tip
  const handleTipPress = () => {
    if (allTips.length > 1) {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % allTips.length);
    }
  };

  const handleHeroPress = () => {
    Animated.sequence([
      Animated.timing(tiltAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tiltAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const tiltInterpolate = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '8deg'],
  });

  const parseCfoReport = (rawText: string) => {
    const isTr = i18n.language === 'tr';
    
    // Flexible pattern to support Markdown headers
    const summaryRegex = isTr 
      ? /\*?\*?Yönetici Özeti:?\*?\*?\s*([\s\S]*?)(?=\*?\*?Finansal Sağlık Notu|\*?\*?Detaylı Analiz|\*?\*?Stratejik Öneriler|$)/i
      : /\*?\*?Executive Summary:?\*?\*?\s*([\s\S]*?)(?=\*?\*?Financial Health Grade|\*?\*?Detailed Analysis|\*?\*?Strategic Recommendations|$)/i;
      
    const risksRegex = isTr
      ? /\*?\*?Potansiyel Riskler:?\*?\*?\s*([\s\S]*?)(?=\*?\*?Stratejik Öneriler|\*?\*?Sonuç ve Genel|$)/i
      : /\*?\*?Potential Risks:?\*?\*?\s*([\s\S]*?)(?=\*?\*?Strategic Recommendations|\*?\*?Conclusion and General|$)/i;
      
    const actionsRegex = isTr
      ? /\*?\*?Stratejik Öneriler:?\*?\*?\s*([\s\S]*?)(?=\*?\*?Potensiyel Riskler|\*?\*?Sonuç ve Genel|$)/i
      : /\*?\*?Strategic Recommendations:?\*?\*?\s*([\s\S]*?)(?=\*?\*?Potential Risks|\*?\*?Conclusion and General|$)/i;

    const summaryMatch = rawText.match(summaryRegex);
    const risksMatch = rawText.match(risksRegex);
    const actionsMatch = rawText.match(actionsRegex);

    const parseList = (text: string | undefined) => {
      if (!text) return [];

      const lines = text.split('\n');
      const items: string[] = [];
      let currentItem = '';
      let inItem = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) continue;

        // Skip main headers (like **Short Term:**, **Medium Term:**)
        if (line.match(/^\*\*.+?:?\*\*$/)) {
          continue;
        }

        // Check if it's a new item start (starts with 1., * or -)
        const isNewItem = line.match(/^[\*\-\•]\s+/) || line.match(/^\d+\.\s+/);

        if (isNewItem) {
          // Save previous item
          if (inItem && currentItem.trim()) {
            items.push(currentItem.trim());
          }

          // Start new item - remove bullet/number
          currentItem = line.replace(/^[\*\-\•]\s+/, '').replace(/^\d+\.\s+/, '');
          inItem = true;
        } else if (inItem) {
          // Continuing line - add to current item
          currentItem += ' ' + line;
        }
      }

      // Save last item
      if (inItem && currentItem.trim()) {
        items.push(currentItem.trim());
      }

      // Clean and filter contents
      return items
        .map(item => {
          // Clean leading and trailing unnecessary characters
          let cleaned = item.trim();

          // Clean bold markings (if at the beginning)
          // If already has :, just remove **, otherwise add :
          if (cleaned.match(/^\*\*([^*]+)\*\*:\s*/)) {
            cleaned = cleaned.replace(/^\*\*([^*]+)\*\*:\s*/, '$1: ');
          } else {
            cleaned = cleaned.replace(/^\*\*([^*]+)\*\*\s*/, '$1: ');
          }

          // Replace all :: cases with : (from wherever it comes)
          cleaned = cleaned.replace(/::/g, ':');

          return cleaned;
        })
        .filter(item => {
          // Should be at least 10 characters (filter very short meaningless parts)
          if (item.length < 10) return false;

          // Should not only contain punctuation or numbers
          if (item.match(/^[\d\s\.,;:\-\–—]+$/)) return false;

          return true;
        });
    };

    return {
      summary: summaryMatch ? summaryMatch[1].trim() : rawText,
      risks: parseList(risksMatch ? risksMatch[1] : ''),
      actions: parseList(actionsMatch ? actionsMatch[1] : ''),
      rawText,
    };
  };
  
  const handleAiAnalyze = async () => {
    if (!isPremium) {
      navigation.navigate('Paywall');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const reportContext = {
        totalAssets,
        totalLiabilities,
        netWorth,
        safeToSpend,
        totalReceivables,
        totalInstallments,
        currencySymbol,
        findeksScore: profile.findeksScore,
        salary: profile.salary,
        additionalIncome: profile.additionalIncome,
        language: i18n.language,
      };

      const response = await geminiService.generateCfoReport(reportContext);
      
      if (response.success && response.content) {
        const analysis = parseCfoReport(response.content);
        setAiResult(analysis);
        await saveCFOAnalysis(analysis); // Analizi kaydet
        setShowReport(true);
      } else {
        throw new Error(response.error || t('dashboard.errors.generalError'));
      }

    } catch (error: any) {
      const errorMsg = error?.message || t('dashboard.errors.generalError');

      if (errorMsg.includes('CONFIG_ERROR')) {
        showAlert(
          t('dashboard.alerts.apiKeyRequiredTitle'),
          t('dashboard.alerts.apiKeyRequiredMessage'),
          [
            { text: t('dashboard.alerts.cancel'), style: 'cancel' },
            { 
              text: t('dashboard.alerts.goToSettings'), 
              onPress: () => navigation.navigate('ApiKeySettings') 
            }
          ],
          'warning'
        );
        return;
      }

      // Kullanıcı dostu hata mesajları
      if (errorMsg.includes('quota') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
        setAiError(t('dashboard.errors.quota'));
      } else if (errorMsg.includes('429')) {
        setAiError(t('dashboard.errors.throttle'));
      } else if (errorMsg.includes('503') || errorMsg.includes('overloaded')) {
        setAiError(t('dashboard.errors.serviceBusy'));
      } else if (errorMsg.includes('API_KEY') || errorMsg.includes('Invalid')) {
        setAiError(t('dashboard.errors.invalidKey'));
      } else {
        setAiError(errorMsg);
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.purple.primary}
          />
        }
      >
        <View style={styles.modernHeader}>
          <LinearGradient
            colors={['#FF0080', '#7928CA', '#0070F3', '#00DFD8']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.decorativePattern}>
              <View style={styles.patternCircle1} />
              <View style={styles.patternCircle2} />
              <View style={styles.patternCircle3} />
            </View>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.greeting}>
                    {(() => {
                      const hour = new Date().getHours();
                      if (hour >= 6 && hour < 12) return t('dashboard.greeting.morning');
                      if (hour >= 12 && hour < 18) return t('dashboard.greeting.afternoon');
                      if (hour >= 18 && hour < 24) return t('dashboard.greeting.evening');
                      return t('dashboard.greeting.night');
                    })()}
                  </Text>
                  <Text style={styles.title}>
                    {t('dashboard.summaryTitle')}
                  </Text>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                      {new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.headerRight}>
                <View style={styles.modernHeaderIcon}>
                  <Wallet size={34} color="#FFFFFF" strokeWidth={2.5} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Pressable onPress={handleHeroPress} style={styles.heroCardContainer}>
          <Animated.View
            style={[ 
              styles.heroCardWrapper,
              {
                transform: [
                  { perspective: 800 },
                  { rotateX: tiltInterpolate },
                  { rotateY: tiltAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-8deg'],
                  })},
                  { scale: tiltAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02],
                  })},
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#9333EA', '#7C3AED', '#6D28D9']}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroIconContainer}>
                    <Wallet size={24} color="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />
                  </View>
                  <Text style={styles.heroLabel}>{t('dashboard.safeToSpend')}</Text>
                </View>
                <Text style={styles.heroValue}>{formatCurrencySmart(safeToSpend, currencySymbol)}</Text>
                <Text style={styles.heroSubtext}>{t('dashboard.safeToSpendSub')}</Text>
              </View>
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.decorativeCircle3} />
            </LinearGradient>
          </Animated.View>
        </Pressable>

        {/* Financial Tip Banner */}
        <TouchableOpacity
          style={styles.tipBannerContainer}
          onPress={handleTipPress}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={currentTip.gradient as any}
            style={styles.tipBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.tipIconContainer}>
              {React.createElement(currentTip.icon, { size: 24, color: "#FFFFFF", strokeWidth: 2.5 })}
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{currentTip.title}</Text>
              <Text style={styles.tipDescription}>{currentTip.description}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.overviewSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('dashboard.financialStatus')}</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={[styles.miniCard, { backgroundColor: colors.cardBackground }]}>
                <View style={[styles.miniCardIcon, { backgroundColor: "rgba(0, 255, 157, 0.15)" }]}>
                  <TrendingUp size={20} color={colors.success} strokeWidth={2.5} />
                </View>
                <Text style={[styles.miniCardLabel, { color: colors.text.secondary }]}>{t('dashboard.totalAssets')}</Text>
                <Text style={[styles.miniCardValue, { color: colors.success }]}>{formatCurrencySmart(totalAssets, currencySymbol)}</Text>
              </View>
 
              <View style={[styles.miniCard, { backgroundColor: colors.cardBackground }]}>
                <View style={[styles.miniCardIcon, { backgroundColor: "rgba(255, 71, 87, 0.15)" }]}>
                  <TrendingDown size={20} color={colors.error} strokeWidth={2.5} />
                </View>
                <Text style={[styles.miniCardLabel, { color: colors.text.secondary }]}>{t('dashboard.totalLiabilities')}</Text>
                <Text style={[styles.miniCardValue, { color: colors.error }]}>{formatCurrencySmart(totalLiabilities, currencySymbol)}</Text>
              </View>
            </View>
 
            <View style={[styles.netWorthCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.netWorthHeader}>
                <View style={[styles.miniCardIcon, { backgroundColor: "rgba(147, 51, 234, 0.15)" }]}>
                  <PieChart size={20} color={colors.purple.light} strokeWidth={2.5} />
                </View>
                <Text style={[styles.miniCardLabel, { color: colors.text.secondary }]}>{t('dashboard.netWorth')}</Text>
              </View>
              <Text style={[styles.netWorthValue, { color: netWorth >= 0 ? colors.success : colors.error }]}>
                {formatCurrencySmart(netWorth, currencySymbol)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.analyticsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('dashboard.financialAnalysis')}</Text>

          <View style={styles.analyticsGrid}>
            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.analyticsHeader}>
                <Text style={[styles.analyticsLabel, { color: colors.text.secondary }]}>{t('dashboard.assetLiabilityRatio')}</Text>
                <View style={styles.analyticsBadge}>
                  <Text style={[styles.analyticsBadgeText, { color: colors.purple.light }]}>
                    {totalLiabilities > 0 ? "Ratio" : "Ideal"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.analyticsValue, { color: colors.purple.light }]}>
                {totalLiabilities > 0 ? formatNumber(totalAssets / totalLiabilities, 2) : "∞"}
              </Text>
              <View style={[styles.analyticsBar, { backgroundColor: "rgba(147, 51, 234, 0.2)" }]}>
                <View
                  style={[ 
                    styles.analyticsBarFill,
                    {
                      backgroundColor: colors.purple.primary,
                      width: totalLiabilities > 0 ? `${Math.min((totalAssets / totalLiabilities) * 20, 100)}%` : "100%",
                    },
                  ]}
                />
              </View>
            </View>

            <View style={[styles.analyticsCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.analyticsHeader}>
                <Text style={[styles.analyticsLabel, { color: colors.text.secondary }]}>{t('dashboard.debtRatio')}</Text>
                <View style={styles.analyticsBadge}>
                  <Text style={[styles.analyticsBadgeText, { color: colors.accent.cyan }]}>{t('dashboard.percentage')}</Text>
                </View>
              </View>
              <Text style={[styles.analyticsValue, { color: colors.accent.cyan }]}>
                {totalAssets > 0 ? formatPercentage((totalLiabilities / totalAssets) * 100, 1) : "%0"}
              </Text>
              <View style={[styles.analyticsBar, { backgroundColor: "rgba(6, 182, 212, 0.2)" }]}>
                <View
                  style={[ 
                    styles.analyticsBarFill,
                    {
                      backgroundColor: colors.accent.cyan,
                      width: totalAssets > 0 ? `${Math.min((totalLiabilities / totalAssets) * 100, 100)}%` : "0%",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Charts Section */}
        <View style={styles.chartsSection}>
          <View style={styles.chartsSectionHeader}>
            <BarChart3 size={24} color={colors.purple.light} strokeWidth={2.5} />
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('dashboard.graphicalAnalysis')}</Text>
          </View>
          <FinancialCharts
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            totalReceivables={totalReceivables}
            totalInstallments={totalInstallments}
            netWorth={netWorth}
          />
        </View>

        {/* AI Analiz */}
        {isAiEnabled && (
          <View style={styles.analyticsSection}>
            <View style={[styles.aiCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.aiHeader}>
                <View style={[styles.aiIcon, { backgroundColor: "rgba(147, 51, 234, 0.12)" }]}>
                  <Sparkles size={18} color={colors.purple.light} strokeWidth={2.5} />
                </View>
                <Text style={[styles.aiTitle, { color: colors.text.primary }]}>{t('dashboard.aiCfoAnalysis')}</Text>
              </View>
              <Text style={[styles.aiSubtitle, { color: colors.text.primary }]}>
                {aiResult ? t('dashboard.aiCfoSubtitleActive') : t('dashboard.aiCfoSubtitle')}
              </Text>
              <TouchableOpacity
                style={[styles.aiButton, { backgroundColor: colors.purple.primary }]}
                onPress={handleAiAnalyze}
                disabled={aiLoading}
              >
                <Text style={styles.aiButtonText}>
                  {aiLoading ? t('dashboard.aiCfoAnalyzing') : aiResult ? t('dashboard.aiCfoNewAnalysis') : t('dashboard.aiCfoAnalyze')}
                </Text>
              </TouchableOpacity>
              {aiError ? <Text style={[styles.aiError, { color: colors.error }]}>{aiError}</Text> : null}
              {aiResult ? (
                <View style={styles.aiResult}>
                  <Markdown
                    style={{
                      body: {
                        color: colors.text.primary,
                        fontSize: 15,
                        lineHeight: 22,
                        marginBottom: 12
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
                      },
                      bullet_list: {
                        marginBottom: 8
                      },
                      list_item: {
                        marginBottom: 4
                      }
                    }}
                  >
                    {aiResult.summary}
                  </Markdown>

                  {/* Show item counts */}
                  {(aiResult.risks.length > 0 || aiResult.actions.length > 0) && (
                    <View style={styles.aiStatsContainer}>
                      {aiResult.risks.length > 0 && (
                        <View style={[styles.aiStatBadge, { backgroundColor: 'rgba(255, 71, 87, 0.1)' }]}>
                          <Text style={[styles.aiStatNumber, { color: colors.error }]}>{aiResult.risks.length}</Text>
                          <Text style={[styles.aiStatLabel, { color: colors.error }]}>{t('dashboard.risk')}</Text>
                        </View>
                      )}
                      {aiResult.actions.length > 0 && (
                        <View style={[styles.aiStatBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                          <Text style={[styles.aiStatNumber, { color: colors.success }]}>{aiResult.actions.length}</Text>
                          <Text style={[styles.aiStatLabel, { color: colors.success }]}>{t('dashboard.recommendation')}</Text>
                        </View>
                      )}
                    </View>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.reportButton, { borderColor: colors.purple.primary }]}
                    onPress={() => setShowReport(true)}
                  >
                    <Text style={[styles.reportButtonText, { color: colors.purple.primary }]}>{t('dashboard.openDetailedReport')}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        )}
      </ScrollView>

      <CFOReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        reportData={aiResult}
        metrics={{
          totalAssets,
          totalLiabilities,
          netWorth,
          safeToSpend,
          totalReceivables,
          totalInstallments,
          findeksScore: profile.findeksScore,
          salary: profile.salary,
          additionalIncome: profile.additionalIncome,
        }}
      />
      {/* Custom Alert */}
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
    paddingBottom: 100,
  },
  modernHeader: {
    marginBottom: 24,
    overflow: 'hidden',
    borderRadius: 32,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
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
  neonLine1: {
    position: 'absolute',
    width: '60%',
    height: 2,
    backgroundColor: 'rgba(0, 223, 216, 0.4)',
    top: 30,
    right: 0,
    shadowColor: '#00DFD8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  neonLine2: {
    position: 'absolute',
    width: '40%',
    height: 2,
    backgroundColor: 'rgba(255, 0, 128, 0.4)',
    bottom: 40,
    left: 0,
    shadowColor: '#FF0080',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerTextContainer: {
    gap: 6,
  },
  headerRight: {
    marginLeft: 16,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.3,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 8,
    color: '#FFFFFF',
  },
  dateContainer: {
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  modernHeaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroCardContainer: {
    marginBottom: 28,
  },
  heroCardWrapper: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#9333EA",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  heroCard: {
    padding: 32,
    minHeight: 200,
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    zIndex: 10,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  heroIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroLabel: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  heroValue: {
    fontSize: 56,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -1,
  },
  heroSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.3,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: -30,
    left: -30,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: 100,
    right: 20,
  },
  tipBannerContainer: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tipBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  tipDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  tipIndicators: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  tipIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  tipIndicatorDotActive: {
    width: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  overviewSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  miniCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  miniCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  miniCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  miniCardValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  netWorthCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  netWorthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  netWorthValue: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  analyticsSection: {
    marginBottom: 20,
  },
  chartsSection: {
    marginBottom: 28,
  },
  chartsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  analyticsGrid: {
    gap: 16,
  },
  analyticsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  analyticsLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  analyticsBadge: {
    backgroundColor: "rgba(147, 51, 234, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  analyticsBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  analyticsValue: {
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  analyticsBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  analyticsBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  aiCard: {
    marginTop: 8,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  aiSubtitle: {
    fontSize: 13,
    marginBottom: 10,
  },
  aiButton: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  aiButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  aiError: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  aiResult: {
    marginTop: 6,
    gap: 6,
  },
  aiResultTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  aiSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  aiList: {
    gap: 4,
    marginTop: 4,
  },
  aiListItem: {
    fontSize: 13,
    lineHeight: 18,
    flexWrap: "wrap",
  },
  aiStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  aiStatBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  aiStatNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  aiStatLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  reportButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  reportButtonText: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
