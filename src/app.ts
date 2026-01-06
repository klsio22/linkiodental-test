import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './common/config/env';
import { openApiSpec } from './common/openapi';
import routes from './common';
import { errorHandler } from './common/middlewares/errorHandler';

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  // Swagger API Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { swaggerOptions: { url: '/api/openapi.json' } }));

  app.use('/api', routes);

  app.get('/', (_req, res) => {
    res.json({
      message: 'Lab Orders API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        orders: '/api/orders',
        stats: '/api/orders/stats',
        docs: '/api/docs',
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
