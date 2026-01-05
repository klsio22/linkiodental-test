import { Request, Response } from 'express';
import userService from '../services/user.service';
import { asyncHandler } from '../../../common/middlewares/errorHandler';
import { RegisterData, AuthCredentials } from '../types/user.types';

export class UserController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const data: RegisterData = req.body;
    const result = await userService.register(data);
    res.status(201).json({
      status: 'success',
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const credentials: AuthCredentials = req.body;
    const result = await userService.login(credentials);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const user = await userService.getUserById(userId);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const user = await userService.updateUser(userId, req.body);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  });
}

export default new UserController();
