import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onDelete
}) => {
  const isAsset = transaction.type === 'asset';
  const color = isAsset ? styles.assetColor : styles.liabilityColor;
  const iconColor = isAsset ? '#00ff9d' : '#ff4757';
  const bgColor = isAsset ? { backgroundColor: 'rgba(0, 255, 157, 0.05)' } : { backgroundColor: 'rgba(255, 71, 87, 0.05)' };

  const swipeRight = () => (
    <TouchableOpacity
      style={[styles.deleteButton, { backgroundColor: '#ff4757' }]}
      onPress={() => onDelete(transaction.id)}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <ReanimatedSwipeable renderRightActions={swipeRight}>
      <View style={[styles.transactionItem, bgColor]}>
        <View style={[styles.iconContainer, { backgroundColor: isAsset ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 71, 87, 0.1)' }]}>
          <Text style={{ color: iconColor, fontSize: 20, fontWeight: 'bold' }}>
            {isAsset ? '↑' : '↓'}
          </Text>
        </View>
        <View style={styles.transactionTextContainer}>
          <Text style={styles.transactionName} numberOfLines={1} ellipsizeMode="tail">
            {transaction.name}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(transaction.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, color]}>
          {isAsset ? '+' : '-'}${transaction.amount.toFixed(2)}
        </Text>
      </View>
    </ReanimatedSwipeable>
  );
};

const styles = StyleSheet.create({
  transactionItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  transactionTextContainer: {
    flex: 1,
  },
  transactionName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  assetColor: {
    color: '#00ff9d',
  },
  liabilityColor: {
    color: '#ff4757',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
  },
});
