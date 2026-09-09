import { api } from './api';
import { CategoryExpense, DashboardData, Insights, MonthlyTrendPoint } from '../types';

interface MonthYearParams {
  month?: number;
  year?: number;
  accountId?: string;
  categoryId?: string;
}

export const getDashboardAnalytics = async (params: MonthYearParams = {}): Promise<DashboardData> => {
  const { data } = await api.get('/analytics/dashboard', { params });
  return data.data;
};

export const getCategoryExpenses = async (params: MonthYearParams = {}): Promise<CategoryExpense[]> => {
  const { data } = await api.get('/analytics/category-expenses', { params });
  return data.data;
};

export const getMonthlyTrend = async (months = 6): Promise<MonthlyTrendPoint[]> => {
  const { data } = await api.get('/analytics/monthly-trend', { params: { months } });
  return data.data;
};

export const getDailySpending = async (month?: number, year?: number): Promise<{ day: number; total: number }[]> => {
  const { data } = await api.get('/analytics/daily-spending', { params: { month, year } });
  return data.data;
};

export const getInsights = async (params: MonthYearParams = {}): Promise<Insights> => {
  const { data } = await api.get('/analytics/insights', { params });
  return data.data;
};
