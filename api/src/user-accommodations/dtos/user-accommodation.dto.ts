import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsDate,
  IsDateString,
} from 'class-validator';

export class AccommodationDto {
  @IsString()
  title: string;

  @IsString()
  address: string;

  @IsArray()
  photos: string[];

  @IsString()
  description: string;

  @IsArray()
  perks: string[];

  @IsString()
  @IsOptional()
  extraInfo: string;

  @IsString()
  checkIn: string;

  @IsString()
  checkOut: string;

  @IsNumber()
  maxGuests: number;

  @IsNumber()
  price: number;
}
