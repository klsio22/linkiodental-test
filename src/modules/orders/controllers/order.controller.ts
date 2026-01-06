import { Request, Response } from 'express';
import orderService from '../services/order.service';
import { asyncHandler } from '../../../common/middlewares/errorHandler';
import { OrderQueryParams } from '../types/order.types';

export class OrderController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const order = await orderService.createOrder(userId, req.body);
    res.status(201).json({
      status: 'success',
      data: order,
    });
  });

  listOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const queryParams: OrderQueryParams = {
      page: Number.parseInt(req.query.page as string) || 1,
      limit: Number.parseInt(req.query.limit as string) || 20,
      state: req.query.state as OrderQueryParams['state'],
      status: req.query.status as OrderQueryParams['status'],
      patientName: req.query.patientName as string,
      dentistName: req.query.dentistName as string,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    };

    const result = await orderService.listOrders(userId, queryParams);
    res.status(200).json({
      status: 'success',
      ...result,
    });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const order = await orderService.getOrderById(userId, req.params.id);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  getOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const order = await orderService.getOrderById(userId, req.params.id);
    res.status(200).json({
      status: 'success',
      data: { status: order.status, state: order.state },
    });
  });

  updateOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const order = await orderService.updateOrder(userId, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  deleteOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    await orderService.deleteOrder(userId, req.params.id);
    res.status(204).send();
  });

  advanceOrderState = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const order = await orderService.advanceOrderState(userId, req.params.id);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  getOrderStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const stats = await orderService.getOrderStats(userId);
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });

  updateOrderAddService = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const order = await orderService.addServiceToOrder(userId, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });
}

export default new OrderController();
