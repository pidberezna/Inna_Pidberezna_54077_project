import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getModelToken } from '@nestjs/mongoose';
import { Booking } from './enitites/booking.entity';
import {
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BookingDto } from './dtos/booking.dto';
import { User } from 'src/users/entities/user.entity';
import { Model, Types } from 'mongoose';

describe('BookingService', () => {
  let service: BookingService;
  let bookingModel: Model<Booking>;

  // Мок-дані з правильними типами даних
  const mockUser: User = {
    _id: new Types.ObjectId('6123456789abcdef12345678'),
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    // Додайте інші необхідні властивості User тут
  };

  const mockBookingDto: BookingDto = {
    checkIn: '2025-04-01T10:00:00.000Z', // Тепер це рядок, а не об'єкт Date
    checkOut: '2025-04-05T12:00:00.000Z', // Тепер це рядок, а не об'єкт Date
    numberOfGuests: 2,
    name: 'Test Booking',
    email: 'testemail@gmail.com',
    phone: '+380123456789',
    price: 500,
  };

  const mockBooking = {
    _id: new Types.ObjectId('6123456789abcdef1234567a'),
    user: mockUser._id,
    checkIn: '2025-04-01T10:00:00.000Z', // Формат відповідає IsDateString
    checkOut: '2025-04-05T12:00:00.000Z', // Формат відповідає IsDateString
    numberOfGuests: 2,
    name: 'Test Booking',
    phone: '+380123456789',
    price: 500,
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-03-10'),
  };

  const mockBookingModel = {
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getModelToken(Booking.name),
          useValue: mockBookingModel,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingModel = module.get<Model<Booking>>(getModelToken(Booking.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookAccommodation', () => {
    it('should successfully book an accommodation', async () => {
      mockBookingModel.create.mockResolvedValue(mockBooking);

      const result = await service.bookAccommodation(mockUser, mockBookingDto);

      expect(mockBookingModel.create).toHaveBeenCalledWith({
        user: mockUser._id,
        ...mockBookingDto,
      });
      expect(result).toEqual(mockBooking);
    });

    it('should throw UnauthorizedException if user is not provided', async () => {
      await expect(
        service.bookAccommodation(null, mockBookingDto),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockBookingModel.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if booking creation fails', async () => {
      mockBookingModel.create.mockRejectedValue(new Error('Database error'));

      await expect(
        service.bookAccommodation(mockUser, mockBookingDto),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockBookingModel.create).toHaveBeenCalled();
    });
  });

  describe('showAccommodations', () => {
    it('should return all accommodations for a user', async () => {
      // Налаштування повного ланцюжка методів з правильним поверненням значення
      const mockSort = jest.fn().mockResolvedValue([mockBooking]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      mockBookingModel.find.mockReturnValue({ populate: mockPopulate });

      const result = await service.showAccommodations(mockUser);

      expect(mockBookingModel.find).toHaveBeenCalledWith({
        user: mockUser._id,
      });
      expect(mockPopulate).toHaveBeenCalledWith('place');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([mockBooking]);
    });

    it('should throw UnauthorizedException if user is not provided', async () => {
      await expect(service.showAccommodations(null)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockBookingModel.find).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if finding bookings fails', async () => {
      // Налаштування кожного методу в ланцюжку для тестування помилки
      const mockSort = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      mockBookingModel.find.mockReturnValue({ populate: mockPopulate });

      await expect(service.showAccommodations(mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockBookingModel.find).toHaveBeenCalled();
      expect(mockPopulate).toHaveBeenCalledWith('place');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
