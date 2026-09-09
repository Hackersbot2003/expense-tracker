import { body, param, query } from 'express-validator';

export const createTransactionValidator = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('categoryId').isMongoId().withMessage('Valid categoryId is required'),
  body('accountId').isMongoId().withMessage('Valid accountId is required'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
  body('note').optional().isString().isLength({ max: 200 }),
];

export const updateTransactionValidator = [
  param('id').isMongoId().withMessage('Invalid transaction id'),
  body('type').optional().isIn(['income', 'expense']),
  body('amount').optional().isFloat({ gt: 0 }),
  body('categoryId').optional().isMongoId(),
  body('accountId').optional().isMongoId(),
  body('date').optional().isISO8601(),
  body('note').optional().isString().isLength({ max: 200 }),
];

export const listTransactionsValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['income', 'expense']),
  query('categoryId').optional().isMongoId(),
  query('accountId').optional().isMongoId(),
  query('minAmount').optional().isFloat({ min: 0 }),
  query('maxAmount').optional().isFloat({ min: 0 }),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('quickFilter').optional().isIn([
    'today',
    'this_week',
    'this_month',
    'last_month',
    'last_3_months',
    'this_year',
  ]),
  query('sortBy').optional().isIn(['newest', 'oldest', 'amount_high', 'amount_low', 'category_asc', 'category_desc']),
];
