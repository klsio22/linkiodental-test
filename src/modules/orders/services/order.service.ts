import { Order, IOrderDocument } from '../models/Order.model';
import { Comment, OrderQueryParams, PaginatedResponse, Service } from '../types/order.types';
import { AppError } from '../../../common/middlewares/errorHandler';
import mongoose from 'mongoose';

export class OrderService {
  async createOrder(userId: string, orderData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    if (!orderData.services || orderData.services.length === 0) {
      throw new AppError('Order must have at least one service', 400);
    }

    const order = new Order({
      ...orderData,
      userId,
    });
    return await order.save();
  }

  async listOrders(
    userId: string,
    params: OrderQueryParams
  ): Promise<PaginatedResponse<IOrderDocument>> {
    const {
      page = 1,
      limit = 20,
      state,
      status,
      patientName,
      dentistName,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    // Build filters
    const filter: Record<string, unknown> = { userId };
    if (state) filter.state = state;
    if (status) filter.status = status;
    if (patientName) filter.patient = new RegExp(patientName, 'i');
    if (dentistName) filter.customer = new RegExp(dentistName, 'i');

    // Sort
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      Order.countDocuments(filter),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(userId: string, id: string): Promise<IOrderDocument> {
    const order = await Order.findOne({ _id: id, userId });
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

    const order = await Order.findOneAndUpdate({ _id: id, userId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async deleteOrder(userId: string, id: string): Promise<void> {
    const order = await Order.findOneAndDelete({ _id: id, userId });
    if (!order) {
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

  async getOrderStats(userId: string) {
    const stats = await Order.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
        },
      },
    ]);

    return stats;
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

    if (serviceData.value <= 0 || order.state === "COMPLETED") {
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
