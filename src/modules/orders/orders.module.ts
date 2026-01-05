import { Router } from 'express';
import orderRoutes from './order.routes';

export class OrdersModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/orders', orderRoutes);
  }
}

export default new OrdersModule();
