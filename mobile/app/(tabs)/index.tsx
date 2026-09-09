import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BudgetProgress } from '../../components/BudgetProgress';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { SummaryCard } from '../../components/SummaryCard';
import { TransactionCard } from '../../components/TransactionCard';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { getBudgets } from '../../services/budgetService';
import { getDashboardAnalytics } from '../../services/analyticsService';
import { getTransactions } from '../../services/transactionService';
import { Budget, DashboardData, Transaction } from '../../types';
import { formatCurrency } from '../../utils/format';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [overallBudget, setOverallBudget] = useState<Budget | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const now = new Date();

  const load = async () => {
    setError('');
    try {
      const [dashboardData, budgets, txPage] = await Promise.all([
        getDashboardAnalytics({ month: now.getMonth() + 1, year: now.getFullYear() }),
        getBudgets(now.getMonth() + 1, now.getFullYear()),
        getTransactions({ sortBy: 'newest', limit: 5 }),
      ]);
      setDashboard(dashboardData);
      setOverallBudget(budgets.find((b) => b.type === 'overall') || null);
      setRecent(txPage.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const totalBalance = (dashboard?.totalIncome ?? 0) - (dashboard?.totalExpense ?? 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.greeting}>Hi {user?.name?.split(' ')[0] || ''} 👋</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
      </View>

      <View style={styles.row}>
        <SummaryCard label="Income" amount={dashboard?.totalIncome ?? 0} tone="income" icon="⬆️" />
        <View style={{ width: spacing.md }} />
        <SummaryCard label="Expense" amount={dashboard?.totalExpense ?? 0} tone="expense" icon="⬇️" />
      </View>

      {overallBudget ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <BudgetProgress
            label="Overall"
            spent={overallBudget.spent}
            amount={overallBudget.amount}
            percentUsed={overallBudget.percentUsed}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
        {recent.length === 0 ? (
          <EmptyState icon="🧾" title="No transactions yet" subtitle="Tap the + button to add your first one." />
        ) : (
          recent.map((t) => (
            <TransactionCard key={t._id} transaction={t} onPress={() => router.push('/(tabs)/transactions')} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  greeting: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  balanceLabel: { ...typography.body, color: '#E0E7FF' },
  balanceAmount: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.xs },
  row: { flexDirection: 'row', marginBottom: spacing.md },
  section: { marginTop: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
});
