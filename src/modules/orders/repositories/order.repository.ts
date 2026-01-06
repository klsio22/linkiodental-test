import { Order, IOrderDocument } from '../models/Order.model';
import { OrderQueryParams, PaginatedResponse } from '../types/order.types';

export interface IOrderRepository {
  create(orderData: Partial<IOrderDocument>): Promise<IOrderDocument>;
  findById(userId: string, orderId: string): Promise<IOrderDocument | null>;
  find(userId: string, params: OrderQueryParams): Promise<PaginatedResponse<IOrderDocument>>;
  update(userId: string, orderId: string, updateData: Partial<IOrderDocument>): Promise<IOrderDocument | null>;
  delete(userId: string, orderId: string): Promise<boolean>;
}

export class OrderRepository implements IOrderRepository {
  constructor(private readonly orderModel = Order) {}

  async create(orderData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    const order = new this.orderModel(orderData);
    return await order.save();
  }

  async findById(userId: string, orderId: string): Promise<IOrderDocument | null> {
    return await this.orderModel.findOne({ _id: orderId, userId });
  }

  async find(userId: string, params: OrderQueryParams): Promise<PaginatedResponse<IOrderDocument>> {
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

    const filter: Record<string, unknown> = { userId };
    if (state) filter.state = state;
    if (status) filter.status = status;
    if (patientName) filter.patient = new RegExp(patientName, 'i');
    if (dentistName) filter.customer = new RegExp(dentistName, 'i');

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter),
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

  async update(userId: string, orderId: string, updateData: Partial<IOrderDocument>): Promise<IOrderDocument | null> {
    return await this.orderModel.findOneAndUpdate({ _id: orderId, userId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(userId: string, orderId: string): Promise<boolean> {
    const result = await this.orderModel.findOneAndDelete({ _id: orderId, userId });
    return !!result;
  }
}

export default new OrderRepository();
