import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { formatCurrency } from '../utils/format';

interface BudgetProgressProps {
  label: string;
  spent: number;
  amount: number;
  percentUsed: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ label, spent, amount, percentUsed }) => {
  const barColor = percentUsed >= 100 ? colors.expense : percentUsed >= 80 ? '#F59E0B' : colors.primary;
  const clampedWidth = Math.min(percentUsed, 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {formatCurrency(spent)} / {formatCurrency(amount)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clampedWidth}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.percent, { color: barColor }]}>{percentUsed}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  label: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  values: { ...typography.caption, color: colors.textSecondary },
  track: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.full },
  percent: { ...typography.caption, marginTop: spacing.xs, fontWeight: '600' },
});
