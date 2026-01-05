import { body, query } from 'express-validator';
import { OrderState, OrderStatus } from '../types/order.types';

export const createOrderValidation = [
  body('lab')
    .trim()
    .notEmpty()
    .withMessage('Lab is required')
    .isLength({ min: 2 })
    .withMessage('Lab must be at least 2 characters long'),

  body('patient')
    .trim()
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 3 })
    .withMessage('Patient name must be at least 3 characters long'),

  body('customer')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 3 })
    .withMessage('Customer name must be at least 3 characters long'),

  body('services')
    .isArray({ min: 1 })
    .withMessage('At least one service must be provided'),

  body('services.*.name')
    .trim()
    .notEmpty()
    .withMessage('Service name is required'),

  body('services.*.value')
    .isFloat({ min: 0.01 })
    .withMessage('Service value must be greater than zero'),

  body('services.*.status')
    .optional()
    .isIn(['PENDING', 'DONE'])
    .withMessage('Invalid service status'),
];

export const updateOrderValidation = [
  body('lab')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Lab must be at least 2 characters long'),

  body('patient')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Patient name must be at least 3 characters long'),

  body('customer')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Customer name must be at least 3 characters long'),

  body('services')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Must provide at least one service if updating services'),

  body('services.*.name')
    .if(() => body('services').exists())
    .trim()
    .notEmpty()
    .withMessage('Service name is required'),

  body('services.*.value')
    .if(() => body('services').exists())
    .isFloat({ min: 0.01 })
    .withMessage('Service value must be greater than zero'),

  body('status')
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage('Invalid order status'),
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

  query('status')
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage(`Status must be one of: ${Object.values(OrderStatus).join(', ')}`),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"'),
];
