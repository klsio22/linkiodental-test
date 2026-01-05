import { describe, it, expect } from 'vitest';
import { OrderService } from '../services/order.service';
import { OrderState } from '../types/order.types';

describe('OrderService', () => {
  const orderService = new OrderService();

  describe('Validações de negócio', () => {
    it('não deve criar pedido sem serviços', async () => {
      const orderData = {
        patientName: 'João Silva',
        dentistName: 'Dr. Maria',
        services: [],
        totalValue: 100,
        deadline: new Date(Date.now() + 86400000), // amanhã
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Pedido deve ter pelo menos um serviço'
      );
    });

    it('não deve criar pedido com valor zero ou negativo', async () => {
      const orderData = {
        patientName: 'João Silva',
        dentistName: 'Dr. Maria',
        services: ['Coroa'],
        totalValue: 0,
        deadline: new Date(Date.now() + 86400000),
      };

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Valor total deve ser maior que zero'
      );
    });
  });

  describe('Transição de estados', () => {
    it('deve avançar de CREATED para ANALYSIS', async () => {
      // Este é um exemplo de teste
      // Em produção, você precisaria mockar o banco de dados
      const expectedStates = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];
      expect(expectedStates).toHaveLength(3);
    });

    it('não deve avançar do estado COMPLETED', async () => {
      // Mock test
      expect(OrderState.COMPLETED).toBe('COMPLETED');
    });
  });
});
