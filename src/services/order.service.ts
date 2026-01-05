import { Order, IOrderDocument } from '../models/Order.model';
import { OrderQueryParams, PaginatedResponse } from '../types/order.types';
import { AppError } from '../middlewares/errorHandler';

export class OrderService {
  async createOrder(orderData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    if (!orderData.services || orderData.services.length === 0) {
      throw new AppError('Order must have at least one service', 400);
    }

    if (!orderData.totalValue || orderData.totalValue <= 0) {
      throw new AppError('Total value must be greater than zero', 400);
    }

    const order = new Order(orderData);
    return await order.save();
  }

  async listOrders(params: OrderQueryParams): Promise<PaginatedResponse<IOrderDocument>> {
    const {
      page = 1,
      limit = 20,
      state,
      patientName,
      dentistName,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    // Construir filtros
    const filter: Record<string, unknown> = {};
    if (state) filter.state = state;
    if (patientName) filter.patientName = new RegExp(patientName, 'i');
    if (dentistName) filter.dentistName = new RegExp(dentistName, 'i');

    // Ordenação
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

  async getOrderById(id: string): Promise<IOrderDocument> {
    const order = await Order.findById(id);
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

    if (updateData.totalValue !== undefined && updateData.totalValue <= 0) {
      throw new AppError('Total value must be greater than zero', 400);
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
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

  async getOrderStats() {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' },
        },
      },
    ]);

    return stats;
  }
}

export default new OrderService();
