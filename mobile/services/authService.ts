import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, TOKEN_KEY } from './api';
import { User } from '../types';

interface AuthResponse {
  success: boolean;
  data: { user: User; token: string };
}

export const register = async (payload: {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
  return data.data.user;
};

export const login = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  await AsyncStorage.setItem(TOKEN_KEY, data.data.token);
  return data.data.user;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<{ success: boolean; data: { user: User } }>('/auth/me');
  return data.data.user;
};

export const logout = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const updatePrivacySettings = async (settings: Partial<User['privacySettings']>) => {
  const { data } = await api.put('/auth/privacy-settings', settings);
  return data.data.privacySettings;
};
