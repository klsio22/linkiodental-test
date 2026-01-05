import { Router } from 'express';
import orderRoutes from './order.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running!',
    timestamp: new Date().toISOString(),
  });
});

router.use('/orders', orderRoutes);

export default router;
