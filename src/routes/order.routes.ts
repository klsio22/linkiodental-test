import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { validate } from '../middlewares/validator';
import {
  createOrderValidation,
  updateOrderValidation,
  listOrdersValidation,
} from '../validators/order.validator';

const router = Router();

/**
 * GET /api/orders/stats - Obter estatísticas (antes das rotas com :id)
 */
router.get('/stats', orderController.getOrderStats);

/**
 * POST /api/orders - Criar novo pedido
 */
router.post('/', validate(createOrderValidation), orderController.createOrder);

/**
 * GET /api/orders - Listar pedidos
 */
router.get('/', validate(listOrdersValidation), orderController.listOrders);

/**
 * GET /api/orders/:id - Buscar pedido por ID
 */
router.get('/:id', orderController.getOrderById);

/**
 * PUT /api/orders/:id - Atualizar pedido
 */
router.put('/:id', validate(updateOrderValidation), orderController.updateOrder);

/**
 * DELETE /api/orders/:id - Deletar pedido
 */
router.delete('/:id', orderController.deleteOrder);

/**
 * PATCH /api/orders/:id/advance - Avançar estado do pedido
 */
router.patch('/:id/advance', orderController.advanceOrderState);

export default router;
