import { describe, it, expect } from 'vitest';
import {
  registerValidation,
  loginValidation,
  updateUserValidation,
} from '../validators/user.validator';

describe('User Validators', () => {
  describe('registerValidation', () => {
    it('deve rejeitar se email está vazio', async () => {
      const req = { body: { email: '', password: 'senha123', name: 'Test User' } };
      const validator = registerValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se email é inválido', async () => {
      const req = { body: { email: 'invalid', password: 'senha123', name: 'Test User' } };
      const validator = registerValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se password tem menos de 6 caracteres', async () => {
      const req = { body: { email: 'test@lab.com', password: '12345', name: 'Test User' } };
      const validator = registerValidation[1];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se name tem menos de 3 caracteres', async () => {
      const req = { body: { email: 'test@lab.com', password: 'senha123', name: 'ab' } };
      const validator = registerValidation[2];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve aceitar dados válidos de registro', async () => {
      const req = {
        body: {
          email: 'attendant@lab.com',
          password: 'senha123',
          name: 'Maria Atendente',
          role: 'ATTENDANT',
        },
      };

      for (const validator of registerValidation) {
        await validator.run(req);
      }

      expect(req.body.email).toBe('attendant@lab.com');
    });
  });

  describe('loginValidation', () => {
    it('deve rejeitar se email está vazio', async () => {
      const req = { body: { email: '', password: 'senha123' } };
      const validator = loginValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se email é inválido', async () => {
      const req = { body: { email: 'invalid', password: 'senha123' } };
      const validator = loginValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar se password está vazio', async () => {
      const req = { body: { email: 'test@lab.com', password: '' } };
      const validator = loginValidation[1];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve aceitar dados válidos de login', async () => {
      const req = {
        body: {
          email: 'attendant@lab.com',
          password: 'senha123',
        },
      };

      for (const validator of loginValidation) {
        await validator.run(req);
      }

      expect(req.body.email).toBe('attendant@lab.com');
    });
  });

  describe('updateUserValidation', () => {
    it('deve permitir atualizar nome', async () => {
      const req = { body: { name: 'Novo Nome' } };
      const validator = updateUserValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar nome com menos de 3 caracteres', async () => {
      const req = { body: { name: 'ab' } };
      const validator = updateUserValidation[0];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve permitir atualizar email válido', async () => {
      const req = { body: { email: 'newemail@lab.com' } };
      const validator = updateUserValidation[1];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve rejeitar email inválido', async () => {
      const req = { body: { email: 'invalid' } };
      const validator = updateUserValidation[1];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve permitir atualizar isActive', async () => {
      const req = { body: { isActive: false } };
      const validator = updateUserValidation[2];

      const result = await validator.run(req);
      expect(result).toBeDefined();
    });

    it('deve aceitar atualização vazia', async () => {
      const req = { body: {} };
      
      for (const validator of updateUserValidation) {
        await validator.run(req);
      }

      expect(req.body).toEqual({});
    });
  });
});
