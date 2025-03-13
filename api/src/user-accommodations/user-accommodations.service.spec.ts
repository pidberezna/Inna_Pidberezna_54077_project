import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserAccommodationsService } from './user-accommodations.service';
import { Accommodation } from './entities/user-accommodation.entity';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as download from 'image-downloader';

// Mock modules
jest.mock('fs');
jest.mock('path');
jest.mock('image-downloader');

describe('UserAccommodationsService', () => {
  let service: UserAccommodationsService;
  let accommodationModel: Model<Accommodation>;
  let jwtService: JwtService;

  const mockUser = {
    _id: new Types.ObjectId().toString(),
    email: 'test@example.com',
  };

  const mockAccommodation = {
    _id: new Types.ObjectId().toString(),
    title: 'Test Accommodation',
    address: 'Test Address',
    photos: ['photo1.jpg'],
    description: 'Test Description',
    perks: ['wifi', 'parking'],
    extraInfo: 'Extra info',
    checkIn: '14:00',
    checkOut: '11:00',
    maxGuests: 4,
    price: 100,
    owner: new Types.ObjectId(mockUser._id),
  };

  const mockAccommodationDto = {
    title: 'Test Accommodation',
    address: 'Test Address',
    photos: ['photo1.jpg'],
    description: 'Test Description',
    perks: ['wifi', 'parking'],
    extraInfo: 'Extra info',
    checkIn: '14:00',
    checkOut: '11:00',
    maxGuests: 4,
    price: 100,
  };

  beforeEach(async () => {
    // Create a model factory for mocking Mongoose models
    const mockAccommodationModelFactory = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(), // Added create method
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAccommodationsService,
        {
          provide: getModelToken(Accommodation.name),
          useValue: mockAccommodationModelFactory,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(), verify: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserAccommodationsService>(UserAccommodationsService);
    accommodationModel = module.get<Model<Accommodation>>(
      getModelToken(Accommodation.name),
    );
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks after each test
    jest.clearAllMocks();
  });

  // Перевірка, що сервіс створюється успішно
  // Check if service is created successfully
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Тести для методу uploadByLink
  // Tests for uploadByLink method
  describe('uploadByLink', () => {
    const testLink = 'http://example.com/image.jpg';
    const expectedFileName = 'photo123456789.jpg';

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(123456789);
      jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      (download.image as jest.Mock).mockResolvedValue({});
    });

    // Перевіряємо успішне завантаження зображення
    // Test successful image upload
    it('should upload image by link successfully', async () => {
      const result = await service.uploadByLink(testLink);

      expect(fs.existsSync).toHaveBeenCalled();
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(download.image).toHaveBeenCalledWith({
        url: testLink,
        dest: expect.any(String),
      });
      expect(result).toBe(expectedFileName);
    });

    // Перевіряємо обробку помилки при завантаженні
    // Test error handling during upload
    it('should throw InternalServerErrorException when upload fails', async () => {
      (download.image as jest.Mock).mockRejectedValue(
        new Error('Upload failed'),
      );

      await expect(service.uploadByLink(testLink)).rejects.toThrow(
        'Failed to upload image',
      );
    });
  });

  // Тести для методу uploadFile
  // Tests for uploadFile method
  describe('uploadFile', () => {
    const mockFiles = [
      { filename: 'file1.jpg', path: '/tmp/file1.jpg' },
      { filename: 'file2.jpg', path: '/tmp/file2.jpg' },
    ] as Express.Multer.File[];

    // Перевіряємо успішне завантаження файлів
    // Test successful file upload
    it('should upload files successfully', async () => {
      const result = await service.uploadFile(mockFiles);

      expect(result).toEqual(['file1.jpg', 'file2.jpg']);
    });

    // Перевіряємо випадок, коли файли не були передані
    // Test case when no files are provided
    it('should throw BadRequestException when no files are provided', async () => {
      await expect(service.uploadFile([])).rejects.toThrow('No files uploaded');
    });

    // FIXED: Adjusted the test to match the service implementation
    // Перевіряємо випадок, коли у файлу відсутній шлях
    // Test case when file has no path
    it('should throw InternalServerErrorException when file processing fails', async () => {
      const invalidFiles = [{ filename: 'file.jpg' }] as Express.Multer.File[];

      await expect(service.uploadFile(invalidFiles)).rejects.toThrow(
        'Failed to upload files',
      );
    });
  });

  // Тести для методу createAccommodation
  // Tests for createAccommodation method
  describe('createAccommodation', () => {
    // UPDATED: Fixed test to use create method instead of constructor and save
    // Перевіряємо успішне створення житла
    // Test successful accommodation creation
    it('should create accommodation successfully', async () => {
      const expectedResult = {
        ...mockAccommodationDto,
        _id: new Types.ObjectId().toString(),
        owner: new Types.ObjectId(mockUser._id),
      };

      (accommodationModel.create as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.createAccommodation(
        mockUser as any,
        mockAccommodationDto,
      );

      expect(result).toBeDefined();
      expect(accommodationModel.create).toHaveBeenCalledWith({
        ...mockAccommodationDto,
        owner: expect.any(Types.ObjectId),
      });
    });

    // UPDATED: Fixed test to use create method instead of constructor and save
    // Перевіряємо обробку помилки при створенні
    // Test error handling during creation
    it('should throw InternalServerErrorException when creation fails', async () => {
      (accommodationModel.create as jest.Mock).mockRejectedValue(
        new Error('Creation failed'),
      );

      await expect(
        service.createAccommodation(mockUser as any, mockAccommodationDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // Тести для методу showUserAccommodations
  // Tests for showUserAccommodations method
  describe('showUserAccommodations', () => {
    // Перевіряємо успішне отримання списку житла користувача
    // Test successful retrieval of user accommodations
    it('should return user accommodations successfully', async () => {
      const mockAccommodations = [mockAccommodation];
      (accommodationModel.find as jest.Mock).mockResolvedValue(
        mockAccommodations,
      );

      const result = await service.showUserAccommodations(mockUser as any);

      expect(accommodationModel.find).toHaveBeenCalledWith({
        owner: expect.any(Types.ObjectId),
      });
      expect(result).toEqual(mockAccommodations);
    });

    // Перевіряємо обробку помилки при отриманні списку
    // Test error handling during retrieval
    it('should throw InternalServerErrorException when retrieval fails', async () => {
      (accommodationModel.find as jest.Mock).mockRejectedValue(
        new Error('Retrieval failed'),
      );

      await expect(
        service.showUserAccommodations(mockUser as any),
      ).rejects.toThrow('Could not retrieve accommodations');
    });
  });

  // Тести для методу showAllAccommodations
  // Tests for showAllAccommodations method
  describe('showAllAccommodations', () => {
    // Перевіряємо успішне отримання всіх житлових приміщень
    // Test successful retrieval of all accommodations
    it('should return all accommodations successfully', async () => {
      const mockAccommodations = [mockAccommodation];
      (accommodationModel.find as jest.Mock).mockResolvedValue(
        mockAccommodations,
      );

      const result = await service.showAllAccommodations();

      expect(accommodationModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockAccommodations);
    });

    // Перевіряємо обробку помилки при отриманні всіх житлових приміщень
    // Test error handling during retrieval
    it('should throw InternalServerErrorException when retrieval fails', async () => {
      (accommodationModel.find as jest.Mock).mockRejectedValue(
        new Error('Retrieval failed'),
      );

      await expect(service.showAllAccommodations()).rejects.toThrow(
        'Could not retrieve accommodations',
      );
    });
  });

  // Тести для методу showAccommodationById
  // Tests for showAccommodationById method
  describe('showAccommodationById', () => {
    const accommodationId = new Types.ObjectId().toString();

    // Перевіряємо успішне отримання житла за ідентифікатором
    // Test successful retrieval of accommodation by ID
    it('should return accommodation by ID successfully', async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(
        mockAccommodation,
      );

      const result = await service.showAccommodationById(accommodationId);

      expect(accommodationModel.findById).toHaveBeenCalledWith(accommodationId);
      expect(result).toEqual(mockAccommodation);
    });

    // Перевіряємо випадок, коли ідентифікатор не передано
    // Test case when ID is not provided
    it('should throw BadRequestException when ID is not provided', async () => {
      await expect(service.showAccommodationById('')).rejects.toThrow(
        'Accommodation id must be provided',
      );
    });

    // FIXED: Set up proper conditions instead of mocking the entire method
    // Перевіряємо випадок, коли житло не знайдено
    // Test case when accommodation is not found
    it('should throw NotFoundException when accommodation is not found', async () => {
      // Set up findById to return null
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.showAccommodationById(accommodationId),
      ).rejects.toThrow(NotFoundException);
    });

    // Перевіряємо обробку помилки при пошуку
    // Test error handling during lookup
    it('should throw InternalServerErrorException when lookup fails', async () => {
      (accommodationModel.findById as jest.Mock).mockRejectedValue(
        new Error('Lookup failed'),
      );

      await expect(
        service.showAccommodationById(accommodationId),
      ).rejects.toThrow('Could not retrieve accommodation');
    });
  });

  // Тести для методу saveAccommodation
  // Tests for saveAccommodation method
  describe('saveAccommodation', () => {
    const accommodationId = new Types.ObjectId().toString();

    // FIXED: All tests for saveAccommodation
    // Перевіряємо успішне оновлення житла
    // Test successful accommodation update
    it('should update accommodation successfully', async () => {
      // Set up the mock to return an accommodation with matching owner
      (accommodationModel.findById as jest.Mock).mockResolvedValue({
        ...mockAccommodation,
        owner: new Types.ObjectId(mockUser._id),
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockResolvedValue({
          ...mockAccommodation,
          ...mockAccommodationDto,
        }),
      });

      const result = await service.saveAccommodation(
        mockUser as any,
        accommodationId,
        mockAccommodationDto,
      );

      expect(result).toBeDefined();
    });

    // FIXED: Set up proper conditions instead of mocking the entire method
    // Перевіряємо випадок, коли житло не знайдено
    // Test case when accommodation is not found
    it('should throw NotFoundException when accommodation is not found', async () => {
      // Set up findById to return null
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.saveAccommodation(
          mockUser as any,
          accommodationId,
          mockAccommodationDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    // FIXED: Set up proper conditions instead of mocking the entire method
    // Перевіряємо випадок, коли користувач не є власником житла
    // Test case when user is not the owner
    it('should throw ForbiddenException when user is not the owner', async () => {
      // Return an accommodation with a different owner
      (accommodationModel.findById as jest.Mock).mockResolvedValue({
        ...mockAccommodation,
        owner: new Types.ObjectId(), // Different ID than mockUser._id
      });

      await expect(
        service.saveAccommodation(
          mockUser as any,
          accommodationId,
          mockAccommodationDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    // Перевіряємо обробку помилки при оновленні
    // Test error handling during update
    it('should throw InternalServerErrorException when update fails', async () => {
      // Mock to find the accommodation
      (accommodationModel.findById as jest.Mock).mockResolvedValue({
        ...mockAccommodation,
        owner: new Types.ObjectId(mockUser._id),
        set: jest.fn().mockReturnThis(),
        save: jest.fn().mockRejectedValue(new Error('Update failed')),
      });

      await expect(
        service.saveAccommodation(
          mockUser as any,
          accommodationId,
          mockAccommodationDto,
        ),
      ).rejects.toThrow('Could not update accommodation');
    });
  });
});
