export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  LAB_ADMIN = 'LAB_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
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
