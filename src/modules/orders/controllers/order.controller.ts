import { Response } from 'express';
import orderService from '../services/order.service';
import { asyncHandler } from '../../../common/middlewares/errorHandler';
import { OrderQueryParams } from '../types/order.types';
import { AuthRequest } from '../../../common/middlewares/auth';

export class OrderController {
  createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const order = await orderService.createOrder(userId, req.body);
    res.status(201).json({
      status: 'success',
      data: order,
    });
  });

  listOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
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

  getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const order = await orderService.getOrderById(userId, req.params.id);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  getOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const order = await orderService.getOrderById(userId, req.params.id);
    res.status(200).json({
      status: 'success',
      data: { status: order.status, state: order.state },
    });
  });

  updateOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const order = await orderService.updateOrder(userId, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  deleteOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    await orderService.deleteOrder(userId, req.params.id);
    res.status(204).send();
  });

  advanceOrderState = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const order = await orderService.advanceOrderState(userId, req.params.id);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  updateOrderAddService = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const order = await orderService.addServiceToOrder(userId, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });

  addCommentToOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id as string;
    const order = await orderService.addCommentToOrder(userId, req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: order,
    });
  });
}

export default new OrderController();
