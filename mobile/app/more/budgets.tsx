import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { BudgetProgress } from '../../components/BudgetProgress';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { createBudget, deleteBudget, getBudgets } from '../../services/budgetService';
import { getCategories } from '../../services/categoryService';
import { Budget, Category } from '../../types';

export default function BudgetsScreen() {
  const router = useRouter();
  const now = new Date();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [scope, setScope] = useState<'overall' | 'category'>('overall');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [b, c] = await Promise.all([
        getBudgets(now.getMonth() + 1, now.getFullYear()),
        getCategories('expense'),
      ]);
      setBudgets(b);
      setCategories(c);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Enter a valid amount');
      return;
    }
    if (scope === 'category' && !categoryId) {
      Alert.alert('Choose a category');
      return;
    }
    setSaving(true);
    try {
      await createBudget({
        type: scope,
        categoryId: scope === 'category' ? categoryId! : undefined,
        amount: numericAmount,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setAmount('');
      load();
    } catch (err) {
      Alert.alert('Could not create budget', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (budget: Budget) => {
    Alert.alert('Delete budget', 'Remove this budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBudget(budget._id);
            setBudgets((prev) => prev.filter((b) => b._id !== budget._id));
          } catch (err) {
            Alert.alert('Could not delete', (err as Error).message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Budgets</Text>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={budgets}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon="🎯" title="No budgets set for this month" />}
          renderItem={({ item }) => {
            const category = typeof item.categoryId === 'object' ? item.categoryId : null;
            return (
              <View style={styles.budgetRow}>
                <BudgetProgress
                  label={item.type === 'overall' ? 'Overall Budget' : `${category?.icon || ''} ${category?.name || 'Category'}`}
                  spent={item.spent}
                  amount={item.amount}
                  percentUsed={item.percentUsed}
                />
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleButton, scope === 'overall' && styles.toggleActive]} onPress={() => setScope('overall')}>
          <Text style={styles.toggleText}>Overall</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleButton, scope === 'category' && styles.toggleActive]} onPress={() => setScope('category')}>
          <Text style={styles.toggleText}>Category</Text>
        </TouchableOpacity>
      </View>

      {scope === 'category' ? (
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c._id}
              style={[styles.chip, categoryId === c._id && styles.chipActive]}
              onPress={() => setCategoryId(c._id)}
            >
              <Text style={styles.chipText}>
                {c.icon} {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <AppInput placeholder="Budget amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <AppButton title="Create Budget" onPress={handleCreate} loading={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { marginBottom: spacing.md },
  back: { color: colors.primary, ...typography.body, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
  listContent: { paddingBottom: spacing.md },
  budgetRow: { marginBottom: spacing.sm },
  deleteText: { color: colors.expense, ...typography.caption, textAlign: 'right' },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing.sm },
  toggleButton: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.textPrimary, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  chipText: { color: colors.textPrimary, fontSize: 13 },
});
