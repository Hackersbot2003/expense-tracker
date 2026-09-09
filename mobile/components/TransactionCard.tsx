import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { Transaction, Category, Account } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onPress }) => {
  const category = transaction.categoryId as Category;
  const account = transaction.accountId as Account;
  const isExpense = transaction.type === 'expense';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{category?.icon || '💸'}</Text>
      </View>

      <View style={styles.middle}>
        <Text style={styles.note} numberOfLines={1}>
          {transaction.note || category?.name || 'Transaction'}
        </Text>
        <Text style={styles.meta}>
          {category?.name || '—'} • {formatDate(transaction.date)}
          {account?.name ? ` • ${account.name}` : ''}
        </Text>
      </View>

      <Text style={[styles.amount, { color: isExpense ? colors.expense : colors.income }]}>
        {isExpense ? '-' : '+'}
        {formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: { fontSize: 20 },
  middle: { flex: 1 },
  note: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  amount: { ...typography.h3 },
});
