import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingDto } from './dtos/booking.dto';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('account')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('bookings')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Book an accommodation' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async bookAccommodation(
    @Req() req: AuthenticatedRequest,
    @Body() bookingDto: BookingDto,
  ) {
    return this.bookingService.bookAccommodation(req.user, bookingDto);
  }

  @Get('bookings')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all bookings for user' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async showAccommodations(@Req() req: AuthenticatedRequest) {
    return this.bookingService.showAccommodations(req.user);
  }

  @Delete('bookings/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cancel a booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelBooking(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.bookingService.cancelBooking(req.user, id);
  }
}
