import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserAccommodationsService } from './user-accommodations.service';
import { AccommodationDto } from './dtos/user-accommodation.dto';
import { AuthenticatedRequest, AuthGuard } from '../auth/auth.guard';

@Controller('account')
export class UserAccommodationsController {
  constructor(
    private readonly userAccommodationsService: UserAccommodationsService,
  ) {}

  @Post('places')
  @UseGuards(AuthGuard)
  async createAccomodation(
    @Req() req: AuthenticatedRequest,
    @Body() accommodationDto: AccommodationDto,
  ) {
    return this.userAccommodationsService.createAccommodation(
      req.user,
      accommodationDto,
    );
  }

  @Get('places')
  async showAllAccommodations() {
    return await this.userAccommodationsService.showAllAccommodations();
  }

  @Get('places/:id')
  async showAccommodationById(@Param('id') id: string) {
    return await this.userAccommodationsService.showAccommodationById(id);
  }

  @Put('places')
  @UseGuards(AuthGuard)
  async saveAccommodation(
    @Req() req: AuthenticatedRequest,
    @Body('id') id: string,
    @Body() accommodationDto: AccommodationDto,
  ) {
    return await this.userAccommodationsService.saveAccommodation(
      req.user,
      id,
      accommodationDto,
    );
  }
}
