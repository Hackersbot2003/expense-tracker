import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/generateToken';
import User from '../models/User';

const publicUser = (user: any) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  profileImage: user.profileImage,
  privacySettings: user.privacySettings,
  createdAt: user.createdAt,
});

// POST /api/auth/register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    if (existing.email === email.toLowerCase()) throw ApiError.conflict('Email is already registered');
    throw ApiError.conflict('Username is already taken');
  }

  const user = await User.create({ name, username, email, password });
  const token = generateToken({ id: user._id.toString(), username: user.username, email: user.email });

  res.status(201).json({ success: true, data: { user: publicUser(user), token } });
});

// POST /api/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  const token = generateToken({ id: user._id.toString(), username: user.username, email: user.email });

  res.status(200).json({ success: true, data: { user: publicUser(user), token } });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json({ success: true, data: { user: publicUser(user) } });
});

// PUT /api/auth/privacy-settings
export const updatePrivacySettings = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');

  const allowedKeys = [
    'showTotalExpenses',
    'showIncome',
    'showCategorySpending',
    'showCharts',
    'showMonthlyTrends',
    'showIndividualTransactions',
    'showAccountBalances',
  ] as const;

  for (const key of allowedKeys) {
    if (typeof req.body[key] === 'boolean') {
      (user.privacySettings as any)[key] = req.body[key];
    }
  }

  await user.save();
  res.status(200).json({ success: true, data: { privacySettings: user.privacySettings } });
});
