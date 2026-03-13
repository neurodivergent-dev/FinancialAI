import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../src/context/CurrencyContext';
import { useTheme } from '../src/context/ThemeContext';

interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
}

const currencies: CurrencyItem[] = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
  { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'İngiliz Sterlini', symbol: '£' },
  { code: 'JPY', name: 'Japon Yeni', symbol: '¥' },
  { code: 'CAD', name: 'Kanada Doları', symbol: 'CA$' },
  { code: 'AUD', name: 'Avustralya Doları', symbol: 'A$' },
];

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CurrencyModal({ visible, onClose }: CurrencyModalProps) {
  const { t } = useTranslation();
  const { currency, currencySymbol, setCurrency } = useCurrency();
  const { colors } = useTheme();

  const handleCurrencySelect = (code: string) => {
    setCurrency(code);
    onClose();
  };

  const renderItem = ({ item }: { item: CurrencyItem }) => (
    <TouchableOpacity
      style={[styles.currencyOption, { backgroundColor: colors.cardBackground, borderColor: colors.border.secondary }, item.code === currency && styles.selectedCurrencyOption]}
      onPress={() => handleCurrencySelect(item.code)}
    >
      <View style={styles.currencyInfo}>
        <Text style={[styles.currencyCode, { color: colors.text.primary }, item.code === currency && styles.selectedCurrencyCode]}>
          {item.code} {item.symbol}
        </Text>
        <Text style={[styles.currencyName, { color: colors.text.secondary }, item.code === currency && styles.selectedCurrencyName]}>
          {t(`common.currencies.${item.code}`)}
        </Text>
      </View>
      {item.code === currency && (
        <View style={styles.checkmarkContainer}>
          <Text style={[styles.checkmark, { color: colors.purple.primary }]}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.centeredView, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalView, { backgroundColor: colors.background, borderColor: colors.border.primary }]}>
          <Text style={[styles.modalTitle, { color: colors.text.primary }]}>{t('common.selectCurrency')}</Text>

          <FlashList<CurrencyItem>
            data={currencies}
            keyExtractor={(item: CurrencyItem) => item.code}
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
            style={styles.currencyList}
            estimatedItemSize={70}
          />

          <TouchableOpacity
            style={[styles.button, styles.buttonCancel, { backgroundColor: colors.cardBackground, borderColor: colors.border.secondary }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: colors.text.primary }]}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  triggerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '95%',
    maxWidth: 600,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 2
  },
  currencyOption: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCurrencyOption: {
    borderLeftWidth: 4,
    borderLeftColor: '#9333EA', // purple color
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedCurrencyCode: {
    color: '#9333EA', // purple color
  },
  currencyName: {
    fontSize: 14,
    marginTop: 3,
  },
  selectedCurrencyName: {
    color: '#9333EA', // purple color
  },
  checkmarkContainer: {
    paddingLeft: 10,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
  },
  buttonCancel: {
    backgroundColor: '#333',
  },
  buttonText: {
    fontWeight: 'bold'
  },
  currencyList: {
    maxHeight: 350,
  }
});