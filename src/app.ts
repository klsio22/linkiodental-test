import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  app.use('/api', routes);

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

  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found',
    });
  });

  app.use(errorHandler);

  return app;
};
