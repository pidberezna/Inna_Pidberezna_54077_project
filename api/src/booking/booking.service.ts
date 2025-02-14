import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
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
    try {
      return await this.bookingModel.create({
        user: user._id,
        ...bookingDto,
      });
    } catch (error) {
      throw new InternalServerErrorException('Could not book accommodation');
    }
  }

  async showAccommodations(user: User) {
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    try {
      return await this.bookingModel
        .find({
          user: user._id,
        })
        .populate('place');
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not retrieve accommodations',
      );
    }
  }
}
