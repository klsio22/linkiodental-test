import { Order, IOrderDocument } from '../models/Order.model';
import { OrderQueryParams, PaginatedResponse } from '../types/order.types';

export interface IOrderRepository {
  create(orderData: Partial<IOrderDocument>): Promise<IOrderDocument>;
  findById(orderId: string): Promise<IOrderDocument | null>;
  find(params: OrderQueryParams): Promise<PaginatedResponse<IOrderDocument>>;
  update(orderId: string, updateData: Partial<IOrderDocument>): Promise<IOrderDocument | null>;
  delete(orderId: string): Promise<boolean>;
}

export class OrderRepository implements IOrderRepository {
  private readonly userId: string;

  constructor(userId: string, private readonly orderModel = Order) {
    this.userId = userId;
  }

  async create(orderData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    const order = new this.orderModel(orderData);
    return await order.save();
  }

  async findById(orderId: string): Promise<IOrderDocument | null> {
    return await this.orderModel.findOne({ _id: orderId, userId: this.userId });
  }

  async find(params: OrderQueryParams): Promise<PaginatedResponse<IOrderDocument>> {
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

    const filter: Record<string, unknown> = { userId: this.userId };
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

  async update(orderId: string, updateData: Partial<IOrderDocument>): Promise<IOrderDocument | null> {
    return await this.orderModel.findOneAndUpdate({ _id: orderId, userId: this.userId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(orderId: string): Promise<boolean> {
    const result = await this.orderModel.findOneAndDelete({ _id: orderId, userId: this.userId });
    return !!result;
  }
}

export default function createOrderRepository(userId: string) {
  return new OrderRepository(userId);
}
