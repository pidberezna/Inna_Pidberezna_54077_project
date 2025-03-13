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

@Controller('account')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('bookings')
  @UseGuards(AuthGuard)
  async bookAccommodation(
    @Req() req: AuthenticatedRequest,
    @Body() bookingDto: BookingDto,
  ) {
    return this.bookingService.bookAccommodation(req.user, bookingDto);
  }

  @Get('bookings')
  @UseGuards(AuthGuard)
  async showAccommodations(@Req() req: AuthenticatedRequest) {
    return this.bookingService.showAccommodations(req.user);
  }

  @Delete('bookings/:id')
  @UseGuards(AuthGuard)
  async cancelBooking(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.bookingService.cancelBooking(req.user, id);
  }
}
