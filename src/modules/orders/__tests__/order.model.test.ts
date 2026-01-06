import { describe, it, expect } from 'vitest';
import { Order } from '../models/Order.model';
import { OrderState, OrderStatus } from '../types/order.types';
import mongoose from 'mongoose';

describe('Order Model', () => {
  describe('Schema validation', () => {
    it('deve validar campos obrigatórios', async () => {
      const invalidOrder = new Order({});
      const error = invalidOrder.validateSync();

      expect(error).toBeDefined();
      expect(error?.errors.lab).toBeDefined();
      expect(error?.errors.patient).toBeDefined();
      expect(error?.errors.customer).toBeDefined();
      expect(error?.errors.services).toBeDefined();
      expect(error?.errors.userId).toBeDefined();
    });

    it('deve validar que services é um array com pelo menos 1 item', async () => {
      const invalidOrder = new Order({
        lab: 'Lab Sorriso',
        patient: 'João',
        customer: 'Dr. Maria',
        userId: new mongoose.Types.ObjectId(),
        services: [],
      });
      const error = invalidOrder.validateSync();

      expect(error?.errors.services).toBeDefined();
    });

    it('deve criar pedido com dados válidos', () => {
      const validOrder = new Order({
        lab: 'Lab Sorriso',
        patient: 'João Silva',
        customer: 'Dr. Maria Santos',
        userId: new mongoose.Types.ObjectId(),
        services: [
          { name: 'Coroa', value: 800, status: 'PENDING' },
        ],
      });
      const error = validOrder.validateSync();

      expect(error).toBeUndefined();
      expect(validOrder.state).toBe(OrderState.CREATED);
      expect(validOrder.status).toBe(OrderStatus.ACTIVE);
    });
  });

  describe('Methods', () => {
    it('deve verificar se pode avançar estado (CREATED -> ANALYSIS)', () => {
      const order = new Order({
        lab: 'Lab',
        patient: 'João',
        customer: 'Dr.',
        userId: new mongoose.Types.ObjectId(),
        services: [{ name: 'Serviço', value: 100 }],
        state: OrderState.CREATED,
      });

      expect(order.canAdvanceState()).toBe(true);
    });

    it('deve verificar se pode avançar estado (ANALYSIS -> COMPLETED)', () => {
      const order = new Order({
        lab: 'Lab',
        patient: 'João',
        customer: 'Dr.',
        userId: new mongoose.Types.ObjectId(),
        services: [{ name: 'Serviço', value: 100 }],
        state: OrderState.ANALYSIS,
      });

      expect(order.canAdvanceState()).toBe(true);
    });

    it('não deve avançar estado se já estiver COMPLETED', () => {
      const order = new Order({
        lab: 'Lab',
        patient: 'João',
        customer: 'Dr.',
        userId: new mongoose.Types.ObjectId(),
        services: [{ name: 'Serviço', value: 100 }],
        state: OrderState.COMPLETED,
      });

      expect(order.canAdvanceState()).toBe(false);
    });
  });

  describe('Defaults', () => {
    it('deve ter estado inicial CREATED', () => {
      const order = new Order({
        lab: 'Lab',
        patient: 'João',
        customer: 'Dr.',
        userId: new mongoose.Types.ObjectId(),
        services: [{ name: 'Serviço', value: 100 }],
      });

      expect(order.state).toBe(OrderState.CREATED);
    });

    it('deve ter status inicial ACTIVE', () => {
      const order = new Order({
        lab: 'Lab',
        patient: 'João',
        customer: 'Dr.',
        userId: new mongoose.Types.ObjectId(),
        services: [{ name: 'Serviço', value: 100 }],
      });

      expect(order.status).toBe(OrderStatus.ACTIVE);
    });
  });

  describe('Service validation', () => {
    it('deve validar que service.value é maior que 0', () => {
      const invalidOrder = new Order({
        lab: 'Lab',
        patient: 'João',
        customer: 'Dr.',
        userId: new mongoose.Types.ObjectId(),
        services: [{ name: 'Serviço', value: 0 }],
      });
      const error = invalidOrder.validateSync();

      expect(error?.errors['services.0.value']).toBeDefined();
    });

    it('deve aceitar service.value decimal', () => {
      const validOrder = new Order({
        lab: 'Lab',
        patient: 'João',
        customer: 'Dr.',
        userId: new mongoose.Types.ObjectId(),
        services: [{ name: 'Serviço', value: 99.99 }],
      });
      const error = validOrder.validateSync();

      expect(error).toBeUndefined();
    });
  });
});
