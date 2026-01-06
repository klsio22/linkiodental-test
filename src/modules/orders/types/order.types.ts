export enum OrderState {
  CREATED = 'CREATED',
  ANALYSIS = 'ANALYSIS',
  COMPLETED = 'COMPLETED',
}

export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum ServiceStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export interface Service {
  name: string;
  value: number;
  status: ServiceStatus;
}

export interface Comment {
  content: string;
}

export interface IOrder {
  userId: string;
  lab: string;
  patient: string;
  customer: string;
  services: Service[];
  state: OrderState;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  state?: OrderState;
  status?: OrderStatus;
  patientName?: string;
  dentistName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
