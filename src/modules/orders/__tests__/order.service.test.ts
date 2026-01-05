import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '../services/order.service';
import { Order } from '../models/Order.model';
import { OrderState, OrderStatus, ServiceStatus } from '../types/order.types';

vi.mock('../models/Order.model');

describe('OrderService', () => {
  let orderService: OrderService;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    orderService = new OrderService();
    vi.clearAllMocks();
  });

  describe('createOrder - Validações de negócio', () => {
    it('não deve criar pedido sem serviços', async () => {
      const orderData = {
        lab: 'Lab Sorriso',
        patient: 'João Silva',
        customer: 'Dr. Maria Santos',
        services: [],
      };

      await expect(orderService.createOrder(mockUserId, orderData)).rejects.toThrow(
        'Order must have at least one service'
      );
    });

    it('deve criar pedido válido com serviços', async () => {
      const orderData = {
        lab: 'Lab Sorriso',
        patient: 'João Silva',
        customer: 'Dr. Maria Santos',
        services: [
          { name: 'Coroa', value: 800, status: ServiceStatus.PENDING },
        ],
      };

      const mockOrder = {
        ...orderData,
        userId: mockUserId,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        save: vi.fn().mockResolvedValue({ _id: '123', ...orderData }),
      };

      vi.mocked(Order.findOne).mockResolvedValue(null);
      vi.mocked(Order).mockImplementation(() => mockOrder as any);

      const result = await orderService.createOrder(mockUserId, orderData);

      expect(result).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('deve permitir criar múltiplos pedidos com mesmos detalhes', async () => {
      const orderData = {
        lab: 'Lab Sorriso',
        patient: 'João Silva',
        customer: 'Dr. Maria Santos',
        services: [
          { name: 'Coroa', value: 800, status: ServiceStatus.PENDING },
        ],
      };

      const mockOrder = {
        ...orderData,
        userId: mockUserId,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
        save: vi.fn().mockResolvedValue({ _id: '123', ...orderData }),
      };

      vi.mocked(Order).mockImplementation(() => mockOrder as any);

      const result = await orderService.createOrder(mockUserId, orderData);

      expect(result).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });

  describe('listOrders', () => {
    it('deve listar pedidos do usuário com paginação', async () => {
      const mockOrders = [
        { _id: '1', patient: 'João Silva', state: OrderState.CREATED },
        { _id: '2', patient: 'Ana Costa', state: OrderState.ANALYSIS },
      ];

      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockOrders),
      };

      vi.mocked(Order.find).mockReturnValue(mockQuery as any);
      vi.mocked(Order.countDocuments).mockResolvedValue(2);

      const result = await orderService.listOrders(mockUserId, { page: 1, limit: 20 });

      expect(result.data).toEqual(mockOrders);
      expect(result.pagination.total).toBe(2);
      expect(Order.find).toHaveBeenCalledWith({ userId: mockUserId });
    });

    it('deve filtrar pedidos por state', async () => {
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(Order.find).mockReturnValue(mockQuery as any);
      vi.mocked(Order.countDocuments).mockResolvedValue(0);

      await orderService.listOrders(mockUserId, { state: OrderState.ANALYSIS });

      expect(Order.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          state: OrderState.ANALYSIS,
        })
      );
    });
  });

  describe('Transição de estados', () => {
    it('deve avançar de CREATED para ANALYSIS', async () => {
      const mockOrder = {
        _id: '123',
        state: OrderState.CREATED,
        canAdvanceState: vi.fn().mockReturnValue(true),
        advanceState: vi.fn().mockResolvedValue({
          _id: '123',
          state: OrderState.ANALYSIS,
        }),
      };

      vi.mocked(Order.findOne).mockResolvedValue(mockOrder as any);

      await orderService.advanceOrderState(mockUserId, '123');

      expect(mockOrder.canAdvanceState).toHaveBeenCalled();
      expect(mockOrder.advanceState).toHaveBeenCalled();
    });

    it('não deve avançar do estado COMPLETED', async () => {
      const mockOrder = {
        _id: '123',
        state: OrderState.COMPLETED,
        canAdvanceState: vi.fn().mockReturnValue(false),
      };

      vi.mocked(Order.findOne).mockResolvedValue(mockOrder as any);

      await expect(orderService.advanceOrderState(mockUserId, '123')).rejects.toThrow(
        'Order is already in final state'
      );
    });
  });

  describe('updateOrder', () => {
    it('não deve permitir alterar state via update', async () => {
      await expect(
        orderService.updateOrder(mockUserId, '123', { state: OrderState.COMPLETED } as any)
      ).rejects.toThrow('Use PATCH /advance to change order state');
    });

    it('não deve permitir update sem serviços', async () => {
      await expect(
        orderService.updateOrder(mockUserId, '123', { services: [] } as any)
      ).rejects.toThrow('Order must have at least one service');
    });

    it('deve atualizar campos permitidos', async () => {
      const mockUpdatedOrder = {
        _id: '123',
        customer: 'Dr. João Updated',
      };

      vi.mocked(Order.findOneAndUpdate).mockResolvedValue(mockUpdatedOrder as any);

      const result = await orderService.updateOrder(mockUserId, '123', {
        customer: 'Dr. João Updated',
      });

      expect(result).toEqual(mockUpdatedOrder);
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: '123', userId: mockUserId },
        { customer: 'Dr. João Updated' },
        { new: true, runValidators: true }
      );
    });
  });

  describe('deleteOrder', () => {
    it('deve deletar pedido do usuário', async () => {
      const mockOrder = { _id: '123' };

      vi.mocked(Order.findOneAndDelete).mockResolvedValue(mockOrder as any);

      await orderService.deleteOrder(mockUserId, '123');

      expect(Order.findOneAndDelete).toHaveBeenCalledWith({ _id: '123', userId: mockUserId });
    });

    it('deve lançar erro se pedido não existir', async () => {
      vi.mocked(Order.findOneAndDelete).mockResolvedValue(null);

      await expect(orderService.deleteOrder(mockUserId, '999')).rejects.toThrow('Order not found');
    });
  });

  describe('getOrderStats', () => {
    it('deve retornar estatísticas dos pedidos do usuário', async () => {
      const mockStats = [
        { _id: OrderState.CREATED, count: 5 },
        { _id: OrderState.ANALYSIS, count: 3 },
        { _id: OrderState.COMPLETED, count: 2 },
      ];

      vi.mocked(Order.aggregate).mockResolvedValue(mockStats as any);

      const result = await orderService.getOrderStats(mockUserId);

      expect(result).toEqual(mockStats);
      expect(Order.aggregate).toHaveBeenCalled();
    });
  });
});
