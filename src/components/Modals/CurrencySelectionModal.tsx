import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

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
];

export const CurrencySelectionModal: React.FC<CurrencySelectionModalProps> = ({
  visible,
  onClose,
  currentCurrency,
  onSelect,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleSelect = (currencyCode: string) => {
    onSelect(currencyCode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{t('common.selectCurrency')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.currencyList}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyItem,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: currentCurrency === currency.code ? colors.purple.primary : colors.border.secondary,
                  },
                ]}
                onPress={() => handleSelect(currency.code)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={[styles.currencySymbol, { color: colors.text.primary }]}>
                    {currency.symbol}
                  </Text>
                  <View style={styles.currencyDetails}>
                    <Text style={[styles.currencyCode, { color: colors.text.primary }]}>
                      {currency.code}
                    </Text>
                    <Text style={[styles.currencyName, { color: colors.text.secondary }]}>
                      {t(`common.currencies.${currency.code}`)}
                    </Text>
                  </View>
                </View>
                {currentCurrency === currency.code && (
                  <Check size={24} color={colors.purple.primary} strokeWidth={3} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  currencyList: {
    paddingHorizontal: 20,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
  },
});
