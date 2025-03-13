import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: Partial<User>) {
    try {
      const existingUser = await this.userModel.findOne({ email: user.email });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }

      const createdUser = new this.userModel(user);
      return await createdUser.save();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Registration failed.');
    }
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async getProfile(user: User) {
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }
}
