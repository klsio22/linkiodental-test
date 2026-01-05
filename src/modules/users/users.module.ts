import { Router } from 'express';
import userRoutes from './user.routes';

export class UsersModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/users', userRoutes);
  }
}

export default new UsersModule();
