import { Module } from '@nestjs/common';
import { UserAccommodationsController } from './user-accommodations.controller';
import { UserAccommodationsService } from './user-accommodations.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Accommodation,
  AccommodationSchema,
} from './entities/user-accommodation.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UserPhotosAccommodationsController } from './user-photos-accommodations.controller';

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
      { name: Accommodation.name, schema: AccommodationSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule,
  ],
  controllers: [
    UserAccommodationsController,
    UserPhotosAccommodationsController,
  ],
  providers: [UserAccommodationsService],
})
export class UserAccommodationsModule {}
