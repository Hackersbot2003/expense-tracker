import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import Budget from '../models/Budget';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

const withProgress = async (userId: string, budgets: any[]) => {
  const uid = new Types.ObjectId(userId);

  return Promise.all(
    budgets.map(async (budget) => {
      const start = new Date(budget.year, budget.month - 1, 1);
      const end = new Date(budget.year, budget.month, 0, 23, 59, 59, 999);

      const match: Record<string, unknown> = {
        userId: uid,
        type: 'expense',
        date: { $gte: start, $lte: end },
      };
      if (budget.type === 'category') match.categoryId = budget.categoryId;

      const [result] = await Transaction.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = result?.total || 0;
      const remaining = budget.amount - spent;
      const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      return { ...budget.toObject(), spent, remaining, percentUsed };
    })
  );
};

// GET /api/budgets?month=&year=
export const getBudgets = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const month = parseInt((req.query.month as string) || String(now.getMonth() + 1), 10);
  const year = parseInt((req.query.year as string) || String(now.getFullYear()), 10);

  const budgets = await Budget.find({ userId: req.user!.id, month, year })
    .populate('categoryId', 'name icon')
    .sort({ type: 1 });

  const data = await withProgress(req.user!.id, budgets);
  res.status(200).json({ success: true, data });
});

// POST /api/budgets
export const createBudget = asyncHandler(async (req: Request, res: Response) => {
  const { type, categoryId, amount, month, year } = req.body;

  if (type === 'category') {
    const category = await Category.findOne({ _id: categoryId, userId: req.user!.id, type: 'expense' });
    if (!category) throw ApiError.badRequest('Category not found, not owned by user, or not an expense category');
  }

  const existing = await Budget.findOne({
    userId: req.user!.id,
    type,
    categoryId: type === 'category' ? categoryId : null,
    month,
    year,
  });
  if (existing) throw ApiError.conflict('A budget for this scope and month already exists. Edit it instead.');

  const budget = await Budget.create({
    userId: req.user!.id,
    type,
    categoryId: type === 'category' ? categoryId : undefined,
    amount,
    month,
    year,
  });

  res.status(201).json({ success: true, data: budget });
});

// PUT /api/budgets/:id
export const updateBudget = asyncHandler(async (req: Request, res: Response) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!budget) throw ApiError.notFound('Budget not found');

  const { amount } = req.body;
  if (amount !== undefined) budget.amount = amount;

  await budget.save();
  res.status(200).json({ success: true, data: budget });
});

// DELETE /api/budgets/:id
export const deleteBudget = asyncHandler(async (req: Request, res: Response) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!budget) throw ApiError.notFound('Budget not found');

  await budget.deleteOne();
  res.status(200).json({ success: true, data: { id: req.params.id } });
});
