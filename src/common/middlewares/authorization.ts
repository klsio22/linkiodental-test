import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

/**
 * Middleware que verifica se o usuário tem permissão para operações
 * ATTENDANT, LAB_ADMIN e SUPER_ADMIN têm acesso total ao sistema
 */
export const requireAttendant = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const userRole = (req as any).user?.role;

  if (!userRole) {
    return next(new AppError('User role not found', 403));
  }

  const allowedRoles = ['ATTENDANT', 'LAB_ADMIN', 'SUPER_ADMIN'];

  if (!allowedRoles.includes(userRole)) {
    return next(
      new AppError('Access denied. Only authorized staff can perform this operation.', 403)
    );
  }

  next();
};
