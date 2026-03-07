import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react-native';
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

  // Yüzdeler
  const totalCombined = totalAssets + totalLiabilities;
  // Varlık/Borç dağılımı için: Eğer toplam 0 ise, grafikte 50/50 göster, değilse oranı hesapla.
  const assetPercentage = totalCombined > 0 ? (totalAssets / totalCombined) * 100 : 50;
  const liabilityPercentage = totalCombined > 0 ? (totalLiabilities / totalCombined) * 100 : 50;

  // Borç/Varlık Oranı: Varlık 0 ise ve borç varsa, oran "sonsuz" kabul edilir. Arayüzde %100 veya daha yüksek bir tavanla gösterilebilir.
  // Varlık ve borç 0 ise, oran 0'dır.
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : (totalLiabilities > 0 ? 100 : 0);

  // Likidite Oranı (Cari Oran benzeri): Borç 0 ise, likidite "sonsuz" kabul edilir.
  // Varlık varsa yüksek bir yüzde (örn. %1000) gösterilir, varlık da yoksa 0'dır.
  const liquidityRatio = totalLiabilities > 0 ? (totalAssets / totalLiabilities) * 100 : (totalAssets > 0 ? 1000 : 0);

  return (
    <View style={styles.container}>
      {/* Varlık/Borç Dağılımı */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Varlık & Borç Dağılımı</Text>

        <View style={styles.distributionRow}>
          <View style={styles.distributionItem}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(0, 255, 157, 0.15)' }]}>
              <TrendingUp size={20} color="#00FF9D" strokeWidth={2.5} />
            </View>
            <Text style={[styles.label, { color: colors.text.secondary }]}>Varlıklar</Text>
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
            <Text style={[styles.label, { color: colors.text.secondary }]}>Borçlar</Text>
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

      {/* Finansal Metrikler */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Finansal Metrikler</Text>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
              <DollarSign size={18} color="#06B6D4" strokeWidth={2.5} />
            </View>
            <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>Alacaklar</Text>
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
            <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>Taksitler</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.purple.light }]}>
            {formatCurrency(totalInstallments, currencySymbol, 0)}
          </Text>
        </View>
      </View>

      {/* Oranlar */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Finansal Oranlar</Text>

        <View style={styles.ratioItem}>
          <View style={styles.ratioHeader}>
            <Text style={[styles.ratioLabel, { color: colors.text.secondary }]}>Borç/Varlık Oranı</Text>
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
            <Text style={[styles.ratioLabel, { color: colors.text.secondary }]}>Likidite Oranı</Text>
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
