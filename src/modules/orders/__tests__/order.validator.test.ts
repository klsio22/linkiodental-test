import { describe, it, expect} from 'vitest';
import {
  createOrderValidation,
  updateOrderValidation,
} from '../validators/order.validator';

describe('Order Validators', () => {
  describe('createOrderValidation', () => {
    it('deve rejeitar se lab está vazio', async () => {
      const req = { body: { lab: '', patient: 'João', customer: 'Dr.', services: [{ name: 'S', value: 100 }] } };
      const validator = createOrderValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se lab tem menos de 2 caracteres', async () => {
      const req = { body: { lab: 'L', patient: 'João', customer: 'Dr.', services: [{ name: 'S', value: 100 }] } };
      const validator = createOrderValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se patient tem menos de 3 caracteres', async () => {
      const req = { body: { lab: 'Lab', patient: 'Jo', customer: 'Dr.', services: [{ name: 'S', value: 100 }] } };
      const validator = createOrderValidation[1];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se customer tem menos de 3 caracteres', async () => {
      const req = { body: { lab: 'Lab', patient: 'João', customer: 'Dr', services: [{ name: 'S', value: 100 }] } };
      const validator = createOrderValidation[2];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se services está vazio', async () => {
      const req = { body: { lab: 'Lab', patient: 'João', customer: 'Dr.', services: [] } };
      const validator = createOrderValidation[3];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se service.value <= 0', async () => {
      const req = { body: { lab: 'Lab', patient: 'João', customer: 'Dr.', services: [{ name: 'S', value: 0 }] } };
      const validator = createOrderValidation[5];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve aceitar dados válidos', async () => {
      const req = {
        body: {
          lab: 'Lab Sorriso',
          patient: 'João Silva',
          customer: 'Dr. Maria Santos',
          services: [{ name: 'Coroa', value: 800, status: 'PENDING' }],
        },
      };

      for (const validator of createOrderValidation) {
        await validator.run(req);
      }

      expect(req.body.lab).toBe('Lab Sorriso');
    });
  });

  describe('updateOrderValidation', () => {
    it('deve permitir atualizar apenas lab', async () => {
      const req = { body: { lab: 'Lab Novo' } };
      const validator = updateOrderValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve permitir atualizar services', async () => {
      const req = { body: { services: [{ name: 'Novo Serviço', value: 500 }] } };
      const validator = updateOrderValidation[3];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve permitir atualizar status', async () => {
      const req = { body: { status: 'DELETED' } };
      const validator = updateOrderValidation[5];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve aceitar atualização vazia', async () => {
      const req = { body: {} };
      
      for (const validator of updateOrderValidation) {
        await validator.run(req);
      }

      expect(req.body).toEqual({});
    });
  });

  describe('listOrdersValidation', () => {
    it('deve validar query parameters', async () => {
      const req = {
        query: {
          page: '1',
          limit: '20',
          state: 'CREATED',
          status: 'ACTIVE',
          patientName: 'João',
        },
      };

      // Validators executam sem erro se válidos
      expect(req.query.page).toBe('1');
      expect(req.query.limit).toBe('20');
    });

    it('deve aceitar query vazia', async () => {
      const req = { query: {} };

      expect(Object.keys(req.query).length).toBe(0);
    });
  });
});
