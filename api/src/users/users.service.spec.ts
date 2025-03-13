import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  beforeEach(async () => {
    const savedUserMock = {
      _id: new Types.ObjectId(),
      email: 'new@example.com',
      name: 'New User',
      password: 'hashedpassword',
    };

    mockUserModel = function () {
      return {
        save: jest.fn().mockResolvedValue(savedUserMock),
      };
    };

    mockUserModel.findOne = jest.fn().mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(null),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should throw BadRequestException if email already exists', async () => {
      mockUserModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
      }));

      await expect(
        service.create({ email: 'test@example.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and return a user if email is not in use', async () => {
      const newUser = {
        email: 'new@example.com',
        name: 'New User',
        password: 'hashedpassword',
      };

      mockUserModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      const result = await service.create(newUser);

      expect(result).toMatchObject({
        email: 'new@example.com',
        name: 'New User',
        password: 'hashedpassword',
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
      };

      mockUserModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockUser),
      }));

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user found', async () => {
      mockUserModel.findOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: new Types.ObjectId('65123abcd456ef7890123456'),
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
      };

      const result = await service.getProfile(mockUser);

      expect(result).toEqual({
        userId: mockUser._id.toString(),
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should throw NotFoundException if user is null', async () => {
      await expect(service.getProfile(null)).rejects.toThrow(NotFoundException);
    });
  });
});
