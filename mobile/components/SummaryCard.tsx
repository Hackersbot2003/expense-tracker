import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatCurrency } from '../utils/format';

interface SummaryCardProps {
  label: string;
  amount: number;
  tone?: 'default' | 'income' | 'expense';
  icon?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ label, amount, tone = 'default', icon }) => {
  const color = tone === 'income' ? colors.income : tone === 'expense' ? colors.expense : colors.textPrimary;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>
        {icon ? `${icon} ` : ''}
        {label}
      </Text>
      <Text style={[styles.amount, { color }]}>{formatCurrency(amount)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flex: 1,
  },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  amount: { ...typography.h2 },
});
