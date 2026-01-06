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
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as string;

    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
      req.user = {
        id: String((decoded as jwt.JwtPayload).id),
        role: (decoded as jwt.JwtPayload).role,
      };
      return next();
    }

    return next(new AppError('Invalid token payload', 401));
  } catch (error) {
    console.error('JWT verification error:', error);
    return next(new AppError('Invalid or expired token', 401));
  }
};