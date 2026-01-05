export enum OrderState {
  CREATED = 'CREATED',
  ANALYSIS = 'ANALYSIS',
  COMPLETED = 'COMPLETED',
}

export interface IOrder {
  patientName: string;
  dentistName: string;
  services: string[];
  totalValue: number;
  deadline: Date;
  state: OrderState;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  state?: OrderState;
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
