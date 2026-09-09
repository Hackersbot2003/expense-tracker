import { body, param } from 'express-validator';

export const createBudgetValidator = [
  body('type').isIn(['overall', 'category']).withMessage('Type must be overall or category'),
  body('categoryId')
    .if(body('type').equals('category'))
    .isMongoId()
    .withMessage('categoryId is required for a category budget'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2000 }).withMessage('Valid year is required'),
];

export const updateBudgetValidator = [
  param('id').isMongoId().withMessage('Invalid budget id'),
  body('amount').optional().isFloat({ gt: 0 }),
];
