import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  void _next;
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  // Erro do Mongoose - ValidationError
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Erro de validação',
      errors: error.message,
    });
  }

  // Erro do Mongoose - CastError (ID inválido)
  if (error.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'ID inválido',
    });
  }

  // Erro não tratado
  console.error('❌ Erro não tratado:', error);
  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor',
  });
};

// Wrapper para funções assíncronas
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
