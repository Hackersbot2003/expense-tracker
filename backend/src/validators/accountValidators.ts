import { body, param } from 'express-validator';

export const createAccountValidator = [
  body('name').trim().notEmpty().withMessage('Account name is required').isLength({ max: 40 }),
  body('icon').trim().notEmpty().withMessage('Icon is required'),
  body('openingBalance').optional().isFloat().withMessage('Opening balance must be a number'),
];

export const updateAccountValidator = [
  param('id').isMongoId().withMessage('Invalid account id'),
  body('name').optional().trim().notEmpty().isLength({ max: 40 }),
  body('icon').optional().trim().notEmpty(),
  body('openingBalance').optional().isFloat(),
];
