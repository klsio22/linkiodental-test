import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Middlewares de segurança
  app.use(helmet());
  app.use(cors());

  // Middlewares de parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  // Rotas
  app.use('/api', routes);

  // Rota raiz
  app.get('/', (_req, res) => {
    res.json({
      message: 'Lab Orders API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        orders: '/api/orders',
        stats: '/api/orders/stats',
      },
    });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Rota não encontrada',
    });
  });

  // Error handler (deve ser o último middleware)
  app.use(errorHandler);

  return app;
};
