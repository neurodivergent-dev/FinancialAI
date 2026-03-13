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
import { X, CreditCard, TrendingUp, Check, Calendar, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { gradients } from '../../theme/colors';

interface AddLiabilityModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (liability: {
    type: 'credit_card' | 'personal_debt';
    name: string;
    totalLimit?: number;
    currentDebt: number;
    dueDate?: string;
    debtorName?: string;
    details?: string;
  }) => void;
}

export const AddLiabilityModal: React.FC<AddLiabilityModalProps> = ({ visible, onClose, onAdd }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<'credit_card' | 'personal_debt'>('credit_card');
  const [name, setName] = useState('');
  const [totalLimit, setTotalLimit] = useState('');
  const [currentDebt, setCurrentDebt] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [debtorName, setDebtorName] = useState('');
  const [details, setDetails] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !currentDebt.trim()) {
      return;
    }

    onAdd({
      type,
      name: name.trim(),
      totalLimit: type === 'credit_card' && totalLimit ? parseFloat(totalLimit) : undefined,
      currentDebt: parseFloat(currentDebt) || 0,
      dueDate: type === 'credit_card' && dueDate ? dueDate.trim() : undefined,
      debtorName: type === 'personal_debt' && debtorName ? debtorName.trim() : undefined,
      details: details.trim() || undefined,
    });

    // Reset form
    setType('credit_card');
    setName('');
    setTotalLimit('');
    setCurrentDebt('');
    setDueDate('');
    setDebtorName('');
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
              colors={['#ff4757', '#ff6348']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <TrendingUp size={28} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.modalTitle} numberOfLines={2} adjustsFontSizeToFit>{t('finance.liabilities.addTitle')}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleAdd}
                  style={[styles.headerActionButton, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
                  disabled={!name.trim() || !currentDebt.trim()}
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
            {/* Liability Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.liabilities.typeLabel')}</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === 'credit_card' ? 'rgba(255, 71, 87, 0.15)' : colors.background,
                      borderColor: type === 'credit_card' ? '#ff4757' : colors.border.secondary,
                    },
                  ]}
                  onPress={() => setType('credit_card')}
                >
                  {type === 'credit_card' && (
                    <View style={styles.checkIcon}>
                      <Check size={16} color="#ff4757" strokeWidth={3} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: type === 'credit_card' ? '#ff4757' : colors.text.primary },
                    ]}
                  >
                    {t('finance.liabilities.types.credit_card')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === 'personal_debt' ? 'rgba(255, 71, 87, 0.15)' : colors.background,
                      borderColor: type === 'personal_debt' ? '#ff4757' : colors.border.secondary,
                    },
                  ]}
                  onPress={() => setType('personal_debt')}
                >
                  {type === 'personal_debt' && (
                    <View style={styles.checkIcon}>
                      <Check size={16} color="#ff4757" strokeWidth={3} />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: type === 'personal_debt' ? '#ff4757' : colors.text.primary },
                    ]}
                  >
                    {t('finance.liabilities.types.personal_debt')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.liabilities.nameLabel')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <CreditCard size={20} color={colors.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('finance.liabilities.namePlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>

            {/* Current Debt */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.liabilities.amountLabel')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.currencyPrefix, { color: colors.text.tertiary }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={currentDebt}
                  onChangeText={setCurrentDebt}
                  placeholder={t('finance.liabilities.amountPlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {type === 'credit_card' && (
              <>
                {/* Total Limit */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.liabilities.limitLabel')}</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.currencyPrefix, { color: colors.text.tertiary }]}>{currencySymbol}</Text>
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      value={totalLimit}
                      onChangeText={setTotalLimit}
                      placeholder={t('finance.liabilities.amountPlaceholder')}
                      placeholderTextColor={colors.text.tertiary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Due Date */}
                <View style={styles.section}>
                  <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.liabilities.statementDayLabel')}</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Calendar size={20} color={colors.text.tertiary} strokeWidth={2} />
                    <TextInput
                      style={[styles.input, { color: colors.text.primary }]}
                      value={dueDate}
                      onChangeText={setDueDate}
                      placeholder={t('finance.liabilities.statementDayPlaceholder')}
                      placeholderTextColor={colors.text.tertiary}
                    />
                  </View>
                </View>
              </>
            )}

            {type === 'personal_debt' && (
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.liabilities.creditor')}</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                  <User size={20} color={colors.text.tertiary} strokeWidth={2} />
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    value={debtorName}
                    onChangeText={setDebtorName}
                    placeholder={t('finance.liabilities.creditorPlaceholder')}
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              </View>
            )}

            {/* Details */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.liabilities.detailsLabel')}</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text.primary }]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder={t('finance.liabilities.detailsPlaceholder')}
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
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
