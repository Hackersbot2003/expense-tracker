import { Types } from 'mongoose';
import Transaction from '../models/Transaction';

interface RangeFilters {
  userId: string;
  start: Date;
  end: Date;
  accountId?: string;
  categoryId?: string;
}

const baseMatch = (f: RangeFilters) => {
  const match: Record<string, unknown> = {
    userId: new Types.ObjectId(f.userId),
    date: { $gte: f.start, $lte: f.end },
  };
  if (f.accountId) match.accountId = new Types.ObjectId(f.accountId);
  if (f.categoryId) match.categoryId = new Types.ObjectId(f.categoryId);
  return match;
};

/** Total income and total expense for the given range. */
export const getIncomeExpenseTotals = async (f: RangeFilters) => {
  const rows = await Transaction.aggregate([
    { $match: baseMatch(f) },
    { $group: { _id: '$type', total: { $sum: '$amount' } } },
  ]);

  const totals = { income: 0, expense: 0 };
  for (const row of rows) {
    if (row._id === 'income') totals.income = row.total;
    if (row._id === 'expense') totals.expense = row.total;
  }
  return totals;
};

/** Expense breakdown by category (for the doughnut chart), with percentages. */
export const getExpenseByCategory = async (f: RangeFilters) => {
  const rows = await Transaction.aggregate([
    { $match: { ...baseMatch(f), type: 'expense' } },
    { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        name: '$category.name',
        icon: '$category.icon',
        total: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = rows.reduce((sum, r) => sum + r.total, 0);
  return rows.map((r) => ({
    ...r,
    percentage: grandTotal > 0 ? Math.round((r.total / grandTotal) * 1000) / 10 : 0,
  }));
};

/** Monthly income vs expense trend over the last N months (for line/bar chart). */
export const getMonthlyTrend = async (userId: string, months: number, end: Date = new Date()) => {
  const start = new Date(end.getFullYear(), end.getMonth() - (months - 1), 1);

  const rows = await Transaction.aggregate([
    { $match: { userId: new Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Build a complete month-by-month series, filling zeros for months with no data
  const series: { year: number; month: number; income: number; expense: number }[] = [];
  for (let i = 0; i < months; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    series.push({ year: d.getFullYear(), month: d.getMonth() + 1, income: 0, expense: 0 });
  }

  for (const row of rows) {
    const entry = series.find((s) => s.year === row._id.year && s.month === row._id.month);
    if (entry) {
      if (row._id.type === 'income') entry.income = row.total;
      else entry.expense = row.total;
    }
  }

  return series;
};

/** Daily spending for a specific month (for the daily spending chart). */
export const getDailySpending = async (userId: string, month: number, year: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: { $dayOfMonth: '$date' }, total: { $sum: '$amount' } } },
    { $sort: { _id: 1 } },
  ]);

  const daysInMonth = end.getDate();
  const series = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, total: 0 }));
  for (const row of rows) {
    const entry = series.find((s) => s.day === row._id);
    if (entry) entry.total = row.total;
  }
  return series;
};

/** Single highest expense transaction in the range. */
export const getHighestExpense = async (f: RangeFilters) => {
  const [highest] = await Transaction.aggregate([
    { $match: { ...baseMatch(f), type: 'expense' } },
    { $sort: { amount: -1 } },
    { $limit: 1 },
    {
      $lookup: { from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'category' },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $project: { amount: 1, date: 1, note: 1, category: '$category.name' } },
  ]);
  return highest || null;
};
