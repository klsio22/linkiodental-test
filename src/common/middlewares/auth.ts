import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const authMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded: any = jwt.verify(token, config.jwtSecret);
    (req as any).user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};
