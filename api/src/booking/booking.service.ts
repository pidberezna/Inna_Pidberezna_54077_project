import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BookingDto } from './dtos/booking.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Booking } from './enitites/booking.entity';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async bookAccommodation(user: User, bookingDto: BookingDto) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Валідація дат (використовуючи рядкове порівняння або створення об'єктів Date)
    if (new Date(bookingDto.checkIn) >= new Date(bookingDto.checkOut)) {
      throw new BadRequestException(
        'Check-in date must be before check-out date',
      );
    }

    try {
      const newBooking = await this.bookingModel.create({
        user: user._id,
        ...bookingDto,
      });

      return newBooking;
    } catch (error) {
      console.error('Booking error:', error);
      throw new InternalServerErrorException('Could not book accommodation');
    }
  }

  async showAccommodations(user: User) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    try {
      const bookings = await this.bookingModel
        .find({
          user: user._id,
        })
        .populate('place')
        .sort({ createdAt: -1 }); // Сортування за датою створення, найновіші перші

      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw new InternalServerErrorException(
        'Could not retrieve accommodations',
      );
    }
  }

  async cancelBooking(user: User, bookingId: string) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!Types.ObjectId.isValid(bookingId)) {
      throw new BadRequestException('Invalid booking ID');
    }

    try {
      const booking = await this.bookingModel.findById(bookingId);

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Перевірка, чи користувач є власником бронювання
      if (booking.user.toString() !== user._id.toString()) {
        throw new UnauthorizedException(
          'You can only cancel your own bookings',
        );
      }

      // Опціонально: можна додати перевірку, чи не пізно скасовувати (напр., за 24 години)
      // if (new Date(booking.checkIn).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000) {
      //   throw new BadRequestException('Cannot cancel bookings less than 24 hours before check-in');
      // }

      await this.bookingModel.findByIdAndDelete(bookingId);

      return { success: true, message: 'Booking successfully canceled' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error('Error canceling booking:', error);
      throw new InternalServerErrorException('Could not cancel booking');
    }
  }
}
