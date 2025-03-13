import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { Response } from 'express';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { LoginUserDto } from 'src/users/dtos/login-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  // Mock response object
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: new Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
    };

    it('should register a new user successfully', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      // Act
      const result = await authService.register(createUserDto);

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        _id: expect.any(Types.ObjectId),
        ...createUserDto,
        password: 'hashedPassword',
      });
      expect(result).toEqual({
        user: {
          id: mockUser._id.toString(),
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if database operation fails', async () => {
      // Arrange
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockRejectedValue(new Error('Database error'));
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      // Act & Assert
      await expect(authService.register(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        createUserDto.email,
      );
      expect(mockUsersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginUserDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: new Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
    };

    it('should login user successfully', async () => {
      // Arrange
      const res = mockResponse();
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt-token');

      // Act
      await authService.login(loginUserDto, res);

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: mockUser._id.toString(),
        email: mockUser.email,
      });
      expect(res.cookie).toHaveBeenCalledWith('token', 'jwt-token', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      expect(res.json).toHaveBeenCalledWith({
        user: {
          userId: mockUser._id.toString(),
          email: mockUser.email,
          name: mockUser.name,
        },
      });
    });

    it('should throw BadRequestException if user is not found', async () => {
      // Arrange
      const res = mockResponse();
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginUserDto, res)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      // Arrange
      const res = mockResponse();
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Act & Assert
      await expect(authService.login(loginUserDto, res)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if JWT signing fails', async () => {
      // Arrange
      const res = mockResponse();
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockImplementation(() => {
        throw new Error('JWT signing error');
      });

      // Act & Assert
      await expect(authService.login(loginUserDto, res)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        loginUserDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginUserDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const res = mockResponse();

      // Act
      await authService.logout(res);

      // Assert
      expect(res.clearCookie).toHaveBeenCalledWith('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    it('should throw InternalServerErrorException if logout fails', async () => {
      // Arrange
      const res = mockResponse();
      res.clearCookie = jest.fn().mockImplementation(() => {
        throw new Error('Cookie error');
      });

      // Act & Assert
      await expect(authService.logout(res)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      // Arrange
      const token = 'valid-token';
      const decodedToken = { userId: 'user-id', email: 'test@example.com' };
      mockJwtService.verify.mockReturnValue(decodedToken);

      // Act
      const result = await authService.verifyToken(token);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(decodedToken);
    });

    it('should throw UnauthorizedException if token is not provided', async () => {
      // Act & Assert
      await expect(authService.verifyToken('')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      // Arrange
      const token = 'invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token verification error');
      });

      // Act & Assert
      await expect(authService.verifyToken(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });
  });
});
