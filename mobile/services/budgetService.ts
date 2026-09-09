import { api } from './api';
import { Budget } from '../types';

export const getBudgets = async (month: number, year: number): Promise<Budget[]> => {
  const { data } = await api.get('/budgets', { params: { month, year } });
  return data.data;
};

export const createBudget = async (payload: {
  type: 'overall' | 'category';
  categoryId?: string;
  amount: number;
  month: number;
  year: number;
}) => {
  const { data } = await api.post('/budgets', payload);
  return data.data as Budget;
};

export const updateBudget = async (id: string, amount: number) => {
  const { data } = await api.put(`/budgets/${id}`, { amount });
  return data.data as Budget;
};

export const deleteBudget = async (id: string) => {
  await api.delete(`/budgets/${id}`);
};
