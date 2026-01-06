import { IOrderDocument } from '../models/Order.model';
import { Comment, OrderQueryParams, PaginatedResponse, Service } from '../types/order.types';
import { AppError } from '../../../common/middlewares/errorHandler';
import { IOrderRepository, OrderRepository } from '../repositories/order.repository';

export class OrderService {
  constructor(private readonly orderRepository: IOrderRepository = new OrderRepository()) {}

  async createOrder(userId: string, orderData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    if (!orderData.services || orderData.services.length === 0) {
      throw new AppError('Order must have at least one service', 400);
    }

    return await this.orderRepository.create({
      ...orderData,
      userId,
    });
  }

  async listOrders(
    userId: string,
    params: OrderQueryParams
  ): Promise<PaginatedResponse<IOrderDocument>> {
    return await this.orderRepository.find(userId, params);
  }

  async getOrderById(userId: string, id: string): Promise<IOrderDocument> {
    const order = await this.orderRepository.findById(userId, id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async updateOrder(
    userId: string,
    id: string,
    updateData: Partial<IOrderDocument>
  ): Promise<IOrderDocument> {
    if (updateData.state) {
      throw new AppError('Use PATCH /advance to change order state', 400);
    }

    if (updateData.services?.length === 0) {
      throw new AppError('Order must have at least one service', 400);
    }

    const order = await this.orderRepository.update(userId, id, updateData);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async deleteOrder(userId: string, id: string): Promise<void> {
    const deleted = await this.orderRepository.delete(userId, id);
    if (!deleted) {
      throw new AppError('Order not found', 404);
    }
  }

  async advanceOrderState(userId: string, id: string): Promise<IOrderDocument> {
    const order = await this.getOrderById(userId, id);

    if (!order.canAdvanceState()) {
      throw new AppError('Order is already in final state', 400);
    }

    return await order.advanceState();
  }

  async addServiceToOrder(
    userId: string,
    orderId: string,
    serviceData: Service
  ): Promise<IOrderDocument> {
    const order = await this.getOrderById(userId, orderId);

    if (!order.services) {
      order.services = [];
    }

    if (serviceData.value <= 0 || order.state === 'COMPLETED') {
      throw new AppError('Service value must be greater than zero and order must not be completed', 400);
    }

    order.services.push(serviceData);
    return await order.save();
  }

  async addCommentToOrder(
    userId: string,
    orderId: string,
    commentData: Comment
  ): Promise<IOrderDocument> {
    const order = await this.getOrderById(userId, orderId);

    order.comments = order.comments || [];
    order.comments.push(commentData);
    return await order.save();
  }
}

export default new OrderService();
