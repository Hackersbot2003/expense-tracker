import { api } from './api';
import { Account } from '../types';

export const getAccounts = async (): Promise<Account[]> => {
  const { data } = await api.get('/accounts');
  return data.data;
};

export const createAccount = async (payload: { name: string; icon: string; openingBalance?: number }) => {
  const { data } = await api.post('/accounts', payload);
  return data.data as Account;
};

export const updateAccount = async (id: string, payload: Partial<Account>) => {
  const { data } = await api.put(`/accounts/${id}`, payload);
  return data.data as Account;
};

export const deleteAccount = async (id: string) => {
  await api.delete(`/accounts/${id}`);
};
