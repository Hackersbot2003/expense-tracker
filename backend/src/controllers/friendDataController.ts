import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';
import User from '../models/User';
import Transaction from '../models/Transaction';
import { assertAreFriends } from '../services/friendPrivacyService';
import {
  getExpenseByCategory,
  getIncomeExpenseTotals,
  getMonthlyTrend,
} from '../services/analyticsService';

const monthRange = (req: Request) => {
  const now = new Date();
  const month = parseInt((req.query.month as string) || String(now.getMonth() + 1), 10);
  const year = parseInt((req.query.year as string) || String(now.getFullYear()), 10);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

// GET /api/friends/:userId/profile
// Read-only. Every field is gated behind that user's own privacy settings —
// enforced here on the backend, never left to the mobile app to hide.
export const getFriendProfile = asyncHandler(async (req: Request, res: Response) => {
  const targetId = req.params.userId;
  await assertAreFriends(req.user!.id, targetId);

  const target = await User.findById(targetId);
  if (!target) throw ApiError.notFound('User not found');

  const { start, end } = monthRange(req);
  const privacy = target.privacySettings;

  const totals = await getIncomeExpenseTotals({ userId: targetId, start, end });

  const data: Record<string, unknown> = {
    user: { id: target._id, name: target.name, username: target.username, profileImage: target.profileImage },
    readOnly: true,
  };

  if (privacy.showTotalExpenses) data.totalExpense = totals.expense;
  if (privacy.showIncome) data.totalIncome = totals.income;

  if (privacy.showCategorySpending) {
    data.categoryExpenses = await getExpenseByCategory({ userId: targetId, start, end });
  }

  if (privacy.showMonthlyTrends) {
    data.monthlyTrend = await getMonthlyTrend(targetId, 6, end);
  }

  if (privacy.showIndividualTransactions) {
    data.recentTransactions = await Transaction.find({ userId: targetId, date: { $gte: start, $lte: end } })
      .populate('categoryId', 'name icon')
      .sort({ date: -1 })
      .limit(20);
  }

  res.status(200).json({ success: true, data });
});

// GET /api/friends/:userId/analytics — charts only, gated by showCharts
export const getFriendAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const targetId = req.params.userId;
  await assertAreFriends(req.user!.id, targetId);

  const target = await User.findById(targetId);
  if (!target) throw ApiError.notFound('User not found');

  if (!target.privacySettings.showCharts) {
    throw ApiError.forbidden('This user has not enabled chart sharing with friends');
  }

  const { start, end } = monthRange(req);
  const categoryExpenses = await getExpenseByCategory({ userId: targetId, start, end });
  const monthlyTrend = target.privacySettings.showMonthlyTrends
    ? await getMonthlyTrend(targetId, 6, end)
    : null;

  res.status(200).json({ success: true, data: { categoryExpenses, monthlyTrend, readOnly: true } });
});

// GET /api/friends/:userId/transactions — gated by showIndividualTransactions
export const getFriendTransactions = asyncHandler(async (req: Request, res: Response) => {
  const targetId = req.params.userId;
  await assertAreFriends(req.user!.id, targetId);

  const target = await User.findById(targetId);
  if (!target) throw ApiError.notFound('User not found');

  if (!target.privacySettings.showIndividualTransactions) {
    throw ApiError.forbidden('This user has not enabled individual transaction sharing with friends');
  }

  const { start, end } = monthRange(req);
  const transactions = await Transaction.find({ userId: targetId, date: { $gte: start, $lte: end } })
    .populate('categoryId', 'name icon')
    .sort({ date: -1 });

  res.status(200).json({ success: true, data: transactions, readOnly: true });
});

// GET /api/friends/:userId/compare — only fields both users have opted to share
export const compareWithFriend = asyncHandler(async (req: Request, res: Response) => {
  const targetId = req.params.userId;
  await assertAreFriends(req.user!.id, targetId);

  const [me, target] = await Promise.all([User.findById(req.user!.id), User.findById(targetId)]);
  if (!target || !me) throw ApiError.notFound('User not found');

  const { start, end } = monthRange(req);

  const result: Record<string, unknown> = { readOnly: true };

  // Expense totals: only shown for the target if they allow it; your own
  // data is always included since it's yours to see.
  const myTotals = await getIncomeExpenseTotals({ userId: req.user!.id, start, end });
  result.you = { totalExpense: myTotals.expense };

  if (target.privacySettings.showTotalExpenses) {
    const targetTotals = await getIncomeExpenseTotals({ userId: targetId, start, end });
    (result as any).them = { totalExpense: targetTotals.expense };
  }

  if (target.privacySettings.showCategorySpending) {
    const [myCategories, theirCategories] = await Promise.all([
      getExpenseByCategory({ userId: req.user!.id, start, end }),
      getExpenseByCategory({ userId: targetId, start, end }),
    ]);
    result.categoryComparison = { you: myCategories, them: theirCategories };
  }

  if (target.privacySettings.showMonthlyTrends) {
    const [myTrend, theirTrend] = await Promise.all([
      getMonthlyTrend(req.user!.id, 6, end),
      getMonthlyTrend(targetId, 6, end),
    ]);
    result.trendComparison = { you: myTrend, them: theirTrend };
  }

  res.status(200).json({ success: true, data: result });
});
