import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS: { label: string; icon: string; href: string }[] = [
  { label: 'Friends', icon: '👥', href: '/more/friends' },
  { label: 'Budgets', icon: '🎯', href: '/more/budgets' },
  { label: 'Categories', icon: '🏷️', href: '/more/categories' },
  { label: 'Accounts', icon: '💳', href: '/more/accounts' },
  { label: 'Profile & Privacy', icon: '👤', href: '/more/profile' },
];

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>More</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.href} style={styles.menuItem} onPress={() => router.push(item.href as any)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.textPrimary, ...typography.h2 },
  name: { ...typography.h3, color: colors.textPrimary },
  username: { ...typography.caption, color: colors.textSecondary },
  menu: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: { fontSize: 18, marginRight: spacing.md },
  menuLabel: { flex: 1, color: colors.textPrimary, ...typography.body },
  chevron: { color: colors.textMuted, fontSize: 20 },
  logoutButton: { marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.md },
  logoutText: { color: colors.expense, ...typography.body, fontWeight: '600' },
});
