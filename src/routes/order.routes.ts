import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { validate } from '../middlewares/validator';
import {
  createOrderValidation,
  updateOrderValidation,
  listOrdersValidation,
} from '../validators/order.validator';

const router = Router();

router.get('/stats', orderController.getOrderStats);

router.post('/', validate(createOrderValidation), orderController.createOrder);

router.get('/', validate(listOrdersValidation), orderController.listOrders);

router.get('/:id', orderController.getOrderById);

router.put('/:id', validate(updateOrderValidation), orderController.updateOrder);

router.delete('/:id', orderController.deleteOrder);

router.patch('/:id/advance', orderController.advanceOrderState);

export default router;
