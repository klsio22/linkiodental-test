import { describe, it, expect } from 'vitest';
import { User } from '../models/User.model';
import { UserRole } from '../types/user.types';

describe('User Model', () => {
  describe('Schema validation', () => {
    it('deve validar campos obrigatórios', async () => {
      const invalidUser = new User({});
      const error = invalidUser.validateSync();

      expect(error).toBeDefined();
      expect(error?.errors.email).toBeDefined();
      expect(error?.errors.password).toBeDefined();
      expect(error?.errors.name).toBeDefined();
    });

    it('deve validar formato de email', async () => {
      const invalidUser = new User({
        email: 'invalid-email',
        password: 'senha123',
        name: 'Test User',
      });
      const error = invalidUser.validateSync();

      expect(error?.errors.email).toBeDefined();
    });

    it('deve validar que name tem mínimo 3 caracteres', async () => {
      const invalidUser = new User({
        email: 'test@lab.com',
        password: 'senha123',
        name: 'ab',
      });
      const error = invalidUser.validateSync();

      expect(error?.errors.name).toBeDefined();
    });

    it('deve criar usuário com dados válidos', () => {
      const validUser = new User({
        email: 'attendant@lab.com',
        password: 'senha123',
        name: 'Maria Atendente',
        role: UserRole.ATTENDANT,
      });
      const error = validUser.validateSync();

      expect(error).toBeUndefined();
      expect(validUser.email).toBe('attendant@lab.com');
      expect(validUser.role).toBe(UserRole.ATTENDANT);
      expect(validUser.isActive).toBe(true);
    });
  });

  describe('Default values', () => {
    it('deve ter role ATTENDANT por padrão', () => {
      const user = new User({
        email: 'test@lab.com',
        password: 'senha123',
        name: 'Test User',
      });

      expect(user.role).toBe(UserRole.ATTENDANT);
    });

    it('deve ter isActive true por padrão', () => {
      const user = new User({
        email: 'test@lab.com',
        password: 'senha123',
        name: 'Test User',
      });

      expect(user.isActive).toBe(true);
    });
  });

  describe('Validações de roles', () => {
    it('deve aceitar role ATTENDANT', () => {
      const user = new User({
        email: 'test@lab.com',
        password: 'senha123',
        name: 'Test User',
        role: UserRole.ATTENDANT,
      });
      const error = user.validateSync();

      expect(error).toBeUndefined();
    });

    it('deve aceitar role LAB_ADMIN', () => {
      const user = new User({
        email: 'test@lab.com',
        password: 'senha123',
        name: 'Test User',
        role: UserRole.LAB_ADMIN,
      });
      const error = user.validateSync();

      expect(error).toBeUndefined();
    });

    it('deve aceitar role SUPER_ADMIN', () => {
      const user = new User({
        email: 'test@lab.com',
        password: 'senha123',
        name: 'Test User',
        role: UserRole.SUPER_ADMIN,
      });
      const error = user.validateSync();

      expect(error).toBeUndefined();
    });

    it('deve rejeitar role inválida', () => {
      const user = new User({
        email: 'test@lab.com',
        password: 'senha123',
        name: 'Test User',
        role: 'INVALID_ROLE' as any,
      });
      const error = user.validateSync();

      expect(error?.errors.role).toBeDefined();
    });
  });

  describe('Email validation', () => {
    it('deve aceitar email válido', () => {
      const user = new User({
        email: 'attendant@lab.com',
        password: 'senha123',
        name: 'Test User',
      });
      const error = user.validateSync();

      expect(error?.errors.email).toBeUndefined();
    });

    it('deve rejeitar email sem @', () => {
      const user = new User({
        email: 'attendantlab.com',
        password: 'senha123',
        name: 'Test User',
      });
      const error = user.validateSync();

      expect(error?.errors.email).toBeDefined();
    });

    it('deve rejeitar email sem domínio', () => {
      const user = new User({
        email: 'attendant@',
        password: 'senha123',
        name: 'Test User',
      });
      const error = user.validateSync();

      expect(error?.errors.email).toBeDefined();
    });
  });
});
