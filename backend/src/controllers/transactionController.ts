import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { FilterQuery } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import Transaction, { ITransaction } from '../models/Transaction';
import Category from '../models/Category';
import Account from '../models/Account';
import { QuickFilter, resolveQuickFilter } from '../services/dateRangeService';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { date: -1 },
  oldest: { date: 1 },
  amount_high: { amount: -1 },
  amount_low: { amount: 1 },
};

// GET /api/transactions
export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '20',
    type,
    categoryId,
    accountId,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    quickFilter,
    sortBy = 'newest',
    search,
  } = req.query as Record<string, string>;

  const filter: FilterQuery<ITransaction> = { userId: req.user!.id };

  if (type) filter.type = type;
  if (categoryId) filter.categoryId = categoryId;
  if (accountId) filter.accountId = accountId;

  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = parseFloat(minAmount);
    if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
  }

  if (quickFilter) {
    const { start, end } = resolveQuickFilter(quickFilter as QuickFilter);
    filter.date = { $gte: start, $lte: end };
  } else if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (search) {
    // Search note directly; category/account name search is handled via
    // a lookup-free approach by first resolving matching category/account ids.
    const [matchingCategories, matchingAccounts] = await Promise.all([
      Category.find({ userId: req.user!.id, name: { $regex: search, $options: 'i' } }).select('_id'),
      Account.find({ userId: req.user!.id, name: { $regex: search, $options: 'i' } }).select('_id'),
    ]);

    filter.$or = [
      { note: { $regex: search, $options: 'i' } },
      { categoryId: { $in: matchingCategories.map((c) => c._id) } },
      { accountId: { $in: matchingAccounts.map((a) => a._id) } },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  let query = Transaction.find(filter)
    .populate('categoryId', 'name icon type')
    .populate('accountId', 'name icon');

  // Category A-Z / Z-A requires sorting on the populated field, which Mongoose
  // can't do at the DB level without a lookup, so we sort by category name
  // in JS after fetching the page. For all other sorts, DB-level sort + skip/limit.
  if (sortBy === 'category_asc' || sortBy === 'category_desc') {
    const all = await query.exec();
    all.sort((a: any, b: any) => {
      const nameA = a.categoryId?.name || '';
      const nameB = b.categoryId?.name || '';
      return sortBy === 'category_asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    const total = all.length;
    const paged = all.slice(skip, skip + limitNum);
    res.status(200).json({
      success: true,
      data: paged,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
    return;
  }

  const sort = SORT_MAP[sortBy] || SORT_MAP.newest;
  const [items, total] = await Promise.all([
    query.sort(sort).skip(skip).limit(limitNum).exec(),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: items,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// GET /api/transactions/:id
export const getTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user!.id })
    .populate('categoryId', 'name icon type')
    .populate('accountId', 'name icon');

  if (!transaction) throw ApiError.notFound('Transaction not found');
  res.status(200).json({ success: true, data: transaction });
});

const assertOwnedRefs = async (userId: string, categoryId?: string, accountId?: string) => {
  if (categoryId) {
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) throw ApiError.badRequest('Category not found or not owned by user');
  }
  if (accountId) {
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) throw ApiError.badRequest('Account not found or not owned by user');
  }
};

// POST /api/transactions
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { type, amount, categoryId, accountId, date, note } = req.body;

  await assertOwnedRefs(req.user!.id, categoryId, accountId);

  const transaction = await Transaction.create({
    userId: req.user!.id,
    type,
    amount,
    categoryId,
    accountId,
    date: date ? new Date(date) : new Date(),
    note,
  });

  res.status(201).json({ success: true, data: transaction });
});

// PUT /api/transactions/:id
export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!transaction) throw ApiError.notFound('Transaction not found');

  const { type, amount, categoryId, accountId, date, note } = req.body;
  await assertOwnedRefs(req.user!.id, categoryId, accountId);

  if (type !== undefined) transaction.type = type;
  if (amount !== undefined) transaction.amount = amount;
  if (categoryId !== undefined) transaction.categoryId = categoryId;
  if (accountId !== undefined) transaction.accountId = accountId;
  if (date !== undefined) transaction.date = new Date(date);
  if (note !== undefined) transaction.note = note;

  await transaction.save();
  res.status(200).json({ success: true, data: transaction });
});

// DELETE /api/transactions/:id
export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!transaction) throw ApiError.notFound('Transaction not found');

  await transaction.deleteOne();
  res.status(200).json({ success: true, data: { id: req.params.id } });
});
