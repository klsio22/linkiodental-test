import { User, IUserDocument } from '../models/User.model';
import { AuthCredentials, RegisterData, IUserAuthResponse, UserRole } from '../types/user.types';
import { AppError } from '../../../common/middlewares/errorHandler';
import jwt from 'jsonwebtoken';
import { config } from '../../../common/config/env';

export class UserService {
  constructor(private readonly userModel = User) {}

  private generateToken(userId: string, role: string): string {
    return jwt.sign({ id: userId, role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  async register(data: RegisterData): Promise<IUserAuthResponse> {
    const existingUser = await this.userModel.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = new this.userModel({
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || UserRole.ATTENDANT,
    });

    const savedUser = await user.save();
    const token = this.generateToken(savedUser._id.toString(), savedUser.role);

    return {
      id: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      token,
    };
  }

  async login(credentials: AuthCredentials): Promise<IUserAuthResponse> {
    const user = await this.userModel.findOne({ email: credentials.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(credentials.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive', 403);
    }

    const token = this.generateToken(user._id.toString(), user.role);

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    };
  }

  async getUserById(userId: string): Promise<IUserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(userId: string, updateData: Partial<IUserDocument>): Promise<IUserDocument> {
    const allowedFields = ['name', 'email', 'isActive'];
    const filteredData: Partial<IUserDocument> = {};
    allowedFields.forEach((field) => {
      if (updateData[field as keyof IUserDocument] !== undefined) {
        filteredData[field as keyof IUserDocument] = updateData[field as keyof IUserDocument];
      }
    });

    const user = await this.userModel.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

export default new UserService();
