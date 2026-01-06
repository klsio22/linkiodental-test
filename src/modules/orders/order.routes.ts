import { Router } from 'express';
import orderController from './controllers/order.controller';
import { validate } from '../../common/middlewares/validator';
import { authMiddleware } from '../../common/middlewares/auth';
import { requireAttendant } from '../../common/middlewares/authorization';
import {
  createOrderValidation,
  updateOrderValidation,
  listOrdersValidation,
} from './validators/order.validator';

const router = Router();

// All order routes require authentication
router.use(authMiddleware);

// Only ATTENDANT/LAB_ADMIN/SUPER_ADMIN can create orders
router.post('/', requireAttendant, validate(createOrderValidation), orderController.createOrder);

// Read operations allowed for all authenticated users
// Status by order id (returns `status: ACTIVE | DELETED`)
router.get('/:id/status', orderController.getOrderStatus);
router.get('/', validate(listOrdersValidation), orderController.listOrders);
router.get('/:id', orderController.getOrderById);

// Update/Delete/Advance operations only for ATTENDANT
router.put('/:id', requireAttendant, validate(updateOrderValidation), orderController.updateOrder);
router.delete('/:id', requireAttendant, orderController.deleteOrder);
router.patch('/:id/advance', requireAttendant, orderController.advanceOrderState);
router.post('/:id/add-service', requireAttendant, orderController.updateOrderAddService);
router.post('/:id/add-comment', requireAttendant, orderController.addCommentToOrder);


export default router;
