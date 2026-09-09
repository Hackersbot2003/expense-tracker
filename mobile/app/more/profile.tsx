import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { updatePrivacySettings } from '../../services/authService';
import { PrivacySettings } from '../../types';

const PRIVACY_LABELS: { key: keyof PrivacySettings; label: string }[] = [
  { key: 'showTotalExpenses', label: 'Total Expenses' },
  { key: 'showIncome', label: 'Income' },
  { key: 'showCategorySpending', label: 'Category Spending' },
  { key: 'showCharts', label: 'Charts' },
  { key: 'showMonthlyTrends', label: 'Monthly Trends' },
  { key: 'showIndividualTransactions', label: 'Individual Transactions' },
  { key: 'showAccountBalances', label: 'Account Balances' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings | undefined>(user?.privacySettings);
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = async (key: keyof PrivacySettings, value: boolean) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
    setSaving(key);
    try {
      await updatePrivacySettings({ [key]: value });
      await refreshUser();
    } finally {
      setSaving(null);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>‹ Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Profile & Privacy</Text>

      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Friends can view</Text>
      <Text style={styles.sectionSubtitle}>
        Control what your accepted friends can see on your read-only profile. Everything is off by default except
        expense totals, category spending, charts, and monthly trends.
      </Text>

      <View style={styles.settingsCard}>
        {PRIVACY_LABELS.map(({ key, label }) => (
          <View key={key} style={styles.settingRow}>
            <Text style={styles.settingLabel}>{label}</Text>
            <Switch
              value={settings?.[key] ?? false}
              onValueChange={(value) => toggle(key, value)}
              disabled={saving === key}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  back: { color: colors.primary, ...typography.body, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  profileCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg },
  name: { ...typography.h3, color: colors.textPrimary },
  username: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  email: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  sectionSubtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  settingsCard: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: { color: colors.textPrimary, ...typography.body },
});
