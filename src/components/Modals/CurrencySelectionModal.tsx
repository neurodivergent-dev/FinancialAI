import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { X, Check, DollarSign } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  currentCurrency: string;
  onSelect: (currency: string) => void;
}

const CURRENCIES: Currency[] = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
  { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£' },
  { code: 'JPY', name: 'Japon Yeni', symbol: '¥' },
];

export const CurrencySelectionModal: React.FC<CurrencySelectionModalProps> = ({
  visible,
  onClose,
  currentCurrency,
  onSelect,
}) => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const handleSelect = (currencyCode: string) => {
    onSelect(currencyCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(147, 51, 234, 0.15)' }]}>
                <DollarSign size={20} color={colors.purple.light} strokeWidth={2.5} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                {t('settings.currency')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, { color: colors.text.tertiary }]}>
            {t('common.selectCurrency')}
          </Text>

          <View style={styles.currencyList}>
            {CURRENCIES.map((curr) => {
              const isSelected = currentCurrency === curr.code;
              return (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyItem,
                    {
                      backgroundColor: isSelected 
                        ? (isDarkMode ? 'rgba(147, 51, 234, 0.15)' : 'rgba(147, 51, 234, 0.08)')
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'),
                      borderColor: isSelected ? colors.purple.primary : 'transparent',
                    },
                  ]}
                  onPress={() => handleSelect(curr.code)}
                >
                  <View style={styles.currencyInfo}>
                    <View style={[
                      styles.currBadge, 
                      { backgroundColor: isSelected ? colors.purple.primary : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') }
                    ]}>
                      <Text style={[
                        styles.currBadgeText, 
                        { color: isSelected ? '#FFFFFF' : colors.text.secondary }
                      ]}>
                        {curr.symbol}
                      </Text>
                    </View>
                    <View style={styles.currencyNames}>
                      <Text style={[styles.currencyCode, { color: colors.text.primary }]}>
                        {curr.code}
                      </Text>
                      <Text style={[styles.currencyName, { color: colors.text.tertiary }]}>
                        {t(`common.currencies.${curr.code}`)}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.purple.primary }]}>
                      <Check size={16} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    marginLeft: 52,
  },
  closeButton: {
    padding: 4,
  },
  currencyList: {
    gap: 12,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  currBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currBadgeText: {
    fontSize: 18,
    fontWeight: '800',
  },
  currencyNames: {
    gap: 2,
  },
  currencyCode: {
    fontSize: 17,
    fontWeight: '700',
  },
  currencyName: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
