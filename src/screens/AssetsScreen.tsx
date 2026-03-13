import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MoreVertical, Edit, Trash2, TrendingUp, Wallet, Plus } from 'lucide-react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { gradients } from '../theme/colors';
import { AddAssetModal } from '../components/Modals/AddAssetModal';
import { EditAssetModal } from '../components/Modals/EditAssetModal';
import { Asset } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useCustomAlert } from '../hooks/useCustomAlert';

export const AssetsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { currencySymbol } = useCurrency(); // Get currency symbol from context
  const insets = useSafeAreaInsets();
  const { assets, getTotalAssets, addAsset, updateAsset, removeAsset } = useFinanceStore();
  const totalAssets = getTotalAssets();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { showAlert, AlertComponent } = useCustomAlert();

  const assetTypeLabels = {
    liquid: t('finance.assets.types.liquid'),
    term: t('finance.assets.types.term'),
    gold_currency: t('finance.assets.types.gold_currency'),
    funds: t('finance.assets.types.funds'),
  };

  const handleEditAsset = (asset: any) => {
    setSelectedAsset(asset);
    setEditModalVisible(true);
    setOptionsModalVisible(false);
  };

  const handleDeleteAsset = (id: string) => {
    setOptionsModalVisible(false);
    showAlert(
      t('common.deleteConfirmTitle'),
      t('common.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
          style: 'destructive',
          onPress: () => removeAsset(id)
        }
      ],
      'warning'
    );
  };

  const handleAssetPress = (asset: any) => {
    setSelectedItem(asset);
    setOptionsModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
              {t('finance.assets.subtitle')}
            </Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t('finance.assets.title')}
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
            <Wallet size={28} color={colors.success} strokeWidth={2} />
          </View>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={['#22c55e', '#10b981', '#059669']}
            style={styles.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Light Beams */}
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
                <Text style={styles.heroLabel}>{t('finance.assets.totalValue')}</Text>
                <Text style={styles.heroValue}>
                  {formatCurrency(totalAssets, currencySymbol)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      <FlashList<Asset>
        data={assets}
        keyExtractor={(item: Asset) => item.id}
        contentContainerStyle={styles.list}
        estimatedItemSize={160}
        renderItem={({ item }: { item: Asset }) => (
          <View
            style={[styles.card, { backgroundColor: colors.cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Wallet size={20} color={colors.success} strokeWidth={2.5} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
                    {item.name}
                  </Text>
                  <View style={styles.typeTag}>
                    <Text style={[styles.typeText, { color: colors.success }]}>
                      {assetTypeLabels[item.type as keyof typeof assetTypeLabels]}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => handleAssetPress(item)}
              >
                <MoreVertical size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardBottom}>
              <Text style={[styles.cardValue, { color: colors.success }]}>
                {formatCurrency(item.value, currencySymbol)}
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
            <View style={[styles.emptyIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Wallet size={48} color={colors.success} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyText, { color: colors.text.primary }]}>
              {t('finance.assets.noData')}
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.text.tertiary }]}>
              {t('finance.assets.noDataSub')}
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
              onPress={() => selectedItem && handleEditAsset(selectedItem)}
            >
              <Edit size={22} color={colors.text.primary} strokeWidth={2} />
              <Text style={[styles.optionText, { color: colors.text.primary }]}>{t('common.edit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, styles.deleteOption]}
              onPress={() => selectedItem && handleDeleteAsset(selectedItem.id)}
            >
              <Trash2 size={22} color={colors.error} strokeWidth={2} />
              <Text style={[styles.optionText, { color: colors.error }]}>{t('common.delete')}</Text>
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
          colors={['#22c55e', '#10b981']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Plus size={28} color="#FFFFFF" strokeWidth={3} />
        </LinearGradient>
      </TouchableOpacity>

      <AddAssetModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={(asset) => addAsset(asset)}
      />

      <EditAssetModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        asset={selectedAsset}
        onUpdate={(id, updatedAsset) => {
          updateAsset(id, updatedAsset);
          setSelectedAsset(null);
        }}
      />
      {AlertComponent}
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
    shadowColor: '#22c55e',
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
  // Light Rays
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
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    top: -40,
    right: -30,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  glowCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    bottom: -20,
    left: 20,
    shadowColor: '#10b981',
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
    elevation: 10,
    zIndex: 100,
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
  typeTag: {
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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
    elevation: 15,
    zIndex: 999,
    shadowColor: '#22c55e',
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
