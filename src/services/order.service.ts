import { Order, IOrderDocument } from '../models/Order.model';
import { OrderQueryParams, PaginatedResponse } from '../types/order.types';
import { AppError } from '../middlewares/errorHandler';

export class OrderService {
  /**
   * Criar novo pedido
   */
  async createOrder(orderData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    // Validações de negócio
    if (!orderData.services || orderData.services.length === 0) {
      throw new AppError('Pedido deve ter pelo menos um serviço', 400);
    }

    if (!orderData.totalValue || orderData.totalValue <= 0) {
      throw new AppError('Valor total deve ser maior que zero', 400);
    }

    const order = new Order(orderData);
    return await order.save();
  }

  /**
   * Listar pedidos com paginação e filtros
   */
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

    // Paginação
    const skip = (page - 1) * limit;

    // Executar queries em paralelo
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

  /**
   * Buscar pedido por ID
   */
  async getOrderById(id: string): Promise<IOrderDocument> {
    const order = await Order.findById(id);
    if (!order) {
      throw new AppError('Pedido não encontrado', 404);
    }
    return order;
  }

  /**
   * Atualizar pedido
   */
  async updateOrder(id: string, updateData: Partial<IOrderDocument>): Promise<IOrderDocument> {
    // Não permitir atualização direta do estado
    if (updateData.state) {
      throw new AppError(
        'Use o endpoint /advance para alterar o estado do pedido',
        400
      );
    }

    // Validações de negócio
    if (updateData.services?.length === 0) {
      throw new AppError('Pedido deve ter pelo menos um serviço', 400);
    }

    if (updateData.totalValue !== undefined && updateData.totalValue <= 0) {
      throw new AppError('Valor total deve ser maior que zero', 400);
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!order) {
      throw new AppError('Pedido não encontrado', 404);
    }

    return order;
  }

  /**
   * Deletar pedido
   */
  async deleteOrder(id: string): Promise<void> {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      throw new AppError('Pedido não encontrado', 404);
    }
  }

  /**
   * Avançar estado do pedido
   */
  async advanceOrderState(id: string): Promise<IOrderDocument> {
    const order = await this.getOrderById(id);

    if (!order.canAdvanceState()) {
      throw new AppError('Pedido já está no estado final', 400);
    }

    return await order.advanceState();
  }

  /**
   * Obter estatísticas de pedidos
   */
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
