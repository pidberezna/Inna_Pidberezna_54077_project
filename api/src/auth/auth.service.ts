import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from 'src/users/dtos/login-user.dto';
import { Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = await this.usersService.create({
        _id: new Types.ObjectId(),
        ...createUserDto,
        password: hashedPassword,
      });

      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      console.error('Register error:', error);

      throw new InternalServerErrorException(
        'Registration failed due to server error',
      );
    }
  }

  async login(loginUserDto: LoginUserDto, res: Response) {
    const user = await this.usersService.findByEmail(loginUserDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }

    try {
      const payload = { userId: user._id.toString(), email: user.email };
      const token = await this.jwtService.sign(payload);

      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      return res.json({
        user: {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error('JWT signing error:', error);
      throw new InternalServerErrorException(
        'Authentication failed due to server error',
      );
    }
  }

  async logout(res: Response) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      throw new InternalServerErrorException(
        'Logout failed due to server error',
      );
    }
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('JWT must be provided');
    }

    try {
      return this.jwtService.verify(token);
    } catch (error) {
      console.error('Token verification error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
