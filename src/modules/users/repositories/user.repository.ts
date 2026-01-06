import { User, IUserDocument } from '../models/User.model';

export interface IUserRepository {
  findById(userId: string): Promise<IUserDocument | null>;
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByEmailWithPassword(email: string): Promise<IUserDocument | null>;
  create(userData: Partial<IUserDocument>): Promise<IUserDocument>;
  update(userId: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null>;
  findAll(): Promise<IUserDocument[]>;
}

export class UserRepository implements IUserRepository {
  constructor(private readonly userModel = User) {}

  async findById(userId: string): Promise<IUserDocument | null> {
    return await this.userModel.findById(userId);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await this.userModel.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return await this.userModel.findOne({ email }).select('+password');
  }

  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = new this.userModel(userData);
    return await user.save();
  }

  async update(userId: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return await this.userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async findAll(): Promise<IUserDocument[]> {
    return await this.userModel.find();
  }
}

export default new UserRepository();
