import { describe, it, expect, beforeEach } from 'vitest';
import { UserController } from '../controllers/user.controller';

describe('UserController', () => {
  let userController: UserController;

  describe('Instantiation', () => {
    it('deve criar instância do UserController', () => {
      userController = new UserController();
      expect(userController).toBeDefined();
    });
  });

  describe('Methods existence', () => {
    beforeEach(() => {
      userController = new UserController();
    });

    it('deve ter método register', () => {
      expect(userController.register).toBeDefined();
      expect(typeof userController.register).toBe('function');
    });

    it('deve ter método login', () => {
      expect(userController.login).toBeDefined();
      expect(typeof userController.login).toBe('function');
    });

    it('deve ter método getProfile', () => {
      expect(userController.getProfile).toBeDefined();
      expect(typeof userController.getProfile).toBe('function');
    });

    it('deve ter método updateProfile', () => {
      expect(userController.updateProfile).toBeDefined();
      expect(typeof userController.updateProfile).toBe('function');
    });

    it('deve ter método getUserById', () => {
      expect(userController.getUserById).toBeDefined();
      expect(typeof userController.getUserById).toBe('function');
    });

    it('deve ter método updateUser', () => {
      expect(userController.updateUser).toBeDefined();
      expect(typeof userController.updateUser).toBe('function');
    });
  });
});
