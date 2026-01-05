import { Router } from 'express';
import orderRoutes from './order.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API está funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// Rotas de pedidos
router.use('/orders', orderRoutes);

export default router;
