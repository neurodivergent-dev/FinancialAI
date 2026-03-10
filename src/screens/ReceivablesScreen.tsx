import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoreVertical, Edit, Trash2, TrendingUp, HandCoins, Plus, Calendar } from 'lucide-react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { gradients } from '../theme/colors';
import { AddReceivableModal } from '../components/Modals/AddReceivableModal';
import { EditReceivableModal } from '../components/Modals/EditReceivableModal';
import { formatCurrency } from '../utils/formatters';

export const ReceivablesScreen = () => {
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency(); // Get currency symbol from context
  const insets = useSafeAreaInsets();
  const { receivables, addReceivable, updateReceivable, removeReceivable } = useFinanceStore();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalReceivables = receivables.reduce(
    (total, item) => total + item.amount,
    0
  );

  const handleEditReceivable = (receivable) => {
    setSelectedReceivable(receivable);
    setEditModalVisible(true);
    setOptionsModalVisible(false);
  };

  const handleDeleteReceivable = (id) => {
    removeReceivable(id);
    setOptionsModalVisible(false);
  };

  const handleReceivablePress = (receivable) => {
    setSelectedItem(receivable);
    setOptionsModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
              Toplam Alacak
            </Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Alacaklarım
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
            <HandCoins size={28} color={colors.accent.cyan} strokeWidth={2} />
          </View>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={['#06B6D4', '#0EA5E9', '#0891B2']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Işık Hüzmeleri */}
            <View style={styles.lightBeam1} />
            <View style={styles.lightBeam2} />
            <View style={styles.lightBeam3} />

            {/* Glow Circles */}
            <View style={styles.glowCircle1} />
            <View style={styles.glowCircle2} />

            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <TrendingUp size={24} color="rgba(255, 255, 255, 0.95)" strokeWidth={2.5} />
              </View>
              <View style={styles.heroTextArea}>
                <Text style={styles.heroLabel}>Toplam Alacak</Text>
                <Text style={styles.heroValue}>
                  {formatCurrency(totalReceivables, currencySymbol)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      <FlatList
        data={receivables}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                  <HandCoins size={20} color={colors.accent.cyan} strokeWidth={2.5} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                    {item.debtor}
                  </Text>
                  <View style={styles.dateTag}>
                    <Calendar size={12} color={colors.accent.cyan} strokeWidth={2.5} />
                    <Text style={[styles.dateText, { color: colors.accent.cyan }]}>
                      {item.dueDate}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => handleReceivablePress(item)}
              >
                <MoreVertical size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardBottom}>
              <Text style={[styles.cardValue, { color: colors.accent.cyan }]}>
                {formatCurrency(item.amount, currencySymbol)}
              </Text>
              {item.details && (
                <Text style={[styles.cardDetails, { color: colors.text.secondary }]}>
                  {item.details}
                </Text>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
              <HandCoins size={48} color={colors.accent.cyan} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              Henüz alacak eklenmemiş
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
              Alacaklarınızı eklemek için + butonuna tıklayın
            </Text>
          </View>
        }
      />

      {/* Options Modal */}
      <Modal
        visible={optionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={[styles.optionsModal, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={[styles.optionButton, { borderBottomColor: colors.border.secondary }]}
              onPress={() => handleEditReceivable(selectedItem)}
            >
              <Edit size={22} color={colors.text.primary} strokeWidth={2} />
              <Text style={[styles.optionText, { color: colors.text.primary }]}>Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.deleteOption]}
              onPress={() => handleDeleteReceivable(selectedItem.id)}
            >
              <Trash2 size={22} color={colors.error} strokeWidth={2} />
              <Text style={[styles.optionText, { color: colors.error }]}>Sil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 16 }]}
        onPress={() => setAddModalVisible(true)}
      >
        <LinearGradient
          colors={['#06B6D4', '#0EA5E9']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={3} />
        </LinearGradient>
      </TouchableOpacity>

      <AddReceivableModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={(receivable) => addReceivable(receivable)}
      />

      <EditReceivableModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        receivable={selectedReceivable}
        onUpdate={(id, updatedReceivable) => {
          updateReceivable(id, updatedReceivable);
          setSelectedReceivable(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header Styles
  header: {
    padding: 24,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Card
  heroCardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  heroCard: {
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  // Işık Hüzmeleri
  lightBeam1: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
    top: -100,
    right: -50,
    transform: [{ rotate: '45deg' }],
  },
  lightBeam2: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 75,
    bottom: -75,
    left: -40,
    transform: [{ rotate: '-30deg' }],
  },
  lightBeam3: {
    position: 'absolute',
    width: 100,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -50,
    left: '30%',
    transform: [{ rotate: '20deg' }],
  },
  glowCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
    top: -40,
    right: -30,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  glowCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    bottom: -20,
    left: 20,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  heroTextArea: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // List
  list: {
    padding: 24,
    paddingTop: 16,
    paddingBottom: 200,
  },

  // Card Styles
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  dateTag: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardBottom: {
    paddingLeft: 60,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardDetails: {
    fontSize: 13,
    marginTop: 4,
  },
  optionsButton: {
    padding: 8,
    marginLeft: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    width: 280,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  deleteOption: {
    borderBottomWidth: 0,
  },
  optionText: {
    marginLeft: 16,
    fontSize: 17,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 20,
    zIndex: 999,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
