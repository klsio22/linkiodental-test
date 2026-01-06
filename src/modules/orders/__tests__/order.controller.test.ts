import { describe, it, expect, beforeEach } from 'vitest';
import { OrderController } from '../controllers/order.controller';

describe('OrderController', () => {
  let orderController: OrderController;

  describe('Instantiation', () => {
    it('deve criar instância do OrderController', () => {
      orderController = new OrderController();
      expect(orderController).toBeDefined();
    });
  });

  describe('Methods existence', () => {
    beforeEach(() => {
      orderController = new OrderController();
    });

    it('deve ter método createOrder', () => {
      expect(orderController.createOrder).toBeDefined();
      expect(typeof orderController.createOrder).toBe('function');
    });

    it('deve ter método listOrders', () => {
      expect(orderController.listOrders).toBeDefined();
      expect(typeof orderController.listOrders).toBe('function');
    });

    it('deve ter método getOrderById', () => {
      expect(orderController.getOrderById).toBeDefined();
      expect(typeof orderController.getOrderById).toBe('function');
    });

    it('deve ter método getOrderStatus', () => {
      expect(orderController.getOrderStatus).toBeDefined();
      expect(typeof orderController.getOrderStatus).toBe('function');
    });

    it('deve ter método updateOrder', () => {
      expect(orderController.updateOrder).toBeDefined();
      expect(typeof orderController.updateOrder).toBe('function');
    });

    it('deve ter método deleteOrder', () => {
      expect(orderController.deleteOrder).toBeDefined();
      expect(typeof orderController.deleteOrder).toBe('function');
    });

    it('deve ter método advanceOrderState', () => {
      expect(orderController.advanceOrderState).toBeDefined();
      expect(typeof orderController.advanceOrderState).toBe('function');
    });
  });
});
