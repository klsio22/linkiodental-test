import { body, query } from 'express-validator';
import { OrderState } from '../types/order.types';

export const createOrderValidation = [
  body('patientName')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 3 })
    .withMessage('Patient name must be at least 3 characters long'),

  body('dentistName')
    .trim()
    .notEmpty()
    .withMessage('Dentist name is required')
    .isLength({ min: 3 })
    .withMessage('Dentist name must be at least 3 characters long'),

  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be provided'),

  body('services.*')
    .trim()
    .notEmpty()
    .withMessage('Service cannot be empty'),

  body('totalValue')
    .isFloat({ min: 0.01 })
    .withMessage('Total value must be greater than zero'),

  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .custom((value) => {
      const deadline = new Date(value);
      if (deadline <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
];

export const updateOrderValidation = [
  body('patientName')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Patient name must be at least 3 characters long'),

  body('dentistName')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Dentist name must be at least 3 characters long'),

  body('services')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one service must be provided'),

  body('services.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Service cannot be empty'),

  body('totalValue')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Total value must be greater than zero'),

  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .custom((value) => {
      const deadline = new Date(value);
      if (deadline <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
];

export const listOrdersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a number between 1 and 100'),

  query('state')
    .optional()
    .isIn(Object.values(OrderState))
    .withMessage(`State must be one of: ${Object.values(OrderState).join(', ')}`),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"'),
];
