import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

/**
 * Middleware que verifica se o usuário é ATTENDANT (funcionário)
 * Apenas ATTENDANT, LAB_ADMIN e SUPER_ADMIN podem criar pedidos
 * CUSTOMER (cliente/paciente) não pode criar pedidos
 */
export const requireAttendant = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const userRole = (req as any).user?.role;

  if (!userRole) {
    return next(new AppError('User role not found', 403));
  }

  const allowedRoles = ['ATTENDANT', 'LAB_ADMIN', 'SUPER_ADMIN'];

  if (!allowedRoles.includes(userRole)) {
    return next(
      new AppError('Only staff members (ATTENDANT) can create orders. Clients cannot create orders.', 403)
    );
  }

  next();
};
