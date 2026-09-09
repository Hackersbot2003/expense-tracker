export type TransactionType = 'income' | 'expense';

export interface PrivacySettings {
  showTotalExpenses: boolean;
  showIncome: boolean;
  showCategorySpending: boolean;
  showCharts: boolean;
  showMonthlyTrends: boolean;
  showIndividualTransactions: boolean;
  showAccountBalances: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string | null;
  privacySettings: PrivacySettings;
  createdAt: string;
}

export interface Category {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  type: TransactionType;
}

export interface Account {
  _id: string;
  userId: string;
  name: string;
  icon: string;
  openingBalance: number;
  currentBalance: number;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: Category | string;
  accountId: Account | string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Budget {
  _id: string;
  userId: string;
  type: 'overall' | 'category';
  categoryId?: Category | string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface FriendRequestItem {
  _id: string;
  senderId: { _id: string; name: string; username: string; profileImage?: string };
  receiverId: { _id: string; name: string; username: string; profileImage?: string };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friend {
  _id: string;
  name: string;
  username: string;
  profileImage?: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  savingsRate: number;
  averageDailyExpense: number;
}

export interface CategoryExpense {
  categoryId: string;
  name: string;
  icon: string;
  total: number;
  percentage: number;
}

export interface MonthlyTrendPoint {
  year: number;
  month: number;
  income: number;
  expense: number;
}

export interface Insights {
  topSpendingCategory: CategoryExpense | null;
  highestExpense: { amount: number; date: string; note?: string; category: string } | null;
  averageDailySpending: number;
  expenseChangeFromLastMonth: { amount: number; percent: number | null };
  incomeChangeFromLastMonth: { amount: number; percent: number | null };
  savingsChangeFromLastMonth: { amount: number; percent: number | null };
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
