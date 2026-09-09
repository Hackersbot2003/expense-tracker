import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { EmptyState } from '../../components/EmptyState';
import { FriendCard } from '../../components/FriendCard';
import { colors, spacing, typography } from '../../constants/theme';
import * as friendService from '../../services/friendService';
import { Friend, FriendRequestItem } from '../../types';

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequestItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [f, r] = await Promise.all([friendService.getFriends(), friendService.getIncomingRequests()]);
      setFriends(f);
      setRequests(r);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchResults(await friendService.searchUsers(text.trim()));
    } catch {
      // ignore transient search errors
    }
  };

  const handleSendRequest = async (username: string) => {
    try {
      await friendService.sendFriendRequest(username);
      Alert.alert('Request sent', `Friend request sent to @${username}`);
      setSearchResults((prev) => prev.filter((u) => u.username !== username));
    } catch (err) {
      Alert.alert('Could not send request', (err as Error).message);
    }
  };

  const handleAccept = async (id: string) => {
    await friendService.acceptFriendRequest(id);
    load();
  };

  const handleReject = async (id: string) => {
    await friendService.rejectFriendRequest(id);
    load();
  };

  const handleRemove = (friend: Friend) => {
    Alert.alert('Remove friend', `Remove @${friend.username}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await friendService.removeFriend(friend._id);
          load();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Friends</Text>
      </View>

      <AppInput placeholder="Search by username" value={searchQuery} onChangeText={handleSearch} autoCapitalize="none" />

      {searchResults.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchResults.map((u) => (
            <FriendCard key={u._id} friend={u} actionLabel="Add" onAction={() => handleSendRequest(u.username)} />
          ))}
        </View>
      ) : null}

      {requests.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          {requests.map((r) => (
            <View key={r._id} style={styles.requestRow}>
              <FriendCard friend={r.senderId as unknown as Friend} />
              <View style={styles.requestActions}>
                <TouchableOpacity onPress={() => handleAccept(r._id)} style={styles.acceptButton}>
                  <Text style={styles.actionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReject(r._id)} style={styles.rejectButton}>
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Friends</Text>
        {!loading && friends.length === 0 ? (
          <EmptyState icon="👥" title="No friends yet" subtitle="Search a username above to send a request." />
        ) : (
          friends.map((f) => (
            <FriendCard
              key={f._id}
              friend={f}
              onPress={() => router.push(`/more/friend-profile?userId=${f._id}&name=${encodeURIComponent(f.name)}` as any)}
              actionLabel="Remove"
              onAction={() => handleRemove(f)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  header: { marginBottom: spacing.md },
  back: { color: colors.primary, ...typography.body, marginBottom: spacing.sm },
  title: { ...typography.h2, color: colors.textPrimary },
  section: { marginTop: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  requestRow: { marginBottom: spacing.sm },
  requestActions: { flexDirection: 'row', gap: spacing.sm, marginLeft: 56 },
  acceptButton: { backgroundColor: colors.income, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  rejectButton: { backgroundColor: colors.expense, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 14 },
  actionText: { color: colors.textPrimary, fontWeight: '600', fontSize: 12 },
});
