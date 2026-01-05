import { Router } from 'express';
import ordersModule from '../modules/orders/orders.module';
import usersModule from '../modules/users/users.module';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running!',
    timestamp: new Date().toISOString(),
  });
});

router.use(usersModule.router);
router.use(ordersModule.router);

export default router;
