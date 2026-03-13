import React, { useState, useEffect } from 'react';
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
import { X, HandCoins, TrendingUp, Calendar, User, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { gradients } from '../../theme/colors';
import { Receivable } from '../../types';

interface EditReceivableModalProps {
  visible: boolean;
  onClose: () => void;
  receivable: Receivable | null;
  onUpdate: (id: string, updatedReceivable: Partial<Receivable>) => void;
}

export const EditReceivableModal: React.FC<EditReceivableModalProps> = ({ visible, onClose, receivable, onUpdate }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const [debtor, setDebtor] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [details, setDetails] = useState('');
  const insets = useSafeAreaInsets();

  // Populate form when receivable changes
  useEffect(() => {
    if (receivable) {
      setDebtor(receivable.debtor);
      setAmount(receivable.amount.toString());
      setDueDate(receivable.dueDate);
      setDetails(receivable.details || '');
    } else {
      resetForm();
    }
  }, [receivable]);

  const resetForm = () => {
    setDebtor('');
    setAmount('');
    setDueDate('');
    setDetails('');
  };

  const handleUpdate = () => {
    if (!receivable || !debtor.trim() || !amount.trim() || !dueDate.trim()) {
      return;
    }

    onUpdate(receivable.id, {
      debtor: debtor.trim(),
      amount: parseFloat(amount) || 0,
      dueDate: dueDate.trim(),
      details: details.trim() || undefined,
    });

    resetForm();
    onClose();
  };

  if (!receivable) {
    return null;
  }

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
              colors={['#06B6D4', '#0EA5E9']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <TrendingUp size={28} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.modalTitle} numberOfLines={2} adjustsFontSizeToFit>{t('finance.receivables.editTitle')}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleUpdate}
                  style={[styles.headerActionButton, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
                  disabled={!debtor.trim() || !amount.trim() || !dueDate.trim()}
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
            {/* Debtor */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.receivables.nameLabel')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <User size={20} color={colors.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={debtor}
                  onChangeText={setDebtor}
                  placeholder={t('finance.receivables.namePlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.receivables.amountLabel')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.currencyPrefix, { color: colors.text.tertiary }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder={t('finance.liabilities.amountPlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Due Date */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.receivables.dueDateLabel')}</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Calendar size={20} color={colors.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder={t('finance.receivables.dueDatePlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>

            {/* Details */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>{t('finance.receivables.detailsLabel')}</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text.primary }]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder={t('finance.receivables.detailsPlaceholder')}
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
});
