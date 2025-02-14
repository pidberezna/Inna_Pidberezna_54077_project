import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDate,
  IsDateString,
} from 'class-validator';
import * as moment from 'moment';

export class BookingDto {
  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsNumber()
  numberOfGuests: number;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsNumber()
  price: number;
}
