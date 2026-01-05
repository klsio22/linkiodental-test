import { Router } from 'express';
import orderController from './controllers/order.controller';
import { validate } from '../../common/middlewares/validator';
import { authMiddleware } from '../../common/middlewares/auth';
import {
  createOrderValidation,
  updateOrderValidation,
  listOrdersValidation,
} from './validators/order.validator';

const router = Router();

// All order routes require authentication
router.use(authMiddleware);

router.get('/stats', orderController.getOrderStats);

router.post('/', validate(createOrderValidation), orderController.createOrder);

router.get('/', validate(listOrdersValidation), orderController.listOrders);

router.get('/:id', orderController.getOrderById);

router.put('/:id', validate(updateOrderValidation), orderController.updateOrder);

router.delete('/:id', orderController.deleteOrder);

router.patch('/:id/advance', orderController.advanceOrderState);

export default router;
