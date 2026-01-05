import { Request, Response } from 'express';
import orderService from '../services/order.service';
import { asyncHandler } from '../middlewares/errorHandler';
import { OrderQueryParams } from '../types/order.types';

export class OrderController {
  /**
   * Criar novo pedido
   * POST /api/orders
   */
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({
      status: 'success',
      data: order,
    });
  });

  /**
   * Listar pedidos
   * GET /api/orders
   */
  listOrders = asyncHandler(async (req: Request, res: Response) => {
    const queryParams: OrderQueryParams = {
      page: Number.parseInt(req.query.page as string) || 1,
      limit: Number.parseInt(req.query.limit as string) || 20,
      state: req.query.state as OrderQueryParams['state'],
      patientName: req.query.patientName as string,
      dentistName: req.query.dentistName as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await orderService.listOrders(queryParams);
    res.status(200).json({
      status: 'success',
      ...result,
    });
  });

  /**
   * Buscar pedido por ID
   * GET /api/orders/:id
   */
  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  /**
   * Atualizar pedido
   * PUT /api/orders/:id
   */
  updateOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateOrder(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  /**
   * Deletar pedido
   * DELETE /api/orders/:id
   */
  deleteOrder = asyncHandler(async (req: Request, res: Response) => {
    await orderService.deleteOrder(req.params.id);
    res.status(204).send();
  });

  /**
   * Avançar estado do pedido
   * PATCH /api/orders/:id/advance
   */
  advanceOrderState = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.advanceOrderState(req.params.id);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  /**
   * Obter estatísticas
   * GET /api/orders/stats
   */
  getOrderStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await orderService.getOrderStats();
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });
}

export default new OrderController();
