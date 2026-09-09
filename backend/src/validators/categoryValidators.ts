import { body, param } from 'express-validator';

export const createCategoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 40 }),
  body('icon').trim().notEmpty().withMessage('Icon is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
];

export const updateCategoryValidator = [
  param('id').isMongoId().withMessage('Invalid category id'),
  body('name').optional().trim().notEmpty().isLength({ max: 40 }),
  body('icon').optional().trim().notEmpty(),
  body('type').optional().isIn(['income', 'expense']),
];

export const idParamValidator = [param('id').isMongoId().withMessage('Invalid id')];
