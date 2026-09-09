import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { createAccount, deleteAccount, getAccounts } from '../../services/accountService';
import { Account } from '../../types';
import { formatCurrency } from '../../utils/format';

export default function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      setAccounts(await getAccounts());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createAccount({ name: name.trim(), icon: icon.trim() || '💰', openingBalance: parseFloat(openingBalance) || 0 });
      setName('');
      setIcon('💰');
      setOpeningBalance('0');
      load();
    } catch (err) {
      Alert.alert('Could not add account', (err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (account: Account) => {
    Alert.alert('Delete account', `Delete "${account.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount(account._id);
            setAccounts((prev) => prev.filter((a) => a._id !== account._id));
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
        <Text style={styles.title}>Accounts</Text>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon="💳" title="No accounts yet" />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.rowText}>
                  {item.icon} {item.name}
                </Text>
                <Text style={styles.balanceText}>{formatCurrency(item.currentBalance)}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.addRow}>
        <AppInput placeholder="Icon" value={icon} onChangeText={setIcon} style={styles.iconInput} maxLength={4} />
        <View style={styles.nameInputWrap}>
          <AppInput placeholder="Account name" value={name} onChangeText={setName} />
        </View>
      </View>
      <AppInput placeholder="Opening balance" value={openingBalance} onChangeText={setOpeningBalance} keyboardType="numeric" />
      <AppButton title="Add Account" onPress={handleAdd} loading={adding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  header: { marginBottom: spacing.md },
  back: { color: colors.primary, ...typography.body, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
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
  balanceText: { color: colors.textSecondary, ...typography.caption, marginTop: 2 },
  deleteText: { color: colors.expense, ...typography.caption },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  iconInput: { width: 70 },
  nameInputWrap: { flex: 1 },
});
