import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BookingDto {
  @ApiProperty({
    example: '2025-06-01',
    description: 'Check‑in date (ISO 8601)',
  })
  @IsDateString()
  checkIn: string;

  @ApiProperty({
    example: '2025-06-07',
    description: 'Check‑out date (ISO 8601)',
  })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 2, description: 'Number of guests' })
  @Type(() => Number)
  @IsNumber()
  numberOfGuests: number;

  @ApiProperty({ example: 'John Doe', description: 'Contact full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Contact email' })
  @IsString()
  email: string;

  @ApiProperty({ example: '+1 (555) 123‑4567', description: 'Contact phone' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 1050, description: 'Total price for the stay' })
  @Type(() => Number)
  @IsNumber()
  price: number;
}
