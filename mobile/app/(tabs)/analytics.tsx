import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { ChartCard } from '../../components/ChartCard';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { SummaryCard } from '../../components/SummaryCard';
import { colors, radius, spacing, typography } from '../../constants/theme';
import {
  getCategoryExpenses,
  getDailySpending,
  getDashboardAnalytics,
  getInsights,
  getMonthlyTrend,
} from '../../services/analyticsService';
import { CategoryExpense, DashboardData, Insights, MonthlyTrendPoint } from '../../types';
import { formatCurrency, monthName } from '../../utils/format';

const screenWidth = Dimensions.get('window').width - spacing.lg * 2;

const chartConfig = {
  backgroundGradientFrom: colors.surface,
  backgroundGradientTo: colors.surface,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
  decimalPlaces: 0,
  propsForDots: { r: '3' },
};

const PIE_COLORS = ['#6366F1', '#22C55E', '#F59E0B', '#F87171', '#38BDF8', '#A78BFA', '#FB923C'];

export default function AnalyticsScreen() {
  const now = new Date();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpense[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendPoint[]>([]);
  const [dailySpending, setDailySpending] = useState<{ day: number; total: number }[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);

  const load = async () => {
    setError('');
    try {
      const [dash, cats, trend, daily, ins] = await Promise.all([
        getDashboardAnalytics({ month: now.getMonth() + 1, year: now.getFullYear() }),
        getCategoryExpenses({ month: now.getMonth() + 1, year: now.getFullYear() }),
        getMonthlyTrend(6),
        getDailySpending(now.getMonth() + 1, now.getFullYear()),
        getInsights({ month: now.getMonth() + 1, year: now.getFullYear() }),
      ]);
      setDashboard(dash);
      setCategoryExpenses(cats);
      setMonthlyTrend(trend);
      setDailySpending(daily);
      setInsights(ins);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const pieData = categoryExpenses.map((c, i) => ({
    name: `${c.name} (${c.percentage}%)`,
    population: c.total,
    color: PIE_COLORS[i % PIE_COLORS.length],
    legendFontColor: colors.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.subtitle}>{monthName(now.getMonth() + 1)} {now.getFullYear()}</Text>

      <View style={styles.grid}>
        <SummaryCard label="Income" amount={dashboard?.totalIncome ?? 0} tone="income" />
        <View style={{ width: spacing.sm }} />
        <SummaryCard label="Expense" amount={dashboard?.totalExpense ?? 0} tone="expense" />
      </View>
      <View style={styles.grid}>
        <SummaryCard label="Savings" amount={dashboard?.savings ?? 0} />
        <View style={{ width: spacing.sm }} />
        <SummaryCard label="Avg Daily Expense" amount={dashboard?.averageDailyExpense ?? 0} />
      </View>

      {pieData.length > 0 ? (
        <ChartCard title="Expense by Category">
          <PieChart
            data={pieData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="8"
          />
        </ChartCard>
      ) : null}

      <ChartCard title="Income vs Expense">
        <BarChart
          data={{
            labels: monthlyTrend.map((m) => monthName(m.month).slice(0, 3)),
            datasets: [{ data: monthlyTrend.map((m) => m.expense) }],
          }}
          width={screenWidth}
          height={180}
          chartConfig={chartConfig}
          fromZero
          yAxisLabel="₹"
          yAxisSuffix=""
          style={styles.chartStyle}
        />
      </ChartCard>

      <ChartCard title="Monthly Spending Trend">
        <LineChart
          data={{
            labels: monthlyTrend.map((m) => monthName(m.month).slice(0, 3)),
            datasets: [
              { data: monthlyTrend.map((m) => m.income), color: () => colors.income },
              { data: monthlyTrend.map((m) => m.expense), color: () => colors.expense },
            ],
            legend: ['Income', 'Expense'],
          }}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
      </ChartCard>

      {dailySpending.length > 0 ? (
        <ChartCard title="Daily Spending">
          <LineChart
            data={{
              labels: dailySpending.filter((_, i) => i % 5 === 0).map((d) => String(d.day)),
              datasets: [{ data: dailySpending.map((d) => d.total) }],
            }}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chartStyle}
          />
        </ChartCard>
      ) : null}

      {insights ? (
        <ChartCard title="Insights">
          {insights.topSpendingCategory ? (
            <Text style={styles.insightLine}>
              🏆 Highest spending category: {insights.topSpendingCategory.icon} {insights.topSpendingCategory.name} (
              {formatCurrency(insights.topSpendingCategory.total)})
            </Text>
          ) : null}
          {insights.highestExpense ? (
            <Text style={styles.insightLine}>
              💸 Highest expense: {formatCurrency(insights.highestExpense.amount)} on {insights.highestExpense.category}
            </Text>
          ) : null}
          <Text style={styles.insightLine}>
            📅 Average daily spending: {formatCurrency(insights.averageDailySpending)}
          </Text>
          <Text style={styles.insightLine}>
            {insights.expenseChangeFromLastMonth.amount >= 0 ? '📈' : '📉'} You spent{' '}
            {formatCurrency(Math.abs(insights.expenseChangeFromLastMonth.amount))}{' '}
            {insights.expenseChangeFromLastMonth.amount >= 0 ? 'more' : 'less'} than last month.
          </Text>
        </ChartCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  grid: { flexDirection: 'row', marginBottom: spacing.sm },
  chartStyle: { borderRadius: radius.md },
  insightLine: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
});
