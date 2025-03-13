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
    const mockAccommodationModelFactory = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

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

    it('should throw InternalServerErrorException when upload fails', async () => {
      (download.image as jest.Mock).mockRejectedValue(
        new Error('Upload failed'),
      );

      await expect(service.uploadByLink(testLink)).rejects.toThrow(
        'Failed to upload image',
      );
    });
  });

  describe('uploadFile', () => {
    const mockFiles = [
      { filename: 'file1.jpg', path: '/tmp/file1.jpg' },
      { filename: 'file2.jpg', path: '/tmp/file2.jpg' },
    ] as Express.Multer.File[];

    it('should upload files successfully', async () => {
      const result = await service.uploadFile(mockFiles);

      expect(result).toEqual(['file1.jpg', 'file2.jpg']);
    });

    it('should throw BadRequestException when no files are provided', async () => {
      await expect(service.uploadFile([])).rejects.toThrow('No files uploaded');
    });

    it('should throw InternalServerErrorException when file processing fails', async () => {
      const invalidFiles = [{ filename: 'file.jpg' }] as Express.Multer.File[];

      await expect(service.uploadFile(invalidFiles)).rejects.toThrow(
        'Failed to upload files',
      );
    });
  });

  describe('createAccommodation', () => {
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

    it('should throw InternalServerErrorException when creation fails', async () => {
      (accommodationModel.create as jest.Mock).mockRejectedValue(
        new Error('Creation failed'),
      );

      await expect(
        service.createAccommodation(mockUser as any, mockAccommodationDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('showUserAccommodations', () => {
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

    it('should throw InternalServerErrorException when retrieval fails', async () => {
      (accommodationModel.find as jest.Mock).mockRejectedValue(
        new Error('Retrieval failed'),
      );

      await expect(
        service.showUserAccommodations(mockUser as any),
      ).rejects.toThrow('Could not retrieve accommodations');
    });
  });

  describe('showAllAccommodations', () => {
    it('should return all accommodations successfully', async () => {
      const mockAccommodations = [mockAccommodation];
      (accommodationModel.find as jest.Mock).mockResolvedValue(
        mockAccommodations,
      );

      const result = await service.showAllAccommodations();

      expect(accommodationModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockAccommodations);
    });

    it('should throw InternalServerErrorException when retrieval fails', async () => {
      (accommodationModel.find as jest.Mock).mockRejectedValue(
        new Error('Retrieval failed'),
      );

      await expect(service.showAllAccommodations()).rejects.toThrow(
        'Could not retrieve accommodations',
      );
    });
  });

  describe('showAccommodationById', () => {
    const accommodationId = new Types.ObjectId().toString();

    it('should return accommodation by ID successfully', async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(
        mockAccommodation,
      );

      const result = await service.showAccommodationById(accommodationId);

      expect(accommodationModel.findById).toHaveBeenCalledWith(accommodationId);
      expect(result).toEqual(mockAccommodation);
    });

    it('should throw BadRequestException when ID is not provided', async () => {
      await expect(service.showAccommodationById('')).rejects.toThrow(
        'Accommodation id must be provided',
      );
    });

    it('should throw NotFoundException when accommodation is not found', async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.showAccommodationById(accommodationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException when lookup fails', async () => {
      (accommodationModel.findById as jest.Mock).mockRejectedValue(
        new Error('Lookup failed'),
      );

      await expect(
        service.showAccommodationById(accommodationId),
      ).rejects.toThrow('Could not retrieve accommodation');
    });
  });

  describe('saveAccommodation', () => {
    const accommodationId = new Types.ObjectId().toString();

    it('should update accommodation successfully', async () => {
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

    it('should throw NotFoundException when accommodation is not found', async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.saveAccommodation(
          mockUser as any,
          accommodationId,
          mockAccommodationDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      (accommodationModel.findById as jest.Mock).mockResolvedValue({
        ...mockAccommodation,
        owner: new Types.ObjectId(),
      });

      await expect(
        service.saveAccommodation(
          mockUser as any,
          accommodationId,
          mockAccommodationDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw InternalServerErrorException when update fails', async () => {
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
