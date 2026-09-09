import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { TransactionCard } from '../../components/TransactionCard';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { getTransactions, TransactionFilters } from '../../services/transactionService';
import { Transaction } from '../../types';

const QUICK_FILTERS: { key: TransactionFilters['quickFilter']; label: string }[] = [
  { key: undefined, label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'this_year', label: 'This Year' },
];

const SORT_OPTIONS: { key: NonNullable<TransactionFilters['sortBy']>; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'amount_high', label: 'Highest Amount' },
  { key: 'amount_low', label: 'Lowest Amount' },
  { key: 'category_asc', label: 'Category A-Z' },
  { key: 'category_desc', label: 'Category Z-A' },
];

export default function TransactionsScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [quickFilter, setQuickFilter] = useState<TransactionFilters['quickFilter']>(undefined);
  const [sortBy, setSortBy] = useState<NonNullable<TransactionFilters['sortBy']>>('newest');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const filters: TransactionFilters = {
        search: search.trim() || undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        quickFilter,
        sortBy,
        limit: 50,
      };
      const page = await getTransactions(filters);
      setItems(page.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [search, typeFilter, quickFilter, sortBy])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <AppInput
          placeholder="Search note, category, account..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'income', 'expense'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filterChip, typeFilter === t && styles.filterChipActive]}
              onPress={() => setTypeFilter(t)}
            >
              <Text style={styles.filterChipText}>{t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expense'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {QUICK_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={[styles.filterChip, quickFilter === f.key && styles.filterChipActive]}
              onPress={() => setQuickFilter(f.key)}
            >
              <Text style={styles.filterChipText}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.sortButton} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.sortButtonText}>Sort: {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <TransactionCard transaction={item} />}
          ListEmptyComponent={<EmptyState icon="🔍" title="No transactions match your filters" />}
        />
      )}

      <Modal visible={sortModalVisible} transparent animationType="slide" onRequestClose={() => setSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalSheet}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.modalOption}
                onPress={() => {
                  setSortBy(opt.key);
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, sortBy === opt.key && { color: colors.primary }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  searchInput: { marginBottom: spacing.sm },
  filterRow: { gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
  filterChipText: { color: colors.textPrimary, fontSize: 13 },
  sortButton: { alignSelf: 'flex-start', marginTop: spacing.xs },
  sortButtonText: { color: colors.primary, ...typography.caption, fontWeight: '600' },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  modalOption: { paddingVertical: spacing.md },
  modalOptionText: { color: colors.textPrimary, ...typography.body },
});
