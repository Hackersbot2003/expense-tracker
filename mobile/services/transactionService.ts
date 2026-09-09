import { api } from './api';
import { Paginated, Transaction, TransactionType } from '../types';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  quickFilter?: 'today' | 'this_week' | 'this_month' | 'last_month' | 'last_3_months' | 'this_year';
  sortBy?: 'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'category_asc' | 'category_desc';
  search?: string;
}

export const getTransactions = async (filters: TransactionFilters = {}): Promise<Paginated<Transaction>> => {
  const { data } = await api.get('/transactions', { params: filters });
  return data;
};

export const createTransaction = async (payload: {
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  date?: string;
  note?: string;
}): Promise<Transaction> => {
  const { data } = await api.post('/transactions', payload);
  return data.data;
};

export const updateTransaction = async (id: string, payload: Partial<Transaction>): Promise<Transaction> => {
  const { data } = await api.put(`/transactions/${id}`, payload);
  return data.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};
