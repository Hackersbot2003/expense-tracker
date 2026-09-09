import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { SummaryCard } from '../../components/SummaryCard';
import { TransactionCard } from '../../components/TransactionCard';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { getFriendProfile } from '../../services/friendService';
import { formatCurrency } from '../../utils/format';

/**
 * READ ONLY. Everything shown here is already filtered server-side by the
 * friend's own privacy settings — this screen never shows edit/delete
 * controls and never assumes a field is present.
 */
export default function FriendProfileScreen() {
  const { userId, name } = useLocalSearchParams<{ userId: string; name: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      setData(await getFriendProfile(userId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{name || data?.user?.name}'s Profile</Text>
      <View style={styles.readOnlyBadge}>
        <Text style={styles.readOnlyText}>READ ONLY</Text>
      </View>

      <View style={styles.row}>
        {typeof data.totalExpense === 'number' ? (
          <SummaryCard label="Total Expense" amount={data.totalExpense} tone="expense" />
        ) : null}
        {typeof data.totalIncome === 'number' ? (
          <>
            <View style={{ width: spacing.sm }} />
            <SummaryCard label="Total Income" amount={data.totalIncome} tone="income" />
          </>
        ) : null}
      </View>

      {data.categoryExpenses?.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expense Categories</Text>
          {data.categoryExpenses.map((c: any) => (
            <View key={c.categoryId} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>
                {c.icon} {c.name}
              </Text>
              <Text style={styles.categoryAmount}>{formatCurrency(c.total)}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {data.recentTransactions?.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {data.recentTransactions.map((t: any) => (
            <TransactionCard key={t._id} transaction={t} />
          ))}
        </View>
      ) : null}

      {!data.categoryExpenses && !data.recentTransactions && typeof data.totalExpense !== 'number' ? (
        <Text style={styles.noneText}>This user hasn't enabled sharing for any data yet.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  back: { color: colors.primary, ...typography.body, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
  readOnlyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  readOnlyText: { color: colors.textMuted, ...typography.caption, letterSpacing: 1 },
  row: { flexDirection: 'row', marginBottom: spacing.md },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  categoryLabel: { color: colors.textPrimary, ...typography.body },
  categoryAmount: { color: colors.textSecondary, ...typography.body },
  noneText: { color: colors.textSecondary, ...typography.body, marginTop: spacing.lg, textAlign: 'center' },
});
