import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../services/user.service';
import { IUserRepository } from '../repositories/user.repository';
import { UserRole } from '../types/user.types';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: Partial<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findByEmailWithPassword: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
    };

    userService = new UserService(mockUserRepository as IUserRepository);
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar novo usuário com role ATTENDANT por padrão', async () => {
      const mockUser = {
        _id: '123',
        email: 'attendant@lab.com',
        name: 'Maria Atendente',
        role: UserRole.ATTENDANT,
      };

      vi.mocked(mockUserRepository.findByEmail!).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create!).mockResolvedValue(mockUser as any);

      const result = await userService.register({
        email: 'attendant@lab.com',
        password: 'senha123',
        name: 'Maria Atendente',
      });

      expect(result).toHaveProperty('token');
      expect(result.email).toBe('attendant@lab.com');
      expect(result.role).toBe(UserRole.ATTENDANT);
    });

    it('deve lançar erro se email já existir', async () => {
      vi.mocked(mockUserRepository.findByEmail!).mockResolvedValue({ email: 'existing@lab.com' } as any);

      await expect(
        userService.register({
          email: 'existing@lab.com',
          password: 'senha123',
          name: 'Test User',
        })
      ).rejects.toThrow('Email already registered');
    });

    it('deve registrar usuário com role LAB_ADMIN quando especificado', async () => {
      const mockUser = {
        _id: '456',
        email: 'admin@lab.com',
        name: 'Admin User',
        role: UserRole.LAB_ADMIN,
      };

      vi.mocked(mockUserRepository.findByEmail!).mockResolvedValue(null);
      vi.mocked(mockUserRepository.create!).mockResolvedValue(mockUser as any);

      const result = await userService.register({
        email: 'admin@lab.com',
        password: 'admin123',
        name: 'Admin User',
        role: UserRole.LAB_ADMIN,
      });

      expect(result.role).toBe(UserRole.LAB_ADMIN);
    });
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockUser = {
        _id: '123',
        email: 'attendant@lab.com',
        name: 'Maria Atendente',
        role: UserRole.ATTENDANT,
        isActive: true,
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(mockUserRepository.findByEmailWithPassword!).mockResolvedValue(mockUser as any);

      const result = await userService.login({
        email: 'attendant@lab.com',
        password: 'senha123',
      });

      expect(result).toHaveProperty('token');
      expect(result.email).toBe('attendant@lab.com');
    });

    it('deve lançar erro com email inválido', async () => {
      vi.mocked(mockUserRepository.findByEmailWithPassword!).mockResolvedValue(null);

      await expect(
        userService.login({
          email: 'invalid@lab.com',
          password: 'senha123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('deve lançar erro com senha inválida', async () => {
      const mockUser = {
        isActive: true,
        comparePassword: vi.fn().mockResolvedValue(false),
      };

      vi.mocked(mockUserRepository.findByEmailWithPassword!).mockResolvedValue(mockUser as any);

      await expect(
        userService.login({
          email: 'attendant@lab.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('deve lançar erro se usuário estiver inativo', async () => {
      const mockUser = {
        isActive: false,
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(mockUserRepository.findByEmailWithPassword!).mockResolvedValue(mockUser as any);

      await expect(
        userService.login({
          email: 'attendant@lab.com',
          password: 'senha123',
        })
      ).rejects.toThrow('User account is inactive');
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário pelo ID', async () => {
      const mockUser = {
        _id: '123',
        email: 'attendant@lab.com',
        name: 'Maria Atendente',
        role: UserRole.ATTENDANT,
      };

      vi.mocked(mockUserRepository.findById!).mockResolvedValue(mockUser as any);

      const result = await userService.getUserById('123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
    });

    it('deve lançar erro se usuário não existir', async () => {
      vi.mocked(mockUserRepository.findById!).mockResolvedValue(null);

      await expect(userService.getUserById('999')).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('deve atualizar apenas campos permitidos', async () => {
      const mockUpdatedUser = {
        _id: '123',
        name: 'Maria Updated',
      };

      vi.mocked(mockUserRepository.update!).mockResolvedValue(mockUpdatedUser as any);

      const result = await userService.updateUser('123', { name: 'Maria Updated' } as any);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith('123', { name: 'Maria Updated' });
    });

    it('deve lançar erro se usuário não existir', async () => {
      vi.mocked(mockUserRepository.update!).mockResolvedValue(null);

      await expect(userService.updateUser('999', { name: 'Test' } as any)).rejects.toThrow('User not found');
    });
  });
});

