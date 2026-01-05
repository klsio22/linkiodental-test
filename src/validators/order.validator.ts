import { body, query } from 'express-validator';
import { OrderState } from '../types/order.types';

export const createOrderValidation = [
  body('patientName')
    .trim()
    .notEmpty()
    .withMessage('Nome do paciente é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome do paciente deve ter no mínimo 3 caracteres'),

  body('dentistName')
    .trim()
    .notEmpty()
    .withMessage('Nome do dentista é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome do dentista deve ter no mínimo 3 caracteres'),

  body('services')
    .isArray({ min: 1 })
    .withMessage('Pelo menos um serviço deve ser informado'),

  body('services.*')
    .trim()
    .notEmpty()
    .withMessage('Serviço não pode ser vazio'),

  body('totalValue')
    .isFloat({ min: 0.01 })
    .withMessage('Valor total deve ser maior que zero'),

  body('deadline')
    .isISO8601()
    .withMessage('Prazo deve ser uma data válida')
    .custom((value) => {
      const deadline = new Date(value);
      if (deadline <= new Date()) {
        throw new Error('Prazo deve ser uma data futura');
      }
      return true;
    }),
];

export const updateOrderValidation = [
  body('patientName')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome do paciente deve ter no mínimo 3 caracteres'),

  body('dentistName')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Nome do dentista deve ter no mínimo 3 caracteres'),

  body('services')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Pelo menos um serviço deve ser informado'),

  body('services.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Serviço não pode ser vazio'),

  body('totalValue')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Valor total deve ser maior que zero'),

  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Prazo deve ser uma data válida')
    .custom((value) => {
      const deadline = new Date(value);
      if (deadline <= new Date()) {
        throw new Error('Prazo deve ser uma data futura');
      }
      return true;
    }),
];

export const listOrdersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro maior que 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número entre 1 e 100'),

  query('state')
    .optional()
    .isIn(Object.values(OrderState))
    .withMessage(`Estado deve ser um dos: ${Object.values(OrderState).join(', ')}`),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordenação deve ser "asc" ou "desc"'),
];
