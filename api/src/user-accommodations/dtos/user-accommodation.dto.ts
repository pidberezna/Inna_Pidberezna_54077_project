import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AccommodationDto {
  @ApiProperty({ example: 'Luxury Beach Villa' })
  @IsString()
  title: string;

  @ApiProperty({ example: '123 Ocean Drive, Miami Beach, FL' })
  @IsString()
  address: string;

  @ApiProperty({
    example: ['photo1.jpg', 'photo2.jpg'],
    description: 'Array of photo URLs',
  })
  @IsArray()
  photos: string[];

  @ApiProperty({
    example: 'Beautiful beachfront property with stunning views',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: ['wifi', 'parking', 'pool'] })
  @IsArray()
  perks: string[];

  @ApiPropertyOptional({
    example: 'Close to restaurants and shopping',
    description: 'Additional information',
  })
  @IsString()
  @IsOptional()
  extraInfo?: string;

  @ApiProperty({ example: '14:00', description: 'Check‑in time' })
  @IsString()
  checkIn: string;

  @ApiProperty({ example: '11:00', description: 'Check‑out time' })
  @IsString()
  checkOut: string;

  @ApiProperty({ example: 4, description: 'Maximum number of guests' })
  @Type(() => Number)
  @IsNumber()
  maxGuests: number;

  @ApiProperty({ example: 150, description: 'Price per night' })
  @Type(() => Number)
  @IsNumber()
  price: number;
}
