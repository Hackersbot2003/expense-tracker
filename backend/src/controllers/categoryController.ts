import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ApiError } from '../utils/ApiError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

// GET /api/categories
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;
  const filter: Record<string, unknown> = { userId: req.user!.id };
  if (type === 'income' || type === 'expense') filter.type = type;

  const categories = await Category.find(filter).sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

// POST /api/categories
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, icon, type } = req.body;

  const existing = await Category.findOne({ userId: req.user!.id, name, type });
  if (existing) throw ApiError.conflict('You already have a category with this name and type');

  const category = await Category.create({ userId: req.user!.id, name, icon, type });
  res.status(201).json({ success: true, data: category });
});

// PUT /api/categories/:id
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!category) throw ApiError.notFound('Category not found');

  const { name, icon, type } = req.body;
  if (name !== undefined) category.name = name;
  if (icon !== undefined) category.icon = icon;
  if (type !== undefined) category.type = type;

  await category.save();
  res.status(200).json({ success: true, data: category });
});

// DELETE /api/categories/:id
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.user!.id });
  if (!category) throw ApiError.notFound('Category not found');

  const inUse = await Transaction.exists({ categoryId: category._id, userId: req.user!.id });
  if (inUse) {
    throw ApiError.conflict('Cannot delete a category that has transactions. Reassign or delete those first.');
  }

  await category.deleteOne();
  res.status(200).json({ success: true, data: { id: req.params.id } });
});
