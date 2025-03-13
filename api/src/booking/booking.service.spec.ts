import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getModelToken } from '@nestjs/mongoose';
import { Booking } from './enitites/booking.entity';
import {
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingDto } from './dtos/booking.dto';
import { User } from 'src/users/entities/user.entity';
import { Model, Types } from 'mongoose';

describe('BookingService', () => {
  let service: BookingService;
  let bookingModel: Model<Booking>;

  const mockUser: User = {
    _id: new Types.ObjectId('6123456789abcdef12345678'),
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
  };

  const mockBookingDto: BookingDto = {
    checkIn: '2025-04-01T10:00:00.000Z',
    checkOut: '2025-04-05T12:00:00.000Z',
    numberOfGuests: 2,
    name: 'Test Booking',
    email: 'testemail@gmail.com',
    phone: '+380123456789',
    price: 500,
  };

  const mockBooking = {
    _id: new Types.ObjectId('6123456789abcdef1234567a'),
    user: mockUser._id,
    checkIn: '2025-04-01T10:00:00.000Z',
    checkOut: '2025-04-05T12:00:00.000Z',
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
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
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

  describe('cancelBooking', () => {
    const bookingId = '6123456789abcdef1234567a';
    const mockBookingId = new Types.ObjectId(bookingId);
    const mockBookingWithCorrectUser = {
      _id: mockBookingId,
      user: mockUser._id,
      checkIn: '2025-04-01T10:00:00.000Z',
      checkOut: '2025-04-05T12:00:00.000Z',
      numberOfGuests: 2,
      name: 'Test Booking',
      phone: '+380123456789',
      price: 500,
    };

    const differentUserId = new Types.ObjectId('6123456789abcdef12345679');
    const mockBookingWithDifferentUser = {
      ...mockBookingWithCorrectUser,
      user: differentUserId,
    };

    it('should successfully cancel a booking', async () => {
      mockBookingModel.findById.mockResolvedValue(mockBookingWithCorrectUser);
      mockBookingModel.findByIdAndDelete.mockResolvedValue({
        acknowledged: true,
      });

      const result = await service.cancelBooking(mockUser, bookingId);

      expect(mockBookingModel.findById).toHaveBeenCalledWith(bookingId);
      expect(mockBookingModel.findByIdAndDelete).toHaveBeenCalledWith(
        bookingId,
      );
      expect(result).toEqual({
        success: true,
        message: 'Booking successfully canceled',
      });
    });

    it('should throw UnauthorizedException if user is not provided', async () => {
      await expect(service.cancelBooking(null, bookingId)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockBookingModel.findById).not.toHaveBeenCalled();
      expect(mockBookingModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if booking ID is invalid', async () => {
      await expect(
        service.cancelBooking(mockUser, 'invalid-id'),
      ).rejects.toThrow(BadRequestException);
      expect(mockBookingModel.findById).not.toHaveBeenCalled();
      expect(mockBookingModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if booking is not found', async () => {
      mockBookingModel.findById.mockResolvedValue(null);

      await expect(service.cancelBooking(mockUser, bookingId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockBookingModel.findById).toHaveBeenCalledWith(bookingId);
      expect(mockBookingModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if booking belongs to a different user', async () => {
      mockBookingModel.findById.mockResolvedValue(mockBookingWithDifferentUser);

      await expect(service.cancelBooking(mockUser, bookingId)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockBookingModel.findById).toHaveBeenCalledWith(bookingId);
      expect(mockBookingModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      mockBookingModel.findById.mockResolvedValue(mockBookingWithCorrectUser);
      mockBookingModel.findByIdAndDelete.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.cancelBooking(mockUser, bookingId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockBookingModel.findById).toHaveBeenCalledWith(bookingId);
      expect(mockBookingModel.findByIdAndDelete).toHaveBeenCalledWith(
        bookingId,
      );
    });
  });
});
