import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './enitites/booking.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Accommodation,
  AccommodationSchema,
} from 'src/user-accommodations/entities/user-accommodation.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
    }),
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
