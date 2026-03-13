import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Transaction } from '../../types';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete
}) => {
  const sortedTransactions = transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedTransactions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No transactions yet</Text>
      </View>
    );
  }

  return (
    <FlashList<Transaction>
      data={sortedTransactions}
      renderItem={({ item }: { item: Transaction }) => <TransactionItem transaction={item} onDelete={onDelete} />}
      keyExtractor={(item: Transaction) => item.id}
      estimatedItemSize={80}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Disable internal scrolling since it's in a parent scroll view
    />
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
});