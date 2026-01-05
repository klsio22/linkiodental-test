export enum UserRole {
  ATTENDANT = 'ATTENDANT',         // Atendente/Funcionário - pode criar pedidos
  LAB_ADMIN = 'LAB_ADMIN',         // Admin do laboratório
  SUPER_ADMIN = 'SUPER_ADMIN',     // Super admin
}

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAuthResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  role?: UserRole;
}
