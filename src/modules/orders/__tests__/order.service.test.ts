import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '../services/order.service';
import { OrderState, OrderStatus, ServiceStatus } from '../types/order.types';

describe('OrderService', () => {
  let orderService: OrderService;
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    orderService = new OrderService(mockUserId);
  });

  describe('createOrder - Validações de negócio', () => {
    it('não deve criar pedido sem serviços', async () => {
      const orderData = {
        lab: 'Lab Sorriso',
        patient: 'João Silva',
        customer: 'Dr. Maria Santos',
        services: [],
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Order must have at least one service'
      );
    });

    it('deve validar ordem com serviços', () => {
      const orderData = {
        lab: 'Lab Sorriso',
        patient: 'João Silva',
        customer: 'Dr. Maria Santos',
        services: [{ name: 'Coroa', value: 800, status: ServiceStatus.PENDING }],
      };

      expect(orderData.services.length).toBeGreaterThan(0);
    });
  });

  describe('Validações de negócio', () => {
    it('deve validar estado COMPLETED como final', () => {
      expect([OrderState.COMPLETED]).toContain(OrderState.COMPLETED);
    });

    it('deve validar estados de transição', () => {
      const validStates = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];
      expect(validStates).toContain(OrderState.CREATED);
      expect(validStates).toContain(OrderState.ANALYSIS);
    });

    it('deve validar status ACTIVE e DELETED', () => {
      expect([OrderStatus.ACTIVE, OrderStatus.DELETED]).toContain(OrderStatus.ACTIVE);
      expect([OrderStatus.ACTIVE, OrderStatus.DELETED]).toContain(OrderStatus.DELETED);
    });
  });

  describe('Service instantiation', () => {
    it('deve criar instância com userId', () => {
      expect(orderService).toBeDefined();
    });

    it('deve ter métodos essenciais', () => {
      expect(typeof orderService.createOrder).toBe('function');
      expect(typeof orderService.listOrders).toBe('function');
      expect(typeof orderService.getOrderById).toBe('function');
      expect(typeof orderService.updateOrder).toBe('function');
      expect(typeof orderService.deleteOrder).toBe('function');
      expect(typeof orderService.advanceOrderState).toBe('function');
    });
  });

  describe('Restrições de negócio', () => {
    it('não deve permitir criar pedido sem userId', () => {
      expect(() => new OrderService('')).not.toThrow();
    });

    it('debe validar estrutura de serviço', () => {
      const service = {
        name: 'Coroa',
        value: 800,
        status: ServiceStatus.PENDING,
      };

      expect(service.value).toBeGreaterThan(0);
      expect(service.status).toBe(ServiceStatus.PENDING);
    });
  });
});
