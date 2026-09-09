import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { colors, radius, spacing, typography } from '../constants/theme';
import { getAccounts } from '../services/accountService';
import { getCategories } from '../services/categoryService';
import { createTransaction } from '../services/transactionService';
import { Account, Category, TransactionType } from '../types';

export default function AddTransactionScreen() {
  const router = useRouter();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cats, accs] = await Promise.all([getCategories(type), getAccounts()]);
        setCategories(cats);
        setAccounts(accs);
        setCategoryId(cats[0]?._id ?? null);
        setAccountId(accs[0]?._id ?? null);
      } catch (err) {
        setError((err as Error).message);
      }
    })();
  }, [type]);

  const handleSave = async () => {
    setError('');
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!categoryId || !accountId) {
      setError('Choose a category and an account');
      return;
    }

    setSaving(true);
    try {
      await createTransaction({ type, amount: numericAmount, categoryId, accountId, note: note.trim() || undefined });
      router.back();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add Transaction</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, type === 'expense' && styles.toggleActiveExpense]}
          onPress={() => setType('expense')}
        >
          <Text style={styles.toggleText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, type === 'income' && styles.toggleActiveIncome]}
          onPress={() => setType('income')}
        >
          <Text style={styles.toggleText}>Income</Text>
        </TouchableOpacity>
      </View>

      <AppInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0" />

      <Text style={styles.label}>Category</Text>
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

      <Text style={styles.label}>Account</Text>
      <View style={styles.chipRow}>
        {accounts.map((a) => (
          <TouchableOpacity
            key={a._id}
            style={[styles.chip, accountId === a._id && styles.chipActive]}
            onPress={() => setAccountId(a._id)}
          >
            <Text style={styles.chipText}>
              {a.icon} {a.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppInput label="Note (optional)" value={note} onChangeText={setNote} placeholder="What was this for?" />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AppButton title="Save Transaction" onPress={handleSave} loading={saving} style={styles.saveButton} />
      <AppButton title="Cancel" onPress={() => router.back()} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing.md },
  toggleButton: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  toggleActiveExpense: { backgroundColor: colors.expense },
  toggleActiveIncome: { backgroundColor: colors.income },
  toggleText: { color: colors.textPrimary, fontWeight: '600' },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
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
  error: { color: colors.expense, marginBottom: spacing.sm, textAlign: 'center' },
  saveButton: { marginTop: spacing.sm, marginBottom: spacing.sm },
});
