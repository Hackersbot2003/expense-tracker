import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import Account from '../models/Account';
import Transaction from '../models/Transaction';

// GET /api/accounts
export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = new Types.ObjectId(req.user!.id);
  const accounts = await Account.find({ userId }).sort({ name: 1 });

  // Compute a live balance per account: opening balance + income - expense
  const balances = await Transaction.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: { accountId: '$accountId', type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const balanceMap = new Map<string, { income: number; expense: number }>();
  for (const row of balances) {
    const key = row._id.accountId.toString();
    const entry = balanceMap.get(key) || { income: 0, expense: 0 };
    if (row._id.type === 'income') entry.income = row.total;
    else entry.expense = row.total;
    balanceMap.set(key, entry);
  }

  const withBalances = accounts.map((acc) => {
    const entry = balanceMap.get(acc._id.toString()) || { income: 0, expense: 0 };
    return {
      ...acc.toObject(),
      currentBalance: acc.openingBalance + entry.income - entry.expense,
    };
  });

  res.status(200).json({ success: true, data: withBalances });
});

// POST /api/accounts
export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const { name, icon, openingBalance } = req.body;

  const existing = await Account.findOne({ userId: req.user!.id, name });
  if (existing) throw ApiError.conflict('You already have an account with this name');

  const account = await Account.create({
    userId: req.user!.id,
    name,
    icon,
    openingBalance: openingBalance ?? 0,
  });
  res.status(201).json({ success: true, data: account });
});

// PUT /api/accounts/:id
export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await Account.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!account) throw ApiError.notFound('Account not found');

  const { name, icon, openingBalance } = req.body;
  if (name !== undefined) account.name = name;
  if (icon !== undefined) account.icon = icon;
  if (openingBalance !== undefined) account.openingBalance = openingBalance;

  await account.save();
  res.status(200).json({ success: true, data: account });
});

// DELETE /api/accounts/:id
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await Account.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!account) throw ApiError.notFound('Account not found');

  const inUse = await Transaction.exists({ accountId: account._id, userId: req.user!.id });
  if (inUse) {
    throw ApiError.conflict('Cannot delete an account that has transactions.');
  }

  await account.deleteOne();
  res.status(200).json({ success: true, data: { id: req.params.id } });
});
