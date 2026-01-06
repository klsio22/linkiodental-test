import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrderService } from '../services/order.service';
import { IOrderRepository } from '../repositories/order.repository';
import { OrderState, OrderStatus, ServiceStatus } from '../types/order.types';

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepository: Partial<IOrderRepository>;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    mockOrderRepository = {
      create: vi.fn(),
      find: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    orderService = new OrderService(mockOrderRepository as IOrderRepository);
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
        services: [{ name: 'Coroa', value: 800, status: ServiceStatus.PENDING }],
      };

      const mockOrder = {
        _id: '123',
        ...orderData,
        userId: mockUserId,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      };

      vi.mocked(mockOrderRepository.create!).mockResolvedValue(mockOrder as any);

      const result = await orderService.createOrder(mockUserId, orderData);

      expect(result).toBeDefined();
      expect(result._id).toBe('123');
      expect(mockOrderRepository.create!).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
        })
      );
    });

    it('deve permitir criar múltiplos pedidos com mesmos detalhes', async () => {
      const orderData = {
        lab: 'Lab Sorriso',
        patient: 'João Silva',
        customer: 'Dr. Maria Santos',
        services: [{ name: 'Coroa', value: 800, status: ServiceStatus.PENDING }],
      };

      const mockOrder = {
        _id: '456',
        ...orderData,
        userId: mockUserId,
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      };

      vi.mocked(mockOrderRepository.create!).mockResolvedValue(mockOrder as any);

      const result = await orderService.createOrder(mockUserId, orderData);

      expect(result).toBeDefined();
      expect(result._id).toBe('456');
    });
  });

  describe('listOrders', () => {
    it('deve listar pedidos do usuário com paginação', async () => {
      const mockOrders = [
        { _id: '1', patient: 'João Silva', state: OrderState.CREATED },
        { _id: '2', patient: 'Ana Costa', state: OrderState.ANALYSIS },
      ];

      const mockResult = {
        data: mockOrders,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };

      vi.mocked(mockOrderRepository.find!).mockResolvedValue(mockResult as any);

      const result = await orderService.listOrders(mockUserId, { page: 1, limit: 20 });

      expect(result.data).toEqual(mockOrders);
      expect(result.pagination.total).toBe(2);
      expect(mockOrderRepository.find!).toHaveBeenCalledWith(mockUserId, { page: 1, limit: 20 });
    });

    it('deve filtrar pedidos por state', async () => {
      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      vi.mocked(mockOrderRepository.find!).mockResolvedValue(mockResult as any);

      await orderService.listOrders(mockUserId, { state: OrderState.ANALYSIS });

      expect(mockOrderRepository.find!).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          state: OrderState.ANALYSIS,
        })
      );
    });
  });

  describe('getOrderById', () => {
    it('deve retornar pedido pelo ID', async () => {
      const mockOrder = {
        _id: '123',
        patient: 'João Silva',
        state: OrderState.CREATED,
      };

      vi.mocked(mockOrderRepository.findById!).mockResolvedValue(mockOrder as any);

      const result = await orderService.getOrderById(mockUserId, '123');

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findById!).toHaveBeenCalledWith(mockUserId, '123');
    });

    it('deve lançar erro se pedido não existir', async () => {
      vi.mocked(mockOrderRepository.findById!).mockResolvedValue(null);

      await expect(orderService.getOrderById(mockUserId, '999')).rejects.toThrow('Order not found');
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

      vi.mocked(mockOrderRepository.findById!).mockResolvedValue(mockOrder as any);

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

      vi.mocked(mockOrderRepository.findById!).mockResolvedValue(mockOrder as any);

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

      vi.mocked(mockOrderRepository.update!).mockResolvedValue(mockUpdatedOrder as any);

      const result = await orderService.updateOrder(mockUserId, '123', {
        customer: 'Dr. João Updated',
      });

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockOrderRepository.update!).toHaveBeenCalledWith(
        mockUserId,
        '123',
        { customer: 'Dr. João Updated' }
      );
    });
  });

  describe('deleteOrder', () => {
    it('deve deletar pedido do usuário', async () => {
      vi.mocked(mockOrderRepository.delete!).mockResolvedValue(true);

      await orderService.deleteOrder(mockUserId, '123');

      expect(mockOrderRepository.delete!).toHaveBeenCalledWith(mockUserId, '123');
    });

    it('deve lançar erro se pedido não existir', async () => {
      vi.mocked(mockOrderRepository.delete!).mockResolvedValue(false);

      await expect(orderService.deleteOrder(mockUserId, '999')).rejects.toThrow('Order not found');
    });
  });
});
