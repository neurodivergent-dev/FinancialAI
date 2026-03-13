import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatNumberAbbreviated, formatCurrency, formatPercentage } from '../../utils/formatters';

interface FinancialChartsProps {
  totalAssets: number;
  totalLiabilities: number;
  totalReceivables: number;
  totalInstallments: number;
  netWorth: number;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  totalAssets,
  totalLiabilities,
  totalReceivables,
  totalInstallments,
  netWorth,
}) => {
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const { t } = useTranslation();

  // Percentages
  const totalCombined = totalAssets + totalLiabilities;
  // For asset/debt distribution: If total is 0, show 50/50 in the chart, otherwise calculate the ratio.
  const assetPercentage = totalCombined > 0 ? (totalAssets / totalCombined) * 100 : 50;
  const liabilityPercentage = totalCombined > 0 ? (totalLiabilities / totalCombined) * 100 : 50;

  // Debt/Asset Ratio: If asset is 0 and there's debt, ratio is considered "infinite". Can be shown with a ceiling of 100% or higher in the interface.
  // If both asset and debt are 0, ratio is 0.
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : (totalLiabilities > 0 ? 100 : 0);

  // Liquidity Ratio (similar to Current Ratio): If debt is 0, liquidity is considered "infinite".
  // If asset exists, a high percentage (e.g. 1000%) is shown, otherwise it's 0 if no asset exists either.
  const liquidityRatio = totalLiabilities > 0 ? (totalAssets / totalLiabilities) * 100 : (totalAssets > 0 ? 1000 : 0);

  return (
    <View style={styles.container}>
      {/* Asset/Liability Distribution */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('dashboard.assetAndLiabilityDistribution')}</Text>

        <View style={styles.distributionRow}>
          <View style={styles.distributionItem}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 255, 157, 0.15)' }]}>
              <TrendingUp size={20} color="#00FF9D" strokeWidth={2.5} />
            </View>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t('dashboard.assets')}</Text>
            <Text style={[styles.value, { color: '#00FF9D' }]}>
              {formatCurrency(totalAssets, currencySymbol, 0)}
            </Text>
            <Text style={[styles.percentage, { color: colors.text.tertiary }]}>
              {formatPercentage(assetPercentage, 0)}
            </Text>
          </View>

          <View style={styles.distributionItem}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 71, 87, 0.15)' }]}>
              <TrendingDown size={20} color="#FF4757" strokeWidth={2.5} />
            </View>
            <Text style={[styles.label, { color: colors.text.secondary }]}>{t('dashboard.liabilities')}</Text>
            <Text style={[styles.value, { color: '#FF4757' }]}>
              {formatCurrency(totalLiabilities, currencySymbol, 0)}
            </Text>
            <Text style={[styles.percentage, { color: colors.text.tertiary }]}>
              {formatPercentage(liabilityPercentage, 0)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, { width: `${assetPercentage}%`, backgroundColor: '#00FF9D' }]} />
          <View style={[styles.progressSegment, { width: `${liabilityPercentage}%`, backgroundColor: '#FF4757' }]} />
        </View>
      </View>

      {/* Financial Metrics */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('dashboard.financialMetrics')}</Text>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <DollarSign size={18} color="#06B6D4" strokeWidth={2.5} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>{t('dashboard.receivables')}</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.accent.cyan }]}>
            {formatCurrency(totalReceivables, currencySymbol, 0)}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
              <CreditCard size={18} color="#9333EA" strokeWidth={2.5} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>{t('dashboard.installments')}</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.purple.light }]}>
            {formatCurrency(totalInstallments, currencySymbol, 0)}
          </Text>
        </View>
      </View>

      {/* Ratios */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{t('dashboard.financialRatios')}</Text>

        <View style={styles.ratioItem}>
          <View style={styles.ratioHeader}>
            <Text style={[styles.ratioLabel, { color: colors.text.secondary }]}>{t('dashboard.debtToAssetRatio')}</Text>
            <Text style={[styles.ratioValue, { color: debtRatio > 50 ? '#FF4757' : '#00FF9D' }]}>
              {formatPercentage(debtRatio, 0)}
            </Text>
          </View>
          <View style={[styles.ratioBar, { backgroundColor: colors.text.tertiary + '20' }]}>
            <View
              style={[
                styles.ratioBarFill,
                {
                  width: `${Math.min(debtRatio, 100)}%`,
                  backgroundColor: debtRatio > 50 ? '#FF4757' : '#00FF9D',
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.ratioItem}>
          <View style={styles.ratioHeader}>
            <Text style={[styles.ratioLabel, { color: colors.text.secondary }]}>{t('dashboard.liquidityRatio')}</Text>
            <Text style={[styles.ratioValue, { color: liquidityRatio > 100 ? '#00FF9D' : '#FF4757' }]}>
              {formatPercentage(liquidityRatio, 0)}
            </Text>
          </View>
          <View style={[styles.ratioBar, { backgroundColor: colors.text.tertiary + '20' }]}>
            <View
              style={[
                styles.ratioBarFill,
                {
                  width: `${Math.min(liquidityRatio, 100)}%`,
                  backgroundColor: liquidityRatio > 100 ? '#00FF9D' : '#FF4757',
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  distributionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  distributionItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.1)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratioItem: {
    marginBottom: 16,
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratioLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratioValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratioBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratioBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
