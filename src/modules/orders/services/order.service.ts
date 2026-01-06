import { IOrderDocument } from '../models/Order.model';
import { Comment, OrderQueryParams, PaginatedResponse, Service } from '../types/order.types';
import { AppError } from '../../../common/middlewares/errorHandler';
import { IOrderRepository, OrderRepository } from '../repositories/order.repository';

export class OrderService {
  private readonly orderRepository: IOrderRepository;

  constructor(userId: string) {
    this.orderRepository = new OrderRepository(userId);
  }

  async createOrder(orderData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    if (!orderData.services || orderData.services.length === 0) {
      throw new AppError('Order must have at least one service', 400);
    }

    return await this.orderRepository.create(orderData);
  }

  async listOrders(params: OrderQueryParams): Promise<PaginatedResponse<IOrderDocument>> {
    return await this.orderRepository.find(params);
  }

  async getOrderById(id: string): Promise<IOrderDocument> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  async updateOrder(id: string, updateData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    if (updateData.state) {
      throw new AppError('Use PATCH /advance to change order state', 400);
    }

    if (updateData.services?.length === 0) {
      throw new AppError('Order must have at least one service', 400);
    }

    const order = await this.orderRepository.update(id, updateData);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    const deleted = await this.orderRepository.delete(id);
    if (!deleted) {
      throw new AppError('Order not found', 404);
    }
  }

  async advanceOrderState(id: string): Promise<IOrderDocument> {
    const order = await this.getOrderById(id);

    if (!order.canAdvanceState()) {
      throw new AppError('Order is already in final state', 400);
    }

    return await order.advanceState();
  }

  async addServiceToOrder(orderId: string, serviceData: Service): Promise<IOrderDocument> {
    const order = await this.getOrderById(orderId);

    if (!order.services) {
      order.services = [];
    }

    if (serviceData.value <= 0 || order.state === 'COMPLETED') {
      throw new AppError('Service value must be greater than zero and order must not be completed', 400);
    }

    order.services.push(serviceData);
    return await order.save();
  }

  async addCommentToOrder(orderId: string, commentData: Comment): Promise<IOrderDocument> {
    const order = await this.getOrderById(orderId);

    order.comments = order.comments || [];
    order.comments.push(commentData);
    return await order.save();
  }
}

export default OrderService;
