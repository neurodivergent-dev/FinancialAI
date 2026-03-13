import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Wallet, TrendingUp, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { gradients } from '../../theme/colors';

interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (asset: {
    type: 'liquid' | 'term' | 'gold_currency' | 'funds';
    name: string;
    value: number;
    currency: string;
    details?: string;
  }) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ visible, onClose, onAdd }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<'liquid' | 'term' | 'gold_currency' | 'funds'>('liquid');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [details, setDetails] = useState('');

  const assetTypes = [
    { id: 'liquid', label: t('finance.assets.types.liquid') },
    { id: 'term', label: t('finance.assets.types.term') },
    { id: 'gold_currency', label: t('finance.assets.types.gold_currency') },
    { id: 'funds', label: t('finance.assets.types.funds') },
  ] as const;

  const handleAdd = () => {
    if (!name.trim() || !value.trim()) {
      return;
    }

    onAdd({
      type,
      name: name.trim(),
      value: parseFloat(value) || 0,
      currency,
      details: details.trim() || undefined,
    });

    // Reset form
    setType('liquid');
    setName('');
    setValue('');
    setCurrency('TRY');
    setDetails('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={['#22c55e', '#10b981']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <TrendingUp size={28} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.modalTitle} numberOfLines={2} adjustsFontSizeToFit>{t('finance.assets.addTitle')}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleAdd}
                  style={[styles.headerActionButton, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
                  disabled={!name.trim() || !value.trim()}
                >
                  <Check size={22} color="#FFFFFF" strokeWidth={3} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          >
            {/* Asset Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.assets.typeLabel')}</Text>
              <View style={styles.typeContainer}>
                {assetTypes.map((assetType) => (
                  <TouchableOpacity
                    key={assetType.id}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: type === assetType.id ? 'rgba(34, 197, 94, 0.15)' : colors.background,
                        borderColor: type === assetType.id ? '#22c55e' : colors.border.secondary,
                      },
                    ]}
                    onPress={() => setType(assetType.id)}
                  >
                    {type === assetType.id && (
                      <View style={styles.checkIcon}>
                        <Check size={16} color="#22c55e" strokeWidth={3} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: type === assetType.id ? '#22c55e' : colors.text.primary },
                      ]}
                    >
                      {assetType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.assets.nameLabel')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Wallet size={20} color={colors.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('finance.assets.namePlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.assets.amountLabel')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.currencyPrefix, { color: colors.text.tertiary }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={value}
                  onChangeText={setValue}
                  placeholder={t('finance.assets.amountPlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Details */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.assets.detailsLabel')}</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text.primary }]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder={t('finance.assets.detailsPlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
    overflow: 'hidden',
  },

  // Header Styles
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form Styles
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  // Type Selection
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 6,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  // Input Styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    fontWeight: '600',
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
  },
  textAreaContainer: {
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 0,
  },

  addButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
