import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = req.cookies?.token;

    if (!token) {
      throw new UnauthorizedException('JWT must be provided');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const userIdFromToken = decoded.userId;

      const user = await this.userModel.findById(
        new Types.ObjectId(userIdFromToken),
      );

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req.user = user;
      return true;
    } catch (error) {
      console.error('Error during token verification:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
