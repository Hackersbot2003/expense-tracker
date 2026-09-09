import { api } from './api';
import { Category, TransactionType } from '../types';

export const getCategories = async (type?: TransactionType): Promise<Category[]> => {
  const { data } = await api.get('/categories', { params: type ? { type } : {} });
  return data.data;
};

export const createCategory = async (payload: { name: string; icon: string; type: TransactionType }) => {
  const { data } = await api.post('/categories', payload);
  return data.data as Category;
};

export const updateCategory = async (id: string, payload: Partial<Category>) => {
  const { data } = await api.put(`/categories/${id}`, payload);
  return data.data as Category;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`);
};
