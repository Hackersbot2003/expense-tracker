import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import { Friend } from '../types';

interface FriendCardProps {
  friend: Friend;
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onPress, actionLabel, onAction }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.middle}>
      <Text style={styles.name}>{friend.name}</Text>
      <Text style={styles.username}>@{friend.username}</Text>
    </View>
    {actionLabel && onAction ? (
      <TouchableOpacity onPress={onAction} style={styles.actionButton}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: colors.textPrimary, ...typography.h3 },
  middle: { flex: 1 },
  name: { ...typography.body, color: colors.textPrimary, fontWeight: '600' },
  username: { ...typography.caption, color: colors.textSecondary },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  actionText: { color: colors.textPrimary, ...typography.caption, fontWeight: '600' },
});
