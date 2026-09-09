import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getDailySpending,
  getExpenseByCategory,
  getHighestExpense,
  getIncomeExpenseTotals,
  getMonthlyTrend,
} from '../services/analyticsService';

const monthRange = (req: Request) => {
  const now = new Date();
  const month = parseInt((req.query.month as string) || String(now.getMonth() + 1), 10);
  const year = parseInt((req.query.year as string) || String(now.getFullYear()), 10);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { month, year, start, end };
};

// GET /api/analytics/dashboard
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { start, end } = monthRange(req);
  const { accountId, categoryId } = req.query as Record<string, string>;

  const totals = await getIncomeExpenseTotals({ userId: req.user!.id, start, end, accountId, categoryId });
  const savings = totals.income - totals.expense;
  const savingsRate = totals.income > 0 ? Math.round((savings / totals.income) * 1000) / 10 : 0;
  const daysElapsed = Math.max(1, Math.ceil((Math.min(Date.now(), end.getTime()) - start.getTime()) / 86400000) + 1);
  const avgDailyExpense = Math.round((totals.expense / daysElapsed) * 100) / 100;

  res.status(200).json({
    success: true,
    data: {
      totalIncome: totals.income,
      totalExpense: totals.expense,
      savings,
      savingsRate,
      averageDailyExpense: avgDailyExpense,
    },
  });
});

// GET /api/analytics/category-expenses
export const getCategoryExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { start, end } = monthRange(req);
  const { accountId, categoryId } = req.query as Record<string, string>;

  const data = await getExpenseByCategory({ userId: req.user!.id, start, end, accountId, categoryId });
  res.status(200).json({ success: true, data });
});

// GET /api/analytics/monthly-trend?months=6
export const getMonthlyTrendHandler = asyncHandler(async (req: Request, res: Response) => {
  const months = Math.min(Math.max(parseInt((req.query.months as string) || '6', 10), 1), 24);
  const data = await getMonthlyTrend(req.user!.id, months);
  res.status(200).json({ success: true, data });
});

// GET /api/analytics/daily-spending
export const getDailySpendingHandler = asyncHandler(async (req: Request, res: Response) => {
  const { month, year } = monthRange(req);
  const data = await getDailySpending(req.user!.id, month, year);
  res.status(200).json({ success: true, data });
});

// GET /api/analytics/insights
export const getInsights = asyncHandler(async (req: Request, res: Response) => {
  const { start, end } = monthRange(req);

  const prevMonthEnd = new Date(start.getTime() - 1);
  const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);

  const [current, previous, categories, highest] = await Promise.all([
    getIncomeExpenseTotals({ userId: req.user!.id, start, end }),
    getIncomeExpenseTotals({ userId: req.user!.id, start: prevMonthStart, end: prevMonthEnd }),
    getExpenseByCategory({ userId: req.user!.id, start, end }),
    getHighestExpense({ userId: req.user!.id, start, end }),
  ]);

  const currentSavings = current.income - current.expense;
  const previousSavings = previous.income - previous.expense;

  const pctChange = (curr: number, prev: number) =>
    prev > 0 ? Math.round(((curr - prev) / prev) * 1000) / 10 : null;

  res.status(200).json({
    success: true,
    data: {
      topSpendingCategory: categories[0] || null,
      highestExpense: highest,
      averageDailySpending:
        Math.round((current.expense / new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()) * 100) / 100,
      expenseChangeFromLastMonth: {
        amount: Math.round((current.expense - previous.expense) * 100) / 100,
        percent: pctChange(current.expense, previous.expense),
      },
      incomeChangeFromLastMonth: {
        amount: Math.round((current.income - previous.income) * 100) / 100,
        percent: pctChange(current.income, previous.income),
      },
      savingsChangeFromLastMonth: {
        amount: Math.round((currentSavings - previousSavings) * 100) / 100,
        percent: pctChange(currentSavings, previousSavings),
      },
    },
  });
});
