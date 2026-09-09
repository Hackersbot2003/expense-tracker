import { api } from './api';
import { Friend, FriendRequestItem } from '../types';

export const searchUsers = async (username: string) => {
  const { data } = await api.get('/users/search', { params: { username } });
  return data.data as Friend[];
};

export const sendFriendRequest = async (receiverUsername: string) => {
  const { data } = await api.post('/friends/request', { receiverUsername });
  return data.data;
};

export const getIncomingRequests = async (): Promise<FriendRequestItem[]> => {
  const { data } = await api.get('/friends/requests');
  return data.data;
};

export const acceptFriendRequest = async (requestId: string) => {
  const { data } = await api.put(`/friends/request/${requestId}/accept`);
  return data.data;
};

export const rejectFriendRequest = async (requestId: string) => {
  const { data } = await api.put(`/friends/request/${requestId}/reject`);
  return data.data;
};

export const getFriends = async (): Promise<Friend[]> => {
  const { data } = await api.get('/friends');
  return data.data;
};

export const removeFriend = async (friendUserId: string) => {
  await api.delete(`/friends/${friendUserId}`);
};

export const getFriendProfile = async (userId: string, month?: number, year?: number) => {
  const { data } = await api.get(`/friends/${userId}/profile`, { params: { month, year } });
  return data.data;
};

export const compareWithFriend = async (userId: string, month?: number, year?: number) => {
  const { data } = await api.get(`/friends/${userId}/compare`, { params: { month, year } });
  return data.data;
};
