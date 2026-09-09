import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { createCategory, deleteCategory, getCategories } from '../../services/categoryService';
import { Category, TransactionType } from '../../types';

export default function CategoriesScreen() {
  const router = useRouter();
  const [type, setType] = useState<TransactionType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📁');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      setCategories(await getCategories(type));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const created = await createCategory({ name: newName.trim(), icon: newIcon.trim() || '📁', type });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
      setNewIcon('📁');
    } catch (err) {
      Alert.alert('Could not add category', (err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert('Delete category', `Delete "${category.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(category._id);
            setCategories((prev) => prev.filter((c) => c._id !== category._id));
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
        <Text style={styles.title}>Categories</Text>
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, type === 'expense' && styles.toggleActive]}
          onPress={() => setType('expense')}
        >
          <Text style={styles.toggleText}>Expense</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, type === 'income' && styles.toggleActive]}
          onPress={() => setType('income')}
        >
          <Text style={styles.toggleText}>Income</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon="🏷️" title="No categories yet" />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowText}>
                {item.icon} {item.name}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.addRow}>
        <AppInput
          placeholder="Icon"
          value={newIcon}
          onChangeText={setNewIcon}
          style={styles.iconInput}
          maxLength={4}
        />
        <View style={styles.nameInputWrap}>
          <AppInput placeholder="New category name" value={newName} onChangeText={setNewName} />
        </View>
      </View>
      <AppButton title="Add Category" onPress={handleAdd} loading={adding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { marginBottom: spacing.md },
  back: { color: colors.primary, ...typography.body, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
  toggleRow: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: spacing.md },
  toggleButton: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.textPrimary, fontWeight: '600' },
  listContent: { paddingBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { color: colors.textPrimary, ...typography.body },
  deleteText: { color: colors.expense, ...typography.caption },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  iconInput: { width: 70 },
  nameInputWrap: { flex: 1 },
});
