import React, { useState } from 'react';
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
import { X, Calendar, TrendingDown, Clock, DollarSign, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { gradients } from '../../theme/colors';

interface AddInstallmentModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (installment: {
    name?: string;
    installmentAmount: number;
    endDate: string;
    remainingMonths: number;
    details?: string;
  }) => void;
}

export const AddInstallmentModal: React.FC<AddInstallmentModalProps> = ({ visible, onClose, onAdd }) => {
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remainingMonths, setRemainingMonths] = useState('');
  const [details, setDetails] = useState('');

  const handleAdd = () => {
    if (!installmentAmount.trim() || !endDate.trim() || !remainingMonths.trim()) {
      return;
    }

    onAdd({
      name: name.trim() || undefined,
      installmentAmount: parseFloat(installmentAmount) || 0,
      endDate: endDate.trim(),
      remainingMonths: parseInt(remainingMonths) || 0,
      details: details.trim() || undefined,
    });

    // Reset form
    setName('');
    setInstallmentAmount('');
    setEndDate('');
    setRemainingMonths('');
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
              colors={['#EC4899', '#A855F7']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <TrendingDown size={28} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={styles.modalTitle}>Yeni Taksit Ekle</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleAdd}
                  style={[styles.headerActionButton, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
                  disabled={!installmentAmount.trim() || !endDate.trim() || !remainingMonths.trim()}
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
            {/* Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>İsim (Opsiyonel)</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <DollarSign size={20} color={colors.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Örn: Telefon Taksiti"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>

            {/* Installment Amount */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Aylık Taksit Tutarı</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.currencyPrefix, { color: colors.text.tertiary }]}>{currencySymbol}</Text>
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={installmentAmount}
                  onChangeText={setInstallmentAmount}
                  placeholder="0.00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Remaining Months */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Kalan Ay</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Clock size={20} color={colors.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={remainingMonths}
                  onChangeText={setRemainingMonths}
                  placeholder="Örn: 12"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* End Date */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Bitiş Tarihi</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                <Calendar size={20} color={colors.text.tertiary} strokeWidth={2} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="Örn: 15/12/2025"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
            </View>

            {/* Details */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text.primary }]}>Detaylar (Opsiyonel)</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.text.primary }]}
                  value={details}
                  onChangeText={setDetails}
                  placeholder="Ek bilgiler..."
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

  addButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});
